# DJ Therapist AI: Interactive Music & Visual Therapy

### 1-line description
A holistic web application merging generative AI, music therapy, and interactive generative art to promote mental well-being and emotional regulation.

### Description
**DJ Therapist AI** is a digital safe space designed for users seeking relaxation, emotional venting, or guidance. The user experience is divided into three interconnected, neuro-aesthetics-driven components:

1.  **AI Counseling & Music:** An empathic chatbot (powered by **Google Gemini**) that dialogues with the user, analyzes text sentiment, and suggests **Spotify** tracks tuned to the detected mood, creating a personalized soundscape.
2.  **Evolutionary Visualizer:** A generative background built in **p5.js** that reacts to different modes. In "Flow Mode," fluid particles evolve and move organically, simulating a calming deep-ocean environment.
3.  **Therapeutic Rituals:**
    * **Breathe Mode:** A guided interface for deep breathing (coherence technique). During inspiration, chaotic particles vanish to reveal giant concentric fractal mandalas (L-Systems) that expand to fill the screen, pulsing in sync with the breath cycle to reduce cognitive load.
    * **Burn Thoughts:** A digital catharsis ritual. The user types a negative thought; after 3 seconds of focus, the text visually ignites. We implemented a realistic combustion system (via "Additive Layering") and procedural audio feedback (rumble and crackle) generated in real-time without external audio files.

### Challenges, accomplishments, and lessons learned

* **Challenges:** The biggest technical challenge was managing **advanced graphics rendering** within React. Specifically, the "Burn Thoughts" feature struggled with converting text to particle coordinates due to asynchronous font loading. We solved this by implementing a **"Pixel Scanning"** technique on an invisible graphics buffer, making the effect robust across all devices. **Deployment** also required effort to correctly configure CORS policies and environment variables between the client (Firebase) and the server (Render).
* **Accomplishments:** We are proud of the **Particle Engine**. We achieved a "liquid fire" effect using *additive blending* and multiple color layers, resulting in a realistic look without heavy shaders. Another major milestone was the **Audio Engine**: instead of using static MP3 files, we utilized the **Web Audio API** to synthesize Brown Noise and dynamic filters in real-time, perfectly synchronized with the visual animations.
* **Lessons learned:** We learned the importance of decoupling frontend/backend architecture for scalability and how to manage security in production. Furthermore, we deepened our understanding of the math behind Fractal systems (L-Systems) and how recursive geometric patterns can positively influence a user's cognitive state.

### Technology
* **Frontend:** React.js, p5.js (Creative Coding), CSS3.
* **Audio:** Web Audio API (Real-time procedural synthesis).
* **Backend:** Node.js, Express.js.
* **AI & APIs:** Google Gemini API (NLP & Sentiment Analysis), Spotify API (Music Recommendation).
* **Deployment:** Firebase Hosting (Frontend), Render (Backend).
* **Concepts:** L-Systems (Fractals), Particle Systems, Additive Blending, Pixel Scanning.

### Students
* **Alberto Bollino:** 
* **Wilma Bertilsson:** 
* **Matteo Orlandin:** 

### Links
* **GitHub Repo:** [INSERT GITHUB LINK HERE](https://github.com/Quentin50ino/music-therapy-app)]
* **Web App Demo:** [\[INSERT FIREBASE LINK HERE, e.g., https://music-therapy-app.web.app](https://music-therapy-app-246ba.web.app/)]
* **Video Demo:** [INSERT VIDEO LINK HERE]
* **Presentation:** [INSERT SLIDES LINK HERE]

### 1 thumbnail image related to the projects
![Project Thumbnail](assets/thumbnail.jpg)
*(Format: 1024x768. Representative image, e.g., Flow Mode)*

### Pictures
![Flow Mode Chat](assets/screenshot_flow.jpg)
*Flow Mode featuring the AI Chat interface and fluid particles.*

![Breathe Mode](assets/screenshot_breathe.jpg)
*Breathe Mode with expanding concentric fractals.*

![Burn Ritual](assets/screenshot_burn.jpg)
*The "Burn Thoughts" ritual with the realistic particle fire effect.*

### Video
[INSERT VIDEO LINK OR EMBED HERE]