import React, { useState, useEffect, useRef } from 'react';
import Sketch from 'react-p5';
import './App.css';

const App = () => {
  // --- STATO REACT ---
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Ciao. Come ti senti in questo momento?' }]);
  const [input, setInput] = useState('');
  const [trackId, setTrackId] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- STATI TERAPIA ---
  const [mode, setMode] = useState('flow'); 
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [burnInput, setBurnInput] = useState('');
  
  // STATO AMBIENTALE AVANZATO
  // 'off', 'brown', 'white', 'pink', '432'
  const [ambientType, setAmbientType] = useState('off'); 

  // --- REFS ---
  const chatEndRef = useRef(null);
  const moodRef = useRef({ valence: 0.5, energy: 0.5 });
  
  // Refs Audio
  const audioCtxRef = useRef(null); 
  const sourceNodeRef = useRef(null); // Tiene traccia della sorgente sonora
  const filterNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  
  // Refs P5 & Logica
  const p5InstanceRef = useRef(null);
  const myFont = useRef(null);
  const particles = useRef([]);
  const flowField = useRef([]);
  const zOff = useRef(0);
  const userHue = useRef(200);
  const scl = 50; 
  let cols, rows;

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  // ============================================================
  // --- AUDIO ENGINE 2.0 (Multi-Frequenza) ---
  // ============================================================
  
  const stopAudio = () => {
      const ctx = audioCtxRef.current;
      if (gainNodeRef.current && ctx) {
          // Fade out elegante
          gainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
          setTimeout(() => {
              sourceNodeRef.current?.stop();
              sourceNodeRef.current = null;
          }, 200);
      }
      setAmbientType('off');
  };

  const playAmbient = (type) => {
    // Se clicco quello già attivo, spengo tutto
    if (type === ambientType) {
        stopAudio();
        return;
    }

    // Inizializza Contesto
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Se c'è già un suono, fermalo prima di cambiare
    if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
    }

    // Configura Nodi Comuni (Gain + Filter)
    if (!gainNodeRef.current) {
        const gain = ctx.createGain();
        gain.gain.value = 0.5;
        gain.connect(ctx.destination);
        gainNodeRef.current = gain;
    }
    
    if (!filterNodeRef.current) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000; 
        filter.connect(gainNodeRef.current);
        filterNodeRef.current = filter;
    }

    // --- GENERAZIONE SUONO ---
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let source;

    if (type === '432') {
        // OSCILLATORE PURO (Onda Sinusoidale)
        source = ctx.createOscillator();
        source.type = 'sine'; // Suono puro
        source.frequency.value = 432; // La frequenza curativa
        source.connect(gainNodeRef.current); // Saltiamo il filtro lowpass per il tono puro, o lo usiamo per ammorbidire
        // Nota: Per il tono puro colleghiamo direttamente al gain per non attenuarlo troppo
        source.disconnect();
        source.connect(gainNodeRef.current);
    } 
    else {
        // RUMORI (Noise)
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            
            if (type === 'white') {
                output[i] = white * 0.5;
            } 
            else if (type === 'brown') {
                // Algoritmo Brown Noise
                output[i] = (0 + (0.02 * white)) / 1.02;
                output[i] *= 3.5; 
            }
            else if (type === 'pink') {
                // Approssimazione Pink Noise (Paul Kellet method simplified)
                // Usiamo una versione semplificata per performance
                output[i] = (Math.random() * 2 - 1) * 0.5; 
                // Il vero filtro pink si fa meglio con nodi biquad, 
                // ma qui useremo il filtro LowPass interattivo per simularlo
            }
        }
        source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(filterNodeRef.current);
    }

    source.start();
    sourceNodeRef.current = source;
    setAmbientType(type);
  };

  // Funzione chiamata mentre si trascina il mouse
  const updateAudioOnDrag = (p5) => {
      if (ambientType === 'off' || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      
      // Mappiamo X -> Frequenza Filtro o Detune
      // Se è 432Hz, la X controlla un leggero vibrato o panning (qui semplifichiamo col volume)
      
      if (ambientType !== '432') {
          // Per i rumori, X controlla il filtro (cupo <-> chiaro)
          const freq = p5.map(p5.mouseX, 0, p5.width, 100, 5000);
          filterNodeRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
      } 

      // Mappiamo Y -> Volume
      const vol = p5.map(p5.mouseY, p5.height, 0, 0, 1); 
      gainNodeRef.current.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), ctx.currentTime, 0.1);
  };

  // --- API CALL ---
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
      if (data.analysis?.mood) moodRef.current = data.analysis.mood;
      else if (data.mood) moodRef.current = data.mood;
      if (data.track?.id) { setTrackId(data.track.id); setShowChat(false); }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'bot', text: "Errore server 😢" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // --- P5.JS CLASS DEFINITION (TEXT BURNING) ---
  // ============================================================

  class Particle {
    constructor(p5, x, y, type = 'flow', hue = null) {
      this.p5 = p5;
      this.pos = p5.createVector(x || p5.random(p5.width), y || p5.random(p5.height));
      this.target = p5.createVector(x, y); 
      this.vel = p5.createVector(0, 0);
      this.acc = p5.createVector(0, 0);
      this.type = type; 
      this.maxSpeed = (type === 'user') ? 2 : 1.5;
      this.prevPos = this.pos.copy();
      this.life = 255; 
      this.myHue = hue;
      this.burnDelay = type === 'text' ? p5.random(60, 150) : 0; 
      this.isBurning = false;
    }

    update(energy) {
      if (this.type === 'text') {
        if (this.burnDelay > 0) {
            this.burnDelay--;
            this.pos.x = this.target.x + this.p5.random(-1, 1);
            this.pos.y = this.target.y + this.p5.random(-1, 1);
            this.prevPos = this.pos.copy();
            return; 
        } else {
            this.isBurning = true;
            let upwardForce = this.p5.createVector(this.p5.random(-0.5, 0.5), this.p5.random(-1, -3));
            this.acc.add(upwardForce);
            this.life -= 2; 
        }
      } 
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed * (this.isBurning ? 2 : 1));
      this.prevPos = this.pos.copy();
      this.pos.add(this.vel);
      this.acc.mult(0);
      if (this.type === 'user') this.life -= 0.5;
      if (this.type !== 'text') this.edges();
    }

    follow(vectors) {
      if (this.type === 'text' && !this.isBurning) return; 
      let x = this.p5.floor(this.pos.x / scl);
      let y = this.p5.floor(this.pos.y / scl);
      let index = x + y * cols;
      let force = vectors[index];
      if (force) this.acc.add(force);
    }

    show(valence, energy) {
      let h, s, b, alpha;
      
      if (this.type === 'text') {
        if (this.life > 100) {
            h = this.p5.map(this.life, 255, 100, 50, 0); 
            s = 100; b = 100;
            alpha = this.p5.map(this.life, 255, 0, 1, 0);
        } else {
            h = 0; s = 0; b = 50; 
            alpha = this.p5.map(this.life, 100, 0, 0.5, 0);
        }
      } else if (this.type === 'user') {
        h = this.myHue; s = 70; b = 100;
        alpha = this.p5.map(this.life, 0, 255, 0, 0.3); 
      } else {
        h = this.p5.map(valence, 0, 1, 230, 40);
        s = 60 + (energy * 20); b = 60 + (energy * 20);
        alpha = 0.05;
      }

      this.p5.stroke(h, s, b, alpha);
      let weight = (this.type === 'text') ? 3 : (this.type === 'user' ? 6 : (2 + energy * 4));
      if (this.isBurning) weight = 2;
      this.p5.strokeWeight(weight);
      
      if (this.type === 'text' && !this.isBurning) {
          this.p5.point(this.pos.x, this.pos.y); 
      } else {
          this.p5.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
      }
    }

    edges() {
      let wrapped = false;
      if (this.pos.x > this.p5.width) { this.pos.x = 0; wrapped = true; }
      if (this.pos.x < 0) { this.pos.x = this.p5.width; wrapped = true; }
      if (this.pos.y > this.p5.height) { this.pos.y = 0; wrapped = true; }
      if (this.pos.y < 0) { this.pos.y = this.p5.height; wrapped = true; }
      if (wrapped) this.prevPos = this.pos.copy();
    }
  }

  // ============================================================
  // --- P5 FUNCTIONS ---
  // ============================================================

  const preload = (p5) => {
    myFont.current = p5.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
  };

  const setup = (p5, canvasParentRef) => {
    p5InstanceRef.current = p5;
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    cols = p5.floor(p5.width / scl);
    rows = p5.floor(p5.height / scl);
    particles.current = [];
    for (let i = 0; i < 400; i++) particles.current.push(new Particle(p5, null, null, 'flow'));
    p5.background(0);
  };

  const draw = (p5) => {
    const { valence, energy } = moodRef.current;
    
    p5.blendMode(p5.BLEND);
    p5.noStroke();
    let fadeAlpha = mode === 'breathe' ? 0.1 : 0.03;
    p5.fill(0, 0, 0, fadeAlpha);
    p5.rect(0, 0, p5.width, p5.height);
    p5.blendMode(p5.ADD);

    if (mode === 'breathe') {
        let time = p5.millis() / 1000;
        let breathCycle = (Math.sin(time * 0.8) + 1) / 2; 
        let centerColor = p5.map(breathCycle, 0, 1, 180, 220); 
        let radius = p5.map(breathCycle, 0, 1, 100, 300);
        p5.noFill(); p5.strokeWeight(3); p5.stroke(centerColor, 80, 100, 0.5); p5.circle(p5.width/2, p5.height/2, radius);
        p5.textAlign(p5.CENTER, p5.CENTER); p5.noStroke(); p5.fill(255); p5.textSize(16);
        p5.text(breathCycle > 0.5 ? "ESPIRA..." : "ISPIRA...", p5.width/2, p5.height/2);
    } else {
        let yOff = 0;
        for (let y = 0; y < rows; y++) {
          let xOff = 0;
          for (let x = 0; x < cols; x++) {
            let index = x + y * cols;
            let angle = p5.noise(xOff, yOff, zOff.current) * p5.TWO_PI * 2;
            let v = p5.createVector(Math.cos(angle), Math.sin(angle));
            v.setMag(0.5); 
            flowField.current[index] = v;
            xOff += 0.1;
          }
          yOff += 0.1;
        }
        zOff.current += 0.002 + (energy * 0.003);

        for (let i = particles.current.length - 1; i >= 0; i--) {
          let p = particles.current[i];
          p.follow(flowField.current);
          p.update(energy);
          p.show(valence, energy);
          if ((p.type === 'user' || p.type === 'text') && p.life <= 0) {
            particles.current.splice(i, 1);
          }
        }
    }
  };

  const mouseDragged = (p5) => {
    updateAudioOnDrag(p5);
    for (let i = 0; i < 5; i++) {
        let x = p5.mouseX + p5.random(-10, 10);
        let y = p5.mouseY + p5.random(-10, 10);
        particles.current.push(new Particle(p5, x, y, 'user', userHue.current));
    }
    return false;
  };

  const mousePressed = (p5) => {
    updateAudioOnDrag(p5);
    userHue.current = p5.random(360);
    for (let i = 0; i < 10; i++) {
        let x = p5.mouseX + p5.random(-20, 20);
        let y = p5.mouseY + p5.random(-20, 20);
        particles.current.push(new Particle(p5, x, y, 'user', userHue.current));
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
    p5.background(0);
    cols = p5.floor(p5.width / scl);
    rows = p5.floor(p5.height / scl);
  };

  const triggerBurnEffect = () => {
    const p5 = p5InstanceRef.current;
    const font = myFont.current;
    if (!p5 || !font) return;

    const textToBurn = burnInput.toUpperCase();
    let fontSize = 100;
    if (textToBurn.length > 8) fontSize = 60;
    if (textToBurn.length > 15) fontSize = 40;

    const bounds = font.textBounds(textToBurn, 0, 0, fontSize);
    const startX = (p5.width - bounds.w) / 2;
    const startY = (p5.height + bounds.h) / 2;

    const points = font.textToPoints(textToBurn, startX, startY, fontSize, {
      sampleFactor: 0.15, simplifyThreshold: 0
    });

    for (let pt of points) {
        let p = new Particle(p5, pt.x, pt.y, 'text', 0); 
        particles.current.push(p);
    }
    setShowBurnModal(false);
    setBurnInput('');
  };

  return (
    <div className="App">
      <div className="visual-background">
        <Sketch preload={preload} setup={setup} draw={draw} windowResized={windowResized} mouseDragged={mouseDragged} mousePressed={mousePressed} />
      </div>

      <div className="therapy-tools">
        <div className={`tool-btn ${mode === 'breathe' ? 'active' : ''}`} onClick={() => setMode(mode === 'flow' ? 'breathe' : 'flow')} title="Respiro">🫁</div>
        <div className="tool-btn" onClick={() => setShowBurnModal(true)} title="Brucia Pensieri">🔥</div>
        
        {/* MENU A TENDINA PER I SUONI */}
        <div className="sound-menu-container">
            <div className={`tool-btn ${ambientType !== 'off' ? 'active' : ''}`} title="Scegli Suono">
                {ambientType === 'off' ? '🌊' : (ambientType === 'brown' ? '🟤' : (ambientType === 'white' ? '⚪' : (ambientType === 'pink' ? '🌸' : '🧘')))}
            </div>
            
            <div className="sound-dropdown">
                <button className={`sound-option ${ambientType === 'off' ? 'active' : ''}`} onClick={() => playAmbient('off')}>🚫 Muto</button>
                <button className={`sound-option ${ambientType === 'brown' ? 'active' : ''}`} onClick={() => playAmbient('brown')}>🟤 Marrone</button>
                <button className={`sound-option ${ambientType === 'pink' ? 'active' : ''}`} onClick={() => playAmbient('pink')}>🌸 Rosa</button>
                <button className={`sound-option ${ambientType === 'white' ? 'active' : ''}`} onClick={() => playAmbient('white')}>⚪ Bianco</button>
                <button className={`sound-option ${ambientType === '432' ? 'active' : ''}`} onClick={() => playAmbient('432')}>🧘 432 Hz</button>
            </div>
        </div>
      </div>

      {showBurnModal && (
        <div className="burn-modal">
          <div className="burn-content">
            <h2>Brucia un pensiero negativo</h2>
            <input type="text" placeholder="..." value={burnInput} onChange={(e) => setBurnInput(e.target.value)} autoFocus />
            <div><button className="burn-btn" onClick={triggerBurnEffect}>BRUCIA 🔥</button></div>
            <button className="close-modal" onClick={() => setShowBurnModal(false)}>annulla</button>
          </div>
        </div>
      )}

      {!showChat && <button className="toggle-chat-btn" style={{position:'absolute', bottom:20, right:20, zIndex:20}} onClick={() => setShowChat(true)}>💬</button>}
      
      {showChat && (
        <div className="ui-container">
          <div className="header-bar"><span>Music Therapist AI</span><button className="close-btn" onClick={() => setShowChat(false)}>✕</button></div>
          <div className="chat-box">
            {messages.map((msg, i) => <div key={i} className={`message ${msg.role}`}>{msg.text}</div>)}
            {isLoading && <div className="message bot">...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="input-area">
            <input type="text" placeholder="Scrivi qui..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} disabled={isLoading} />
            <button onClick={sendMessage}>Invia</button>
          </div>
        </div>
      )}

      {trackId && (
        <div className={`spotify-player-container ${showChat ? 'in-chat' : ''}`}>
          <iframe title="Spotify" src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&autoplay=1`} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        </div>
      )}
    </div>
  );
};

export default App;