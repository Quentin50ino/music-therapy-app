require('dotenv').config();
const express = require('express');
const http = require('http');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SpotifyWebApi = require('spotify-web-api-node'); 
const cors = require('cors');
const axios = require('axios'); 

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000", 
  credentials: true
}));
app.use(express.json()); 

const server = http.createServer(app);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

let spotifyToken = null;
const refreshSpotifyToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyToken = data.body['access_token'];
    console.log('Spotify Token updated');
  } catch (err) {
    console.error('Spotify Token Error:', err.message);
  }
};
refreshSpotifyToken();
setInterval(refreshSpotifyToken, 1000 * 60 * 50);

function cleanGeminiJSON(text) {
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace >= 0) {
        clean = clean.substring(firstBrace, lastBrace + 1);
    }
    return clean;
}

async function searchSpotifyTrack(query) {
    if (!spotifyToken) throw new Error("Spotify Token not ready");
    const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { 'Authorization': `Bearer ${spotifyToken}` },
        params: { q: query, type: 'track', limit: 1 }
    });
    return response.data.tracks.items;
}

async function getMusicAnalysisWithGemini(artist, title) {
    try {
        console.log(`Analyzing: "${title}" by ${artist}`);
        
        const prompt = `
        Act as an expert Musicologist.
        Analyze the song: "${title}" by "${artist}".
        
        Return ONLY a valid JSON object (no markdown) with these keys:
        - "key": The precise musical key (e.g., "C Major", "F# Minor").
        - "bpm": Tempo in BPM (integer).
        - "mood": { "valence": (0.0 to 1.0), "energy": (0.0 to 1.0) }.
        - "tags": Array of 5 strings (genre, vibe).

        If unsure, estimate based on the artist's style.
        `;

        const result = await geminiModel.generateContent(prompt);
        const text = cleanGeminiJSON(result.response.text());
        return JSON.parse(text);

    } catch (e) {
        console.error("Musicologist Error:", e.message);
        return { 
            key: "C Major", 
            bpm: 100, 
            mood: {valence: 0.5, energy: 0.5}, 
            tags: ["music", "fallback"] 
        };
    }
}

app.post('/chat', async (req, res) => {
    try {
        const userText = req.body.message;
        console.log("User Input:", userText);

        if (!userText) return res.status(400).json({ error: "Empty message" });

        const therapistPrompt = `
        You are the "DJ Therapist," an advanced AI specialized in Musicotherapy.
        
        ### INPUT:
        "${userText}"

        ### INSTRUCTIONS:
        1. Analyze Sentiment.
        2. Formulate a brief, empathetic reply in ENGLISH (max 20 words).
        3. Create a Spotify search query for a song.
        
        ### SONG SELECTION RULES (STRICT):
        - The song MUST be a **famous, commercial, mainstream track** (Pop, Rock, R&B, Jazz, Soul, Indie).
        - The song MUST have a specific Author and Title.
        - **DO NOT** suggest white noise, rain sounds, binaural beats, meditation frequencies, or generic instrumental loops.
        - **DO NOT** suggest obscure or unknown tracks.
        
        ### JSON OUTPUT FORMAT:
        {
          "reply": "String (English)",
          "searchQuery": "String (Artist - Title)",
          "mood": { "valence": Float, "energy": Float }
        }

        RETURN ONLY JSON. NO MARKDOWN.
        `;

        const chatResult = await geminiModel.generateContent(therapistPrompt);
        const chatClean = cleanGeminiJSON(chatResult.response.text());
        
        let chatJson;
        try {
            chatJson = JSON.parse(chatClean);
        } catch (parseError) {
            console.error("JSON Parse Error:", chatClean);
            throw new Error("Invalid JSON from Gemini Chat");
        }

        let trackInfo = null;
        let analysisData = {
            source: "Gemini Emotion",
            key: "C Major",
            bpm: 100,
            mood: chatJson.mood || { valence: 0.5, energy: 0.5 },
            tags: []
        };

        if (chatJson.searchQuery) {
            try {
                console.log(`Spotify Search: "${chatJson.searchQuery}"`);
                const tracks = await searchSpotifyTrack(chatJson.searchQuery);

                if (tracks && tracks.length > 0) {
                    const track = tracks[0];
                    const artistName = track.artists[0].name;
                    const trackTitle = track.name;
                    
                    console.log(`Found: "${trackTitle}" - ${artistName}`);

                    const musicData = await getMusicAnalysisWithGemini(artistName, trackTitle);

                    analysisData = {
                        source: "Gemini Musicologist",
                        key: musicData.key,
                        bpm: musicData.bpm,
                        mood: musicData.mood,
                        tags: musicData.tags,
                        duration_ms: track.duration_ms
                    };

                    trackInfo = {
                        id: track.id,
                        title: trackTitle,
                        artist: artistName,
                        cover: track.album.images[0]?.url,
                        preview: track.preview_url,
                        key: musicData.key
                    };
                } else {
                    console.log("No tracks found on Spotify.");
                }
            } catch (spotifyErr) {
                console.error("Spotify Search Error:", spotifyErr.message);
            }
        }

        res.json({
            reply: chatJson.reply,
            track: trackInfo,
            analysis: analysisData
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ 
            reply: "I am having some technical trouble. Please try again.",
            error: error.message 
        });
    }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});