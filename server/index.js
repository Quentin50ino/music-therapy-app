require('dotenv').config();
const express = require('express');
const http = require('http');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SpotifyWebApi = require('spotify-web-api-node'); 
const cors = require('cors');
const axios = require('axios'); 

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

const server = http.createServer(app);

// In development we allow everything from localhost:3000
// In production, set CLIENT_URL in environment variables (client side .env file)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000", 
  credentials: true
}));

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
    console.log('Token Spotify aggiornato');
  } catch (err) {
    console.error('Errore Token Spotify:', err.message);
  }
};
refreshSpotifyToken();
setInterval(refreshSpotifyToken, 1000 * 60 * 50);

// --- SPOTIFY SEARCH FUNCTION ---
async function searchSpotifyTrack(query) {
    if (!spotifyToken) throw new Error("Token non pronto");

    const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: '1'
    });

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
        console.warn("Manca LASTFM_API_KEY. Uso fallback.");
        return createFallbackData(geminiMood);
    }

    try {
        console.log(`[Last.fm] Analizzo: ${trackName} - ${artist}`);
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
        console.error(`[Last.fm] Errore: ${error.message}`);
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


// --- API ENDPOINT ---
app.post('/chat', async (req, res) => {
    try {
        const userText = req.body.message;
        console.log("Messaggio ricevuto:", userText);

        if (!userText) {
            return res.status(400).json({ error: "Messaggio vuoto" });
        }

        //Old promt (commented because was too simple and didn't give good results)
        /*const prompt = `
            Sei un DJ terapeuta. Analizza: "${userText}".
            Rispondi SOLO JSON valido.
            {
              "reply": "risposta empatica (max 15 parole)",
              "searchQuery": "frase ricerca spotify (es: 'sad piano melancholic')",
              "mood": { "valence": 0.5, "energy": 0.5 }
            }
        `;*/

        const prompt = `You are the "DJ Therapist," an advanced AI specialized in Musicotherapy, Sentiment Analysis, and Emotional Regulation. Your goal is to analyze the user's input to understand their emotional state and provide an immediate therapeutic response combined with a precise musical prescription.

            ### INPUT:
            "${userText}"

            ### INSTRUCTIONS:
            1.  **Analyze Sentiment:** Deeply analyze the subtext, tone, and explicit emotion of the user's input.
            2.  **Formulate Reply:** Create a brief, empathetic, and validating response. Do not offer solutions; offer understanding.
            3.  **Curate Music:** Generate a specific Spotify search query optimized to resonate with the user's current state (Iso-principle) or gently guide them toward a better state. Use keywords regarding genre, instrument, and vibe.
            4.  **Map Mood:** Quantify the emotion using the Russell Circumplex Model of Affect (Valence vs. Energy).

            ### JSON OUTPUT FORMAT SPECIFICATIONS:
            You must respond with ONLY valid, raw JSON. Do not include markdown formatting (like \`\`\`json), explanations, or extra text.

            The JSON object must have these exact keys:
            - "reply": (String) A short, warm, human-like response (max 20 words). It must feel like a hug or a nod of understanding.
            - "searchQuery": (String) A string of English keywords optimized for Spotify search. Format: "[Genre] [Vibe] [Instrument/Tempo]". Example: "Ambient piano melancholic rain" or "Upbeat funk energetic brass".
            - "mood": (Object)
                - "valence": (Float between 0.0 and 1.0) 0.0 is negative/unpleasant (sad, angry), 1.0 is positive/pleasant (happy, calm).
                - "energy": (Float between 0.0 and 1.0) 0.0 is low arousal (sleepy, calm), 1.0 is high arousal (excited, angry).

            ### EXAMPLES:

            **User:** "I feel completely overwhelmed by work, I can't breathe."
            **Output:**
            {
            "reply": "It sounds incredibly heavy right now. Let's take a moment to slow everything down.",
            "searchQuery": "Ambient drone binaural 432hz calm anxiety relief",
            "mood": { "valence": 0.2, "energy": 0.8 }
            }

            **User:** "I finally got that promotion! I'm on top of the world!"
            **Output:**
            {
            "reply": "That is fantastic news! Let's celebrate that energy and keep the vibes high.",
            "searchQuery": "Nu-disco funk upbeat celebration happy",
            "mood": { "valence": 0.9, "energy": 0.9 }
            }

            **User:** "I feel empty and lonely today."
            **Output:**
            {
            "reply": "I hear you. It's okay to sit with these feelings. Here is some company.",
            "searchQuery": "Neo-classical cello slow melancholic solitude",
            "mood": { "valence": 0.1, "energy": 0.2 }
            }

            ### YOUR RESPONSE:
            `;

        let result = await geminiModel.generateContent(prompt);
        let textResponse = await result.response.text();
        
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        if(textResponse.indexOf('{') > 0) textResponse = textResponse.substring(textResponse.indexOf('{'));
        if(textResponse.lastIndexOf('}') < textResponse.length - 1) textResponse = textResponse.substring(0, textResponse.lastIndexOf('}') + 1);
        
        const aiData = JSON.parse(textResponse);

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

        res.json({
            reply: aiData.reply,
            track: trackInfo,
            analysis: audioAnalysis
        });

    } catch (error) {
        console.error("Errore API Gemini:", error);

        // ERROR 429 (RATE LIMIT)
        if (error.status === 429 || error.message.includes('Too Many Requests')) {
            console.log("⚠️ Quota superata. Invio risposta di fallback.");
            
            return res.json({
            reply: "Sto riflettendo troppo intensamente e ho bisogno di una pausa. Riprova tra 30 secondi.",
            searchQuery: "calm patience waiting music",
            mood: { valence: 0.5, energy: 0.3 }
            });
        }

        // Other errors (different from rate limit)
        res.status(500).json({ 
            reply: "Mi dispiace, si è verificato un errore tecnico. Riprova più tardi.",
            searchQuery: "error glitch noise",
            mood: { valence: 0.5, energy: 0.5 }
        });
    }
});

server.listen(3001, () => {
  console.log('Server API listening on http://localhost:3001');
});