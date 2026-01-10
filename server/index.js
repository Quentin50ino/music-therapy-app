require('dotenv').config();
const express = require('express');
const http = require('http');
// const { Server } = require("socket.io"); // NON SERVE PIÙ, PUOI RIMUOVERLO
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SpotifyWebApi = require('spotify-web-api-node'); 
const cors = require('cors');
const axios = require('axios'); 

const app = express();

// --- MIDDLEWARE FONDAMENTALI ---
app.use(cors()); 
app.use(express.json()); // <--- IMPORTANTISSIMO: Senza questo req.body è vuoto!

const server = http.createServer(app);

// --- GEMINI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let geminiModel;
try {
    geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
} catch (e) {
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
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
    console.log('✅ Token Spotify aggiornato');
  } catch (err) {
    console.error('❌ Errore Token Spotify:', err.message);
  }
};
refreshSpotifyToken();
setInterval(refreshSpotifyToken, 1000 * 60 * 50);

// --- FUNZIONE RICERCA SPOTIFY ---
async function searchSpotifyTrack(query) {
    if (!spotifyToken) throw new Error("Token non pronto");

    const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: '1'
    });

    // URL Standard
    const url = `https://api.spotify.com/v1/search?${params.toString()}`;
    
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
    });

    if (!response.ok) throw new Error(`Spotify Error`);
    const data = await response.json();
    return data.tracks.items;
}

// --- FUNZIONE LAST.FM / ANALISI ---
async function getAudioFeaturesExternal(artist, trackName, geminiMood) {
    const apiKey = process.env.LASTFM_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ Manca LASTFM_API_KEY. Uso fallback.");
        return createFallbackData(geminiMood);
    }

    try {
        console.log(`⏳ [Last.fm] Analizzo: ${trackName} - ${artist}`);
        const url = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(trackName)}&format=json`;

        const response = await axios.get(url, { timeout: 3000 });
        
        let tags = [];
        let duration = 0;

        if (response.data && response.data.track) {
            if(response.data.track.toptags && response.data.track.toptags.tag) {
                const tagData = response.data.track.toptags.tag;
                if (Array.isArray(tagData)) {
                    tags = tagData.map(t => t.name).slice(0, 5);
                } else if (tagData.name) {
                    tags = [tagData.name];
                }
            }
            duration = response.data.track.duration || 0;
        }

        let estimatedBPM = 100;
        if (geminiMood && geminiMood.energy) {
            estimatedBPM = Math.round(60 + (geminiMood.energy * 120));
        }

        return {
            source: "Last.fm + Gemini Logic",
            tags: tags,
            bpm: estimatedBPM,
            mood: geminiMood,
            duration_ms: duration
        };

    } catch (error) {
        console.error(`❌ [Last.fm] Errore: ${error.message}`);
        return createFallbackData(geminiMood);
    }
}

function createFallbackData(geminiMood) {
    return {
        source: "Fallback Gemini",
        tags: ["music"],
        bpm: geminiMood ? Math.round(60 + (geminiMood.energy * 120)) : 100,
        mood: geminiMood || { valence: 0.5, energy: 0.5 }
    };
}

// ==========================================================
// --- API ENDPOINT (Sostituisce Socket.io) ---
// ==========================================================
app.post('/chat', async (req, res) => {
    try {
        // 1. Leggiamo il messaggio dal BODY della richiesta
        const userText = req.body.message;
        console.log("📩 Messaggio ricevuto:", userText);

        if (!userText) {
            return res.status(400).json({ error: "Messaggio vuoto" });
        }

        // --- 2. GEMINI ---
        const prompt = `
            Sei un DJ terapeuta. Analizza: "${userText}".
            Rispondi SOLO JSON valido.
            {
              "reply": "risposta empatica (max 15 parole)",
              "searchQuery": "frase ricerca spotify (es: 'sad piano melancholic')",
              "mood": { "valence": 0.5, "energy": 0.5 }
            }
        `;

        let result = await geminiModel.generateContent(prompt);
        let textResponse = await result.response.text();
        
        // Pulizia JSON
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        if(textResponse.indexOf('{') > 0) textResponse = textResponse.substring(textResponse.indexOf('{'));
        if(textResponse.lastIndexOf('}') < textResponse.length - 1) textResponse = textResponse.substring(0, textResponse.lastIndexOf('}') + 1);
        
        const aiData = JSON.parse(textResponse);

        // --- 3. SPOTIFY & LAST.FM ---
        let trackInfo = null;
        let audioAnalysis = null;
        
        try {
            const tracks = await searchSpotifyTrack(aiData.searchQuery);
            if (tracks && tracks.length > 0) {
                const track = tracks[0];
                console.log(`🎵 Trovata: ${track.name}`);

                audioAnalysis = await getAudioFeaturesExternal(track.artists[0].name, track.name, aiData.mood);

                trackInfo = {
                    id: track.id,
                    title: track.name,
                    artist: track.artists[0].name,
                    cover: track.album.images[0]?.url,
                    preview: track.preview_url
                };
            }
        } catch (err) {
            console.error("Errore Musica:", err.message);
        }

        // --- 4. RISPOSTA HTTP ---
        // Invece di socket.emit, usiamo res.json
        res.json({
            reply: aiData.reply,
            track: trackInfo,
            analysis: audioAnalysis
        });

    } catch (error) {
        console.error("❌ Errore Server:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

server.listen(3001, () => {
  console.log('🚀 Server API pronto su http://localhost:3001');
});