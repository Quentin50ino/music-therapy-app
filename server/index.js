require('dotenv').config();
const express = require('express');
const http = require('http');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SpotifyWebApi = require('spotify-web-api-node'); 
const cors = require('cors');
const axios = require('axios'); 
const crypto = require('crypto'); // Per l'hashing deterministico

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000", 
  credentials: true
}));
app.use(express.json()); 

const server = http.createServer(app);

// --- GEMINI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let geminiModel;
try {
    geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
} catch (e) {
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fallback a 1.5 se 2.5 non esiste
}

// --- SPOTIFY TOKEN SETUP ---
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

let spotifyToken = null;
const refreshSpotifyToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyToken = data.body['access_token'];
    console.log('Token Spotify aggiornato');
  } catch (err) {
    console.error('Errore Token Spotify:', err.message);
  }
};
refreshSpotifyToken();
setInterval(refreshSpotifyToken, 1000 * 60 * 50);

// --- TEORIA MUSICALE ---
const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MODES = ['Major', 'Minor'];

// --- FUNZIONE DETERMINISTICA PER LA CHIAVE ---
// Se non abbiamo dati reali, usiamo l'hash del titolo per dare una chiave "fissa" per quella canzone.
function getDeterministicKey(artist, track) {
    const input = `${artist}-${track}`.toLowerCase();
    const hash = crypto.createHash('md5').update(input).digest('hex');
    
    // Prendiamo i primi byte dell'hash per scegliere nota e modo
    const decimal = parseInt(hash.substring(0, 2), 16);
    
    const noteIndex = decimal % 12;
    const modeIndex = (decimal % 24) >= 12 ? 1 : 0; // 50% probabilità

    return `${PITCH_CLASSES[noteIndex]} ${MODES[modeIndex]}`;
}

// --- SPOTIFY SEARCH ---
async function searchSpotifyTrack(query) {
    if (!spotifyToken) throw new Error("Token non pronto");

    // NOTA: Endpoint di ricerca standard
    const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { 'Authorization': `Bearer ${spotifyToken}` },
        params: { q: query, type: 'track', limit: 1 }
    });

    return response.data.tracks.items;
}

// --- FUNZIONE LAST.FM ESTESA ---
async function getTrackInfoLastFM(artist, trackName, geminiMood) {
    const apiKey = process.env.LASTFM_API_KEY;
    
    let resultKey = null;
    let tags = [];
    let duration = 0;

    if (apiKey) {
        try {
            console.log(`[Last.fm] Analizzo: ${trackName} - ${artist}`);
            const url = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(trackName)}&format=json`;

            const response = await axios.get(url, { timeout: 3000 });
            
            if (response.data && response.data.track) {
                // Estrai Tags
                if(response.data.track.toptags && response.data.track.toptags.tag) {
                    const tagData = response.data.track.toptags.tag;
                    const tagArray = Array.isArray(tagData) ? tagData : [tagData];
                    tags = tagArray.map(t => t.name);

                    // TENTATIVO DI ESTRARRE CHIAVE DAI TAG (es. "C Major")
                    // Cerca tag che sembrano chiavi musicali
                    const keyRegex = /^([A-G][#b]?)\s?(major|minor|m|maj)$/i;
                    const foundTag = tags.find(t => keyRegex.test(t));
                    if (foundTag) {
                        // Normalizza (es. "c minor" -> "C Minor")
                        const match = foundTag.match(keyRegex);
                        const note = match[1].toUpperCase().replace('B', 'b'); // Handle flat notation if needed
                        const mode = (match[2].toLowerCase().startsWith('m') && match[2] !== 'major') ? 'Minor' : 'Major';
                        resultKey = `${note} ${mode}`;
                        console.log(`[Last.fm] Chiave trovata nei tag: ${resultKey}`);
                    }
                }
                duration = response.data.track.duration || 0;
            }
        } catch (error) {
            console.error(`[Last.fm] Errore API: ${error.message}`);
        }
    }

    // FALLBACK DETERMINISTICO SE NON TROVATA
    if (!resultKey) {
        resultKey = getDeterministicKey(artist, trackName);
        console.log(`[System] Chiave generata (fallback): ${resultKey}`);
    }

    // Stima BPM da Gemini Mood (Energia)
    let estimatedBPM = 100;
    if (geminiMood && geminiMood.energy) {
        estimatedBPM = Math.round(60 + (geminiMood.energy * 120));
    }

    return {
        source: apiKey ? "Last.fm + Logic" : "Fallback Logic",
        tags: tags.slice(0, 5),
        bpm: estimatedBPM,
        mood: geminiMood,
        key: resultKey, // ECCOLA!
        duration_ms: duration
    };
}

// --- API CHAT ENDPOINT ---
app.post('/chat', async (req, res) => {
    try {
        const userText = req.body.message;
        if (!userText) return res.status(400).json({ error: "Messaggio vuoto" });

        // 1. GEMINI: Analisi Emotiva
        const prompt = `You are the "DJ Therapist".
            INPUT: "${userText}"
            Create a JSON response:
            {
            "reply": "Brief empathetic reply (max 20 words).",
            "searchQuery": "Spotify search query for a song matching the mood.",
            "mood": { "valence": 0.5, "energy": 0.5 }
            }`;

        const result = await geminiModel.generateContent(prompt);
        let textResponse = await result.response.text();
        
        // Pulizia JSON (Gemini a volte mette backticks)
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(textResponse);

        let trackInfo = null;
        let analysisData = null;
        
        try {
            // 2. SPOTIFY: Trova la canzone
            const tracks = await searchSpotifyTrack(aiData.searchQuery);
            
            if (tracks && tracks.length > 0) {
                const track = tracks[0];
                console.log(`🎵 Canzone scelta: ${track.name} - ${track.artists[0].name}`);

                // 3. LAST.FM + LOGICA: Ottieni Metadata e Chiave
                analysisData = await getTrackInfoLastFM(track.artists[0].name, track.name, aiData.mood);

                trackInfo = {
                    id: track.id,
                    title: track.name,
                    artist: track.artists[0].name,
                    cover: track.album.images[0]?.url,
                    preview: track.preview_url,
                    key: analysisData.key // Passiamo la chiave al Frontend!
                };
            }
        } catch (err) {
            console.error("Errore flusso musica:", err.message);
        }

        // Risposta al Frontend
        res.json({
            reply: aiData.reply,
            track: trackInfo,
            analysis: analysisData
        });

    } catch (error) {
        console.error("Errore Server:", error);
        res.status(500).json({ 
            reply: "Qualcosa è andato storto nei miei circuiti.",
            mood: { valence: 0.5, energy: 0.5 } 
        });
    }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});