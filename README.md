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
    * **Burn Thoughts:** A digital catharsis ritual where negative thoughts typed by the user are visually incinerated using pixel-scanning algorithms and additive blending fire effects.

### Design Philosophy & Neuroscience
Our primary goal was **Radical Simplicity** and **Flow State**.

* **Default Mode Network (DMN):** The interface minimizes "Task-Positive" brain activity to encourage the DMN activation, associated with wakeful rest and daydreaming.
* **Audio-Visual Entrainment:** By synchronizing visual motion (particles) with auditory cues (Key & BPM), we aim to induce a state of coherence, reducing cognitive load and anxiety.

### Design & Therapeutic Rationale
The visual effects in the "Flow" section were designed based on creative computing principles and clinical literature regarding schizophrenia and sensory processing.

1. The "Bokeh" Effect & Soft Blur
The particles feature soft, blurred edges. According to neuroaesthetics and psychology literature, sharp, high-contrast images (high spatial frequency) require significant cognitive processing. Conversely, blurred or soft shapes (low spatial frequency) are processed via more "emotional" and less analytical visual pathways, effectively promoting relaxation.

Visual Association: The aesthetic resembles bioluminescence (fireflies) or candlelight, evoking primal instincts of safety, warmth, and calm.

2. The "Bonding" Metaphor
The mechanic where particles gently merge and bond upon contact is a deliberate therapeutic choice. Schizophrenia is often associated with a sense of self-fragmentation or social isolation.

Visual Metaphor: Witnessing separate entities softly merging to become "brighter" together serves as a powerful, non-verbal metaphor for reintegration, connection, and wholeness.

3. Color Palette Strategy

Dark Background: Essential for minimizing visual fatigue and eye strain, as photophobia (light sensitivity) can be common in certain stages of the condition.

Gold/Amber Tones: These are warm colors that avoid the aggression often associated with red. They are chosen to stimulate a feeling of "welcome" and comfort.

### Challenges, accomplishments, and lessons learned

* **Challenges:**
    * **The "Black Box" of Audio Analysis:** Spotify deprecated their Audio Features endpoint, making it impossible to get Key/BPM programmatically. We solved this by engineering a **Prompt Engineering pipeline** where Gemini acts as a music theory expert, extracting accurate metadata for famous tracks directly from its training data.
    * **Physics Tuning:** Mapping BPM (60-180 range) to particle velocity vectors without breaking the simulation required careful calibration of the physics engine to ensure the movement remained organic, never robotic.

* **Accomplishments:**
    * **Full Sensory Sync:** We achieved a system where the visuals are not just a loop, but a live interpretation of the music. If the song is sad (Minor Key) and slow (low BPM), the visualizer physically embodies that melancholy.
    * **AI Orchestration:** Successfully chaining two AI agents (Therapist + Musicologist) to deliver a seamless user experience in under a second.

* **Lessons learned:**
    * We learned that LLMs can replace traditional database APIs for static knowledge (like song keys).
    * We specialize our understanding of **p5.js** optimization, managing hundreds of interactive particles reacting to global state changes (BPM/Key) in real-time.

### Technology
* **Frontend:** React.js, p5.js, CSS3.
* **Backend:** Node.js, Express.js.
* **AI & Data:**
    * **Google Gemini 2.5 Flash:** NLP, Sentiment Analysis, and Musicological Data Extraction (Key/BPM).
    * **Spotify API:** Track Search & Playback.
* **Audio Engine:** Web Audio API (Real-time procedural synthesis, Binaural Beats, Oscillators).
* **Deployment:** Firebase Hosting (Frontend), Render (Backend).

### Students
* **Alberto Bollino**
* **Wilma Bertilsson**
* **Matteo Orlandin**

### Links
* **GitHub Repo:** [Link to Github Repository](https://github.com/Quentin50ino/music-therapy-app)
* **Web App Demo:** [Direct link to the deployed application](https://music-therapy-app-246ba.web.app/)
* **Video Demo:** [INSERT VIDEO LINK HERE]
* **Presentation:** [INSERT SLIDES LINK HERE]

### 1 thumbnail image related to the projects
![Project Thumbnail](assets/thumbnail.jpg)
*(Format: 1024x768. Representative image, e.g., Flow Mode)*

### Pictures
![Flow Mode Chat](assets/screenshot_flow.jpg)
*Flow Mode featuring the AI Chat interface and the living particle ecosystem.*

![Breathe Mode](assets/screenshot_breathe.jpg)
*Breathe Mode with expanding concentric fractals (L-Systems) synchronized to breath cycles.*

![Burn Ritual](assets/screenshot_burn.jpg)
*The "Burn Thoughts" ritual with the realistic particle fire effect.*

### Video
[INSERT VIDEO LINK OR EMBED HERE]
