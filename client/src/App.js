import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import EvolutionaryVisualizer from './components/EvolutionaryVisualizer';

const App = () => {
  // ==========================================
  // 1. STATO DELL'APPLICAZIONE
  // ==========================================
  
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Ciao. Come ti senti in questo momento?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  
  const [trackId, setTrackId] = useState(null);
  const moodRef = useRef({ valence: 0.5, energy: 0.5 }); 
  
  const [mode, setMode] = useState('flow'); 
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [burnInput, setBurnInput] = useState('');
  const [burnSignal, setBurnSignal] = useState(null); 

  const [ambientType, setAmbientType] = useState('off'); 
  
  // ==========================================
  // 2. REFS AUDIO
  // ==========================================
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  // ==========================================
  // 3. AUDIO ENGINE (AMBIENT + FIRE FX)
  // ==========================================

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // --- NUOVA FUNZIONE: EFFETTO FUOCO ---
  const triggerFireSound = () => {
    const ctx = initAudioContext();
    const t = ctx.currentTime;

    // Durata dell'effetto (sincronizzato con l'effetto visivo di 3-4 sec)
    const duration = 4.0;

    // 1. CREA IL BUFFER DI RUMORE (Noise Generation)
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generiamo Brown Noise (Rumble profondo) + Un po' di crackle
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise formula
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        // Aggiungiamo picchi casuali per simulare il "crackle" (scoppiettio)
        if (Math.random() < 0.005) {
            data[i] += (Math.random() * 0.5); 
        }
        data[i] *= 3.5; // Compensazione gain
    }

    // 2. NODI AUDIO
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;

    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.value = 800; // Taglia gli alti per renderlo cupo e caldo

    const fireGain = ctx.createGain();
    
    // 3. CONNESSIONI
    noiseSrc.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(ctx.destination);

    // 4. INVILUPPO (Fade In esplosivo -> Sustain -> Fade Out)
    fireGain.gain.setValueAtTime(0, t);
    fireGain.gain.linearRampToValueAtTime(0.8, t + 0.2); // Fiammata iniziale (0.2s)
    fireGain.gain.exponentialRampToValueAtTime(0.4, t + 1.5); // Si assesta
    fireGain.gain.exponentialRampToValueAtTime(0.01, t + duration); // Svanisce col fumo

    // Modulazione dinamica del filtro (La fiamma si "spegne" chiudendo il filtro)
    fireFilter.frequency.setValueAtTime(800, t);
    fireFilter.frequency.exponentialRampToValueAtTime(200, t + duration);

    // 5. PLAY
    noiseSrc.start(t);
    noiseSrc.stop(t + duration);
  };

  const stopAudio = () => {
    const ctx = audioCtxRef.current;
    if (gainNodeRef.current && ctx) {
      gainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      setTimeout(() => {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          sourceNodeRef.current = null;
        }
      }, 600);
    }
    setAmbientType('off');
  };

  const playAmbient = (type) => {
    const ctx = initAudioContext();

    if (type === ambientType) {
      stopAudio();
      return;
    }

    if (sourceNodeRef.current) sourceNodeRef.current.stop();

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

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let source;

    if (type === '432') {
      source = ctx.createOscillator();
      source.type = 'sine';
      source.frequency.value = 432; 
      filterNodeRef.current.frequency.value = 5000;
      source.connect(gainNodeRef.current);
    } else {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'white') {
          output[i] = white * 0.5;
        } else if (type === 'pink') {
          const b0 = 0.99886 * lastOut + white * 0.0555179;
          const b1 = 0.99332 * lastOut + white * 0.0750759;
          const b2 = 0.96900 * lastOut + white * 0.1538520;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
          lastOut = output[i]; 
        } else if (type === 'brown') {
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; 
        }
      }
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(filterNodeRef.current);
      filterNodeRef.current.frequency.value = 800; 
    }

    source.start();
    sourceNodeRef.current = source;
    gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1);
    setAmbientType(type);
  };

  // ==========================================
  // 4. EFFETTO ONDA OCEANICA (Sync Respiro)
  // ==========================================
  useEffect(() => {
    let animationFrameId;

    const modulateBreathSound = () => {
      if (mode === 'breathe' && audioCtxRef.current && filterNodeRef.current && gainNodeRef.current && ambientType !== 'off' && ambientType !== '432') {
        const ctx = audioCtxRef.current;
        const time = Date.now() / 1000;
        const cycleDuration = 6.0; 

        const rawSin = Math.sin((time * (Math.PI * 2)) / cycleDuration - Math.PI / 2);
        const breathCycle = (rawSin + 1) / 2;

        const minFreq = 150; 
        const maxFreq = 900;
        const targetFreq = minFreq + (breathCycle * (maxFreq - minFreq));
        
        filterNodeRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);

        const baseVol = 0.4;
        const volMod = baseVol + (breathCycle * 0.2); 
        gainNodeRef.current.gain.setTargetAtTime(volMod, ctx.currentTime, 0.1);
      }
      animationFrameId = requestAnimationFrame(modulateBreathSound);
    };

    if (mode === 'breathe') {
      if (ambientType === 'off') playAmbient('brown');
      modulateBreathSound();
    } else {
      cancelAnimationFrame(animationFrameId);
      if (filterNodeRef.current && audioCtxRef.current) {
        filterNodeRef.current.frequency.setTargetAtTime(1000, audioCtxRef.current.currentTime, 0.5);
      }
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, ambientType]);

  // ==========================================
  // 5. INTERAZIONI UTENTE
  // ==========================================

  const handleVisualInteraction = (mouseX, mouseY, width, height) => {
    if (mode !== 'flow' || ambientType === 'off' || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    if (ambientType !== '432') {
      const freq = 100 + (mouseX / width) * 4000;
      filterNodeRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    }
    const vol = 1 - (mouseY / height);
    gainNodeRef.current.gain.setTargetAtTime(Math.max(0, Math.min(0.8, vol)), ctx.currentTime, 0.1);
  };

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
      if (data.track?.id) { 
        setTrackId(data.track.id); 
        setShowChat(false); 
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'bot', text: "Errore di connessione..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // GESTIONE BRUCIA PENSIERI AGGIORNATA
  const handleBurnSubmit = () => {
    if(!burnInput) return;
    
    // 1. Triggera l'effetto visivo (Parte subito il countdown di 3 sec)
    setBurnSignal({ text: burnInput.toUpperCase(), id: Date.now() });
    
    // 2. Triggera il suono DELAYATO di 3000ms (3 secondi)
    setTimeout(() => {
        triggerFireSound();
    }, 3000);

    setShowBurnModal(false);
    setBurnInput('');
  };

  return (
    <div className="App">
      <div className="visual-background">
        <EvolutionaryVisualizer 
          moodData={moodRef.current}
          mode={mode}
          burnSignal={burnSignal}
          onInteraction={handleVisualInteraction}
        />
      </div>

      <div className="therapy-tools">
        <div 
          className={`tool-btn ${mode === 'breathe' ? 'active' : ''}`} 
          onClick={() => setMode(mode === 'flow' ? 'breathe' : 'flow')} 
          title="Respiro Guidato"
        >
          🫁
        </div>
        <div 
          className="tool-btn" 
          onClick={() => setShowBurnModal(true)} 
          title="Brucia Pensieri"
        >
          🔥
        </div>
        <div className="sound-menu-container">
          <div className={`tool-btn ${ambientType !== 'off' ? 'active' : ''}`} title="Suoni Ambientali">
            {ambientType === 'off' ? '🌊' : (ambientType === 'brown' ? '🟤' : (ambientType === 'white' ? '⚪' : (ambientType === 'pink' ? '🌸' : '🧘')))}
          </div>
          <div className="sound-dropdown">
            <button className={ambientType === 'off' ? 'active' : ''} onClick={() => playAmbient('off')}>🚫 Muto</button>
            <button className={ambientType === 'brown' ? 'active' : ''} onClick={() => playAmbient('brown')}>🟤 Marrone</button>
            <button className={ambientType === 'pink' ? 'active' : ''} onClick={() => playAmbient('pink')}>🌸 Rosa</button>
            <button className={ambientType === 'white' ? 'active' : ''} onClick={() => playAmbient('white')}>⚪ Bianco</button>
            <button className={ambientType === '432' ? 'active' : ''} onClick={() => playAmbient('432')}>🧘 432 Hz</button>
          </div>
        </div>
      </div>

      {showBurnModal && (
        <div className="burn-modal">
          <div className="burn-content">
            <h2>Brucia un pensiero negativo</h2>
            <input 
              type="text" 
              placeholder="Scrivi qui cosa ti turba..." 
              value={burnInput} 
              onChange={(e) => setBurnInput(e.target.value)} 
              autoFocus 
            />
            <div className="modal-actions">
              <button className="burn-btn" onClick={handleBurnSubmit}>BRUCIA 🔥</button>
              <button className="close-modal-text" onClick={() => setShowBurnModal(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {!showChat && (
        <button 
          className="toggle-chat-btn" 
          style={{position:'absolute', bottom:20, right:20, zIndex:20}} 
          onClick={() => setShowChat(true)}
        >
          💬
        </button>
      )}
      
      {showChat && (
        <div className="ui-container">
          <div className="header-bar">
            <span>DJ Therapist AI</span>
            <button className="close-btn" onClick={() => setShowChat(false)}>✕</button>
          </div>
          <div className="chat-box">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="message bot">...Sto riflettendo...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="input-area">
            <input 
              type="text" 
              placeholder="Scrivi qui..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
              disabled={isLoading} 
            />
            <button onClick={sendMessage}>Invia</button>
          </div>
        </div>
      )}

      {trackId && (
        <div className={`spotify-player-container ${showChat ? 'in-chat' : ''}`}>
          <iframe 
            title="Spotify" 
            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&autoplay=1`} 
            width="100%" 
            height="80" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default App;