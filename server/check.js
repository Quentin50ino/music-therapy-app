require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Chiedo a Google la lista dei modelli disponibili...");

import('node-fetch').then(({ default: fetch }) => {
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("❌ ERRORE API:", data.error.message);
        } else {
            console.log("✅ MODELLI DISPONIBILI PER TE:");
            data.models.forEach(m => {
                // Mostra solo i modelli che generano contenuto (non quelli per l'embedding)
                if(m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`👉 ${m.name.replace('models/', '')}`);
                }
            });
        }
    })
    .catch(err => console.error("Errore di rete:", err));
}).catch(() => {
    // Fallback se node-fetch non è installato, usiamo la fetch nativa di Node 18+
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.models) {
             console.log("✅ MODELLI DISPONIBILI PER TE:");
             data.models.forEach(m => {
                if(m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`👉 ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("Risposta:", data);
        }
    });
});