# Serenify: AI-Driven Audio-Visual Therapy

### 1-line description
A holistic web application merging Generative AI, music therapy, and interactive fluid simulations to promote mental well-being through multi-sensory synchronization.

### Description
**Serenify** is a digital sanctuary designed for users seeking relaxation, emotional regulation, or guidance. The experience orchestrates three interconnected, neuro-aesthetics-driven components:

1.  **AI Counseling & The "Musicologist" Agent:**
    * An empathic chatbot (powered by **Google Gemini 2.5 Flash**) acts as a "DJ Therapist," analyzing the user's sentiment to offer support and curate specific musical suggestions (ISO Principle).
    * **Innovation:** Serenify employs a secondary AI Agent (The **"AI Musicologist"**) that leverages Gemini's vast knowledge base to accurately retrieve technical metadata (**Musical Key, BPM, and Mood**) for the selected track.

2.  **Evolutionary Visualizer (The Living Canvas):**
    * A generative background built in **p5.js** simulating a "Primordial Soup" of luminous organic particles.
    * **Harmonic Synchronization:** The system reads the **Musical Key** (e.g., C# Minor) identified by the AI agent and forces particle collisions to synthesize sounds only within that specific scale, ensuring mathematical consonance with the playing track.
    * **Rhythmic Synchronization:** The simulation physics is driven by the song's **BPM** (Beats Per Minute). The Tempo controls the particles' velocity, turbulence, and pulsation rate. A slow ballad creates a calm, floating ecosystem; an energetic track accelerates the fluid dynamics, making the visualizer "dance" to the beat.

3.  **Therapeutic Rituals:**
    * **Breathe Mode (L-Systems):** A guided deep-breathing interface. Chaos vanishes to reveal expanding fractal mandalas generated via **Lindenmayer Systems** (recursive mathematical structures), synchronized with the user's breath cycle.
    * **Burn & Reframe Thoughts (New):** A two-step digital catharsis ritual.
        * **Step 1 (The Burn):** Negative thoughts typed by the user are visually incinerated using pixel-scanning algorithms and additive blending fire effects.
        * **Step 2 (The Reframe):** Once the fire fades, the AI generates **4 Cognitive Reframes**—motivational reinterpretations of the original thought. Selecting a new phrase transforms the visual environment into a "Calm" state, reinforcing positive neural pathways.

### Design Philosophy & Neuroscience
Our primary goal was **Radical Simplicity** and **Flow State**.

* **Default Mode Network (DMN):** The interface minimizes "Task-Positive" brain activity to encourage the DMN activation, associated with wakeful rest and daydreaming.
* **Audio-Visual Entrainment:** By synchronizing visual motion (particles) with auditory cues (Key & BPM), we aim to induce a state of coherence, reducing cognitive load and anxiety.

### Design & Therapeutic Rationale
The visual effects in the "Flow" section were designed based on creative computing principles and clinical literature regarding schizophrenia and sensory processing.

1. **The "Bokeh" Effect & Soft Blur:** The particles feature soft, blurred edges (low spatial frequency), which are processed via emotional rather than analytical visual pathways, effectively promoting relaxation compared to sharp, high-contrast shapes.
2. **The "Bonding" Metaphor:** Witnessing separate entities softly merging to become "brighter" together serves as a powerful, non-verbal metaphor for reintegration, connection, and wholeness, countering feelings of fragmentation.
3. **Color Palette Strategy:** Dark backgrounds minimize visual fatigue/photophobia, while Gold/Amber tones stimulate a sense of "welcome" and comfort without the aggression of red.

### Challenges, accomplishments, and lessons learned

* **Challenges:**
    * **The "Black Box" of Audio Analysis:** Spotify deprecated their Audio Features endpoint. We engineered a **Prompt Engineering pipeline** where Gemini acts as a music theory expert, extracting accurate metadata (Key/BPM) for famous tracks directly from its training data.
    * **Async Animation Orchestration:** Timing the "Burn" ritual was critical. We had to synchronize the asynchronous AI generation of reframes with the 3.5-second physics simulation of the fire, ensuring the motivational options appear exactly as the negative thought turns to ash.

* **Accomplishments:**
    * **Cognitive Reframing Integration:** We moved beyond simple "destruction" of thoughts to "transformation." The app now closes the therapeutic loop by offering constructive alternatives.
    * **Full Sensory Sync:** We achieved a system where the visuals are a live interpretation of the music. If the song is sad (Minor Key) and slow (low BPM), the visualizer physically embodies that melancholy.

* **Lessons learned:**
    * We learned that LLMs can replace traditional database APIs for static knowledge (like song keys) and dynamic psychological tasks (reframing).
    * We specialized our understanding of **p5.js** optimization, managing hundreds of interactive particles reacting to global state changes (BPM/Key) in real-time.

### Technology
* **Frontend:** React.js, p5.js, CSS3 (Glassmorphism).
* **Backend:** Node.js, Express.js.
* **AI & Data:**
    * **Google Gemini 2.5 Flash:** NLP, Sentiment Analysis, Musicological Data, and Cognitive Reframing.
    * **Spotify API:** Track Search & Playback.
* **Audio Engine:** Web Audio API (Real-time procedural synthesis, Binaural Beats, Oscillators).
* **Deployment:** Firebase Hosting (Frontend), Render (Backend).

### Local Setup (API keys)
1. Create `/server/.env` from `/server/.env.example`.
2. Put your Gemini key in `GEMINI_API_KEY` (powers chat, music analysis, and burn reframing).
3. Optionally add Spotify keys (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`) for music suggestions.
4. Create `/client/.env` from `/client/.env.example`.
5. Set `REACT_APP_API_URL=http://localhost:3001` in the client env file.
6. Start backend: `npm --prefix server install && node server/index.js`.
7. Start frontend: `npm --prefix client install && npm --prefix client start`.

### Students
* **Alberto Bollino:** server-side development and cloud infrastructure.
* **Wilma Bertilsson:** graphics, readme, slides and screenshots.
* **Matteo Orlandin:** client-side development and graphics improvements.

### Links
* **GitHub Repo:** [Link to Github Repository](https://github.com/Quentin50ino/music-therapy-app)
* **Web:** [Link to the deployed application](https://music-therapy-app-246ba.web.app/)
* **Document:** [Link to the document](https://docs.google.com/document/d/1UZn3E8wR1myCi0YWj8gV4qTlko4INXFd-F-2Sqy_s2A/edit?usp=sharing)
* **Slides:** [Link to the slides](https://docs.google.com/presentation/d/1gS86u_rbCEXoV-6_YU0IcXCI1wVqut_pdi_nQkMutaI/edit?usp=sharing)
* **Demo:** [Link to the video demo](https://www.youtube.com/watch?v=vko_JChvME4&feature=youtu.be)
