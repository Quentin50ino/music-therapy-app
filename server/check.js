require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Checking available models...");

import('node-fetch').then(({ default: fetch }) => {
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("ERROR API:", data.error.message);
        } else {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => {
                if(m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`${m.name.replace('models/', '')}`);
                }
            });
        }
    })
    .catch(err => console.error("Network Error:", err));
}).catch(() => {
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.models) {
             console.log("AVAILABLE MODELS:");
             data.models.forEach(m => {
                if(m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("Response:", data);
        }
    });
});