# DJ Therapist AI: A Generative Digital Therapeutics Platform

## 1. Abstract
**DJ Therapist AI** is a web-based **Digital Therapeutics (DTx)** application designed to support emotional regulation and mental well-being through the convergence of Artificial Intelligence, Music Therapy, and Generative Art.

The system utilizes a Large Language Model (**Google Gemini**) to analyze the user's sentiment via a chat interface, extracting psychometric parameters (*Valence* and *Energy*). These parameters drive a recommendation engine that retrieves mood-congruent music directly from **Spotify**.

Simultaneously, the application generates a real-time, reactive visual environment using **P5.js**, creating a biofeedback loop between the audio stimuli and the user's visual perception. The platform integrates specific therapeutic modules developed via **Web Audio API** and particle systems, including anxiety management tools (text-to-ash visualization), guided breathing exercises for cardiac coherence, and a procedural ambient noise synthesizer (Brownian, Pink, White noise, and 432Hz tones) with spatial interaction.

This project demonstrates how creative coding and AI can be integrated to create accessible, immersive, and non-invasive mental health support tools.

---

## 2. Project Architecture

The project is built upon a modern **Client-Server** architecture:

* **Frontend:** React.js + P5.js (Graphic Visualization and User Interface).
* **Backend:** Node.js + Express (API Management and Business Logic).
* **Audio Engine:** Web Audio API (Browser-native) for ambient sound synthesis.
* **AI & Data:**
    * *Google Gemini API:* Semantic analysis and sentiment analysis.
    * *Spotify Web API:* Music track retrieval and metadata.

---

## 3. Key Features

### AI Emotional Agent
A therapeutic chatbot based on a Large Language Model (LLM) analyzes user input. Beyond providing empathetic responses, it extracts emotional coordinates (`valence`, `energy`) that dynamically influence the entire graphical and musical environment.

### Generative Visualization (P5.js)
A fluid particle system ("Flow Field") reacts to music and user input in real-time.
* **Silk Effect:** Persistent trails create a relaxing, fluid visual environment.
* **Reactivity:** Particle colors and speed shift according to the track's energy and the detected mood.

### Therapeutic Modules (DTx Tools)
The application includes three specific tools activatable via the toolbar:

1.  **Guided Breathing (Cardiac Coherence):**
    A visualizer featuring concentric circles guides the user through rhythmic breathing patterns (Inhale/Exhale) to reduce physiological stress.

2.  **Burning Thoughts (Digital Catharsis):**
    An interactive module allowing the user to type a negative thought. Using a *text-to-points* algorithm, the text is visualized as burning embers and subsequently dissolved into smoke particles that drift upwards, simulating a liberating combustion process.

3.  **Ambient Synthesizer (Spatial Audio):**
    An integrated procedural noise generator (Brownian, Pink, White, 432Hz).
    * **XY Interaction:** Moving the mouse along the X-axis modifies the filter (sound color/frequency), while the Y-axis controls the volume. This allows the user to sculpt their own auditory focus environment.

---

## 4. Installation and Setup

### Prerequisites
* Node.js installed (v14 or higher).
* Developer accounts for Spotify and Google Gemini.

### Environment Variables Configuration
Create a `.env` file in the server root directory with the following keys:

```env
GEMINI_API_KEY=your_google_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
