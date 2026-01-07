require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SpotifyWebApi = require('spotify-web-api-node'); 
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- GEMINI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let geminiModel;
try {
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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

// --- NUOVA FUNZIONE DI RICERCA (Search API invece di Recommendations) ---
async function searchSpotifyTrack(query) {
    if (!spotifyToken) throw new Error("Token non pronto");

    // Costruiamo la URL per la ricerca testuale
    const params = new URLSearchParams({
        q: query,       // Es: "sad piano music"
        type: 'track',  // Cerchiamo canzoni
        limit: '1'      // Ne vogliamo una sola
    });

    const url = `https://api.spotify.com/v1/search?${params.toString()}`;
    console.log(`🔎 Cerco su Spotify: "${query}" -> ${url}`);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${spotifyToken}`
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Spotify API Error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data.tracks.items; // Nota: la struttura qui è tracks.items
}

io.on('connection', (socket) => {
  console.log('🔌 Utente connesso');

  socket.on('userMessage', async (text) => {
    try {
      console.log("Utente dice:", text);

      // 1. Chiediamo a Gemini non numeri, ma PAROLE CHIAVE
      const prompt = `
        Sei un DJ terapeuta. Analizza: "${text}".
        
        Rispondi SOLO JSON valido.
        {
          "reply": "risposta empatica (max 15 parole)",
          "searchQuery": "una frase di ricerca in inglese per trovare una canzone su Spotify adatta all'umore (es: 'sad piano melancholic', 'energetic pop hits', 'calm ambient meditation')",
          "mood": {
             "valence": (0.0 a 1.0 - serve solo per la grafica),
             "energy": (0.0 a 1.0 - serve solo per la grafica)
          }
        }
      `;

      let result;
      try {
          result = await geminiModel.generateContent(prompt);
      } catch (e) {
          const fallback = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          result = await fallback.generateContent(prompt);
      }

      let textResponse = await result.response.text();
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      // Pulizia JSON aggressiva
      if(textResponse.indexOf('{') > 0) textResponse = textResponse.substring(textResponse.indexOf('{'));
      if(textResponse.lastIndexOf('}') < textResponse.length - 1) textResponse = textResponse.substring(0, textResponse.lastIndexOf('}') + 1);

      const aiData = JSON.parse(textResponse);
      console.log("🧠 Gemini Search Query:", aiData.searchQuery);

      // 2. Chiamata Spotify SEARCH (Molto più stabile)
      let trackId = null;
      try {
          // Usiamo la frase generata da Gemini per cercare la canzone
          const tracks = await searchSpotifyTrack(aiData.searchQuery);
          
          if (tracks && tracks.length > 0) {
              trackId = tracks[0].id;
              console.log(`🎵 Trovata: ${tracks[0].name} - ${tracks[0].artists[0].name}`);
          } else {
              console.log("⚠️ Nessuna traccia, provo fallback");
              const backup = await searchSpotifyTrack('relaxing music');
              if(backup.length > 0) trackId = backup[0].id;
          }
      } catch (spotifyErr) {
          console.error("❌ Errore Spotify:", spotifyErr.message);
      }

      socket.emit('botResponse', {
        reply: aiData.reply,
        trackId: trackId,
        mood: aiData.mood
      });

    } catch (error) {
      console.error("❌ Errore Generale:", error);
      socket.emit('botResponse', { 
        reply: "Sono qui, ascoltiamo qualcosa di rilassante.", 
        trackId: "4uLU6hMCjMI75M1A2tKUQC", // Never Gonna Give You Up come fallback estremo (o cambiala con una classica)
        mood: { valence: 0.5, energy: 0.5 }
      });
    }
  });
});

server.listen(3001, () => {
  console.log('🚀 Server Search-API avviato su http://localhost:3001');
});