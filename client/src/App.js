import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css'; 
import EvolutionaryVisualizer from './components/EvolutionaryVisualizer';

// --- IMPORT ICONE ---
import {  FaTimes, FaPaperPlane, FaVolumeMute, FaFire, FaMusic, FaTree, FaBrain, FaCloudRain, FaOm } from 'react-icons/fa';
import { GiLungs, GiEarthAmerica } from 'react-icons/gi';
import { BsStars, BsChatDotsFill } from 'react-icons/bs';

// ==========================================
// TEORIA MUSICALE (Frequency Map & Scales)
// ==========================================

// Frequenze base (Ottava 3 - Medio Basse, ideali per pad/chimes)
const BASE_FREQUENCIES = {
  'C': 130.81, 'C#': 138.59, 'Db': 138.59,
  'D': 146.83, 'D#': 155.56, 'Eb': 155.56,
  'E': 164.81,
  'F': 174.61, 'F#': 185.00, 'Gb': 185.00,
  'G': 196.00, 'G#': 207.65, 'Ab': 207.65,
  'A': 220.00, 'A#': 233.08, 'Bb': 233.08,
  'B': 246.94
};

// Ordine cromatico per calcolare gli intervalli
const NOTES_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Intervalli in semitoni
const SCALES_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11], // Scala Maggiore
  minor: [0, 2, 3, 5, 7, 8, 10]  // Scala Minore Naturale
};

// Funzione che trasforma "C# Minor" in un array di frequenze
const getScaleFrequencies = (keyString = 'C Major') => {
  if (!keyString) return Object.values(BASE_FREQUENCIES); // Fallback su tutte le note

  let cleanKey = keyString.trim();
  let root = 'C';
  let type = 'major';

  // 1. Identifica la Nota Tonica (Root)
  // Gestisce diesis (#) o bemolle (b)
  if (cleanKey.length > 1 && (cleanKey[1] === '#' || cleanKey[1] === 'b')) {
    root = cleanKey.substring(0, 2);
  } else {
    root = cleanKey.substring(0, 1);
  }
  
  // Normalizzazione (es. c# -> C#)
  root = root.charAt(0).toUpperCase() + root.slice(1);

  // 2. Identifica il Modo (Maggiore o Minore)
  const lowerKey = cleanKey.toLowerCase();
  if (lowerKey.includes('min') || lowerKey.includes('m') && !lowerKey.includes('maj')) {
    type = 'minor';
  }

  // 3. Calcola le frequenze
  let rootIndex = NOTES_ORDER.indexOf(root);
  if (rootIndex === -1) rootIndex = 0; // Fallback C se non trova la nota

  const intervals = SCALES_INTERVALS[type];
  const frequencies = [];

  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12; // Modulo 12 per girare dopo il SI
    const noteName = NOTES_ORDER[noteIndex];
    const baseFreq = BASE_FREQUENCIES[noteName];
    
    // Se l'indice della nota è minore della root, siamo nell'ottava successiva
    // Es: In scala di SOL (G), il DO (C) viene dopo, quindi è più acuto.
    let octaveMult = (rootIndex + interval) >= 12 ? 2 : 1;
    
    // Aggiungiamo frequenza base
    frequencies.push(baseFreq * octaveMult);
    
    // Aggiungiamo anche un'ottava sopra per dare brillantezza
    frequencies.push(baseFreq * octaveMult * 2);
  });

  return frequencies;
};


// ==========================================
// MAIN COMPONENT
// ==========================================

const App = () => {
  // --- STATI ---
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Ciao. Come ti senti in questo momento?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  
  const [trackId, setTrackId] = useState(null);
  
  // STATO CHIAVE MUSICALE (Iniziamo in C Major)
  const [musicalKey, setMusicalKey] = useState('C Major'); 

  const moodRef = useRef({ valence: 0.5, energy: 0.5 }); 
  const [mode, setMode] = useState('flow'); 
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [burnInput, setBurnInput] = useState('');
  const [burnSignal, setBurnSignal] = useState(null); 
  const [ambientType, setAmbientType] = useState('off'); 
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  // --- REFS AUDIO ---
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  // --- AUDIO ENGINE ---

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

  // --- GENERAZIONE SUONO PARTICELLE (Sincronizzato con la Key) ---
  const triggerMergeSound = useCallback(() => {
    const ctx = initAudioContext();
    const t = ctx.currentTime;

    // 1. Ottieni le frequenze valide per la chiave corrente (es. C# Minor)
    const currentScale = getScaleFrequencies(musicalKey);
    
    // 2. Pesca una nota a caso dalla scala
    const freq = currentScale[Math.floor(Math.random() * currentScale.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = 'sine'; // Suono puro
    osc.frequency.value = freq;
    
    // Leggero pan stereo casuale
    panner.pan.value = (Math.random() * 2) - 1; 

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    // Inviluppo
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05); // Attack veloce
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5); // Decay lungo

    osc.start(t);
    osc.stop(t + 2.5);
  }, [musicalKey]); // Ricalcola la funzione quando musicalKey cambia!

  const triggerFireSound = () => {
    const ctx = initAudioContext();
    const t = ctx.currentTime;
    const duration = 4.0;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        if (Math.random() < 0.005) data[i] += (Math.random() * 0.5); 
        data[i] *= 3.5;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;
    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.value = 800; 
    const fireGain = ctx.createGain();
    noiseSrc.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(ctx.destination);
    fireGain.gain.setValueAtTime(0, t);
    fireGain.gain.linearRampToValueAtTime(0.8, t + 0.2); 
    fireGain.gain.exponentialRampToValueAtTime(0.4, t + 1.5); 
    fireGain.gain.exponentialRampToValueAtTime(0.01, t + duration); 
    fireFilter.frequency.setValueAtTime(800, t);
    fireFilter.frequency.exponentialRampToValueAtTime(200, t + duration);
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
    if (type === ambientType) { stopAudio(); return; }
    if (sourceNodeRef.current) sourceNodeRef.current.stop();
    if (!gainNodeRef.current) {
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;
    }
    if (!filterNodeRef.current) {
        const filter = ctx.createBiquadFilter();
        filter.connect(gainNodeRef.current);
        filterNodeRef.current = filter;
    }

    if (type === '432') {
      const source = ctx.createOscillator(); source.type = 'sine'; source.frequency.value = 432;
      filterNodeRef.current.type = 'allpass'; source.connect(filterNodeRef.current);
      source.start(); sourceNodeRef.current = source;
    } else if (type === 'binaural') {
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = 200; 
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = 206; 
      const gainL = ctx.createGain(); gainL.gain.value = 0.5;
      const gainR = ctx.createGain(); gainR.gain.value = 0.5;
      const pannerL = ctx.createStereoPanner(); pannerL.pan.value = -1;
      const pannerR = ctx.createStereoPanner(); pannerR.pan.value = 1;
      oscL.connect(pannerL).connect(gainL).connect(merger, 0, 0);
      oscR.connect(pannerR).connect(gainR).connect(merger, 0, 1);
      merger.connect(filterNodeRef.current);
      filterNodeRef.current.type = 'lowpass'; filterNodeRef.current.frequency.value = 1000; 
      oscL.start(); oscR.start();
      sourceNodeRef.current = { stop: () => { oscL.stop(); oscR.stop(); } };
    } else {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'green') {
           const b0 = 0.99886 * lastOut + white * 0.0555179; const b1 = 0.99332 * lastOut + white * 0.0750759;
           const b2 = 0.96900 * lastOut + white * 0.1538520; output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11; lastOut = output[i];
        } else if (type === 'brown') {
          output[i] = (lastOut + (0.02 * white)) / 1.02; lastOut = output[i]; output[i] *= 3.5; 
        } else if (type === 'pink') {
             const b0 = 0.99886 * lastOut + white * 0.0555179; const b1 = 0.99332 * lastOut + white * 0.0750759;
             const b2 = 0.96900 * lastOut + white * 0.1538520; output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11; lastOut = output[i];
        }
      }
      const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true; source.connect(filterNodeRef.current);
      if (type === 'green') { filterNodeRef.current.type = 'bandpass'; filterNodeRef.current.frequency.value = 500; filterNodeRef.current.Q.value = 0.5; } 
      else if (type === 'brown') { filterNodeRef.current.type = 'lowpass'; filterNodeRef.current.frequency.value = 800; } 
      else { filterNodeRef.current.type = 'lowpass'; filterNodeRef.current.frequency.value = 2000; }
      source.start(); sourceNodeRef.current = source;
    }
    gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1);
    setAmbientType(type);
  };

  useEffect(() => {
    let animationFrameId;
    const modulateBreathSound = () => {
      if (mode === 'breathe' && audioCtxRef.current && filterNodeRef.current && gainNodeRef.current && ambientType !== 'off' && ambientType !== '432') {
        const ctx = audioCtxRef.current;
        const time = Date.now() / 1000;
        const cycleDuration = 6.0; 
        const rawSin = Math.sin((time * (Math.PI * 2)) / cycleDuration - Math.PI / 2);
        const breathCycle = (rawSin + 1) / 2;
        const minFreq = 150; const maxFreq = 900;
        const targetFreq = minFreq + (breathCycle * (maxFreq - minFreq));
        filterNodeRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
        const baseVol = 0.4; const volMod = baseVol + (breathCycle * 0.2); 
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

  const handleVisualInteraction = useCallback((mouseX, mouseY, width, height) => {
    if (mode !== 'flow' || ambientType === 'off' || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ambientType !== '432') {
      const freq = 100 + (mouseX / width) * 4000;
      if (filterNodeRef.current) filterNodeRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    }
    const vol = 1 - (mouseY / height);
    if (gainNodeRef.current) gainNodeRef.current.gain.setTargetAtTime(Math.max(0, Math.min(0.8, vol)), ctx.currentTime, 0.1);
  }, [mode, ambientType]);

  // --- SEND MESSAGE & KEY EXTRACTION ---
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
      
      if (data.analysis?.mood) moodRef.current = data.analysis.mood;
      else if (data.mood) moodRef.current = data.mood;
      
      // ESTRAZIONE CHIAVE (Key)
      // Se l'API restituisce la chiave in 'track.key' (es. "C# Minor") la usiamo
      if (data.track) { 
        if (data.track.id) {
            setTrackId(data.track.id); 
            setShowChat(false); 
        }
        if (data.track.key) {
            console.log("Setting key to:", data.track.key);
            setMusicalKey(data.track.key); // Aggiorna lo stato, che aggiorna triggerMergeSound
        }
      } else if (data.analysis?.key) {
          // Fallback se è in analysis
          setMusicalKey(data.analysis.key);
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'bot', text: "Errore di connessione..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBurnSubmit = () => {
    if(!burnInput) return;
    setBurnSignal({ text: burnInput.toUpperCase(), id: Date.now() });
    setTimeout(() => { triggerFireSound(); }, 3000);
    setShowBurnModal(false);
    setBurnInput('');
  };

  const soundOptions = [
    { type: 'off', label: 'Muto', icon: <FaVolumeMute /> },
    { type: 'brown', label: 'Earth', icon: <GiEarthAmerica /> },
    { type: 'green', label: 'Forest', icon: <FaTree /> },
    { type: 'pink', label: 'Rain', icon: <FaCloudRain /> },
    { type: 'binaural', label: 'Theta', icon: <FaBrain /> },
    { type: '432', label: '432 Hz', icon: <FaOm /> },
  ];

  const styles = {
    container: { position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
    visualLayer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 },
    dockContainer: { position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', alignItems: 'center', zIndex: 20, padding: '10px 25px', borderRadius: '50px', backgroundColor: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    toolButton: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'white', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative' },
    activeBreathe: { backgroundColor: 'rgba(0, 200, 255, 0.2)', color: '#00c8ff', boxShadow: '0 0 15px rgba(0, 200, 255, 0.4)' },
    activeBurn: { backgroundColor: 'rgba(255, 100, 50, 0.2)', color: '#ff6432' },
    activeSound: { backgroundColor: 'rgba(50, 200, 100, 0.2)', color: '#32c864' },
    soundMenu: { position: 'absolute', bottom: '70px', left: '50%', transform: 'translateX(-50%)', width: '220px', backgroundColor: 'rgba(30, 30, 40, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '15px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', opacity: showSoundMenu ? 1 : 0, pointerEvents: showSoundMenu ? 'auto' : 'none', transition: 'opacity 0.2s ease, transform 0.2s ease', transformOrigin: 'bottom center', scale: showSoundMenu ? '1' : '0.9' },
    soundItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 15px', color: '#ccc', fontSize: '0.95rem', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s', border: 'none', background: 'transparent', width: '100%', textAlign: 'left' },
    soundItemActive: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' },
    fab: { position: 'absolute', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#4da6ff', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(77, 166, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 30, transition: 'transform 0.2s', fontSize: '1.5rem' },
    chatContainer: { position: 'absolute', bottom: '100px', right: '30px', width: '350px', height: '500px', maxHeight: '60vh', backgroundColor: 'rgba(25, 25, 35, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 30, animation: 'fadeInUp 0.3s ease' },
    chatHeader: { padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' },
    chatBody: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
    msgBubble: { padding: '12px 16px', borderRadius: '18px', fontSize: '0.95rem', lineHeight: '1.4', maxWidth: '80%' },
    botMsg: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', color: '#eee', borderBottomLeftRadius: '4px' },
    userMsg: { alignSelf: 'flex-end', backgroundColor: '#4da6ff', color: 'white', borderBottomRightRadius: '4px', boxShadow: '0 2px 10px rgba(77, 166, 255, 0.2)' },
    inputWrapper: { padding: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)' },
    chatInput: { flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '25px', padding: '12px 18px', color: 'white', outline: 'none', fontSize: '0.95rem' },
    sendBtn: { width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: 'transparent', color: '#4da6ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'transform 0.2s' },
    modalOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    modalContent: { background: 'linear-gradient(135deg, #2a1a1a, #1a1a1a)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 100, 50, 0.3)', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 0 50px rgba(255, 60, 0, 0.2)' },
    modalInput: { width: '100%', padding: '15px', marginTop: '20px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', borderRadius: '10px', color: 'white', fontSize: '1rem', outline: 'none' },
    soundMenu: {
      position: 'absolute',
      bottom: '80px', // Un po' più in alto rispetto alla dock
      left: '50%',
      transform: 'translateX(-50%)', // Centrato perfettamente
      width: '240px', // Leggermente più largo per eleganza
      backgroundColor: 'rgba(18, 18, 24, 0.95)', // Sfondo quasi nero profondo
      backdropFilter: 'blur(20px)', // Sfocatura forte
      borderRadius: '16px',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px', // Spazio tra gli elementi
      border: '1px solid rgba(255,255,255,0.08)', // Bordo sottilissimo
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)', // Ombra profonda
      opacity: showSoundMenu ? 1 : 0,
      pointerEvents: showSoundMenu ? 'auto' : 'none',
      transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
      transformOrigin: 'bottom center',
      scale: showSoundMenu ? '1' : '0.95', // Leggero zoom in entrata
      translate: showSoundMenu ? '0 0' : '0 10px' // Leggero slide in entrata
    },

    soundItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '12px 16px',
      color: '#888', // Colore inattivo (grigio spento)
      fontSize: '0.95rem',
      fontWeight: '500',
      cursor: 'pointer',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      border: 'none',
      background: 'transparent', // FONDAMENTALE: Sfondo trasparente di base
      width: '100%',
      textAlign: 'left',
      outline: 'none'
    },

    soundItemActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Sfondo evidenziato (grigio chiaro trasparente)
      color: '#fff', // Testo bianco acceso
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)' // Leggera ombra per staccarlo
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.visualLayer}>
        <EvolutionaryVisualizer 
          moodData={moodRef.current}
          mode={mode}
          burnSignal={burnSignal}
          ambientType={ambientType}
          onInteraction={handleVisualInteraction}
          onParticleMerge={triggerMergeSound} // Passiamo la funzione aggiornata!
        />
      </div>

      <div style={styles.dockContainer}>
        <button style={{...styles.toolButton, ...(mode === 'breathe' ? styles.activeBreathe : {})}} onClick={() => setMode(mode === 'flow' ? 'breathe' : 'flow')} title="Respiro Guidato">
          {mode === 'breathe' ? <GiLungs /> : <BsStars />}
        </button>
        <button style={{...styles.toolButton, ...(showBurnModal ? styles.activeBurn : {})}} onClick={() => setShowBurnModal(true)} title="Brucia Pensieri">
          <FaFire />
        </button>
{/* Sound Menu Trigger & Dropdown */}
        <div style={{position: 'relative'}}>
          <button 
            style={{...styles.toolButton, ...(ambientType !== 'off' ? styles.activeSound : {})}} 
            onClick={() => setShowSoundMenu(!showSoundMenu)}
            title="Suoni Ambientali"
          >
            <FaMusic />
          </button>

          {/* MENU A TENDINA STILIZZATO */}
          <div style={styles.soundMenu}>
            {soundOptions.map((opt) => {
              const isActive = ambientType === opt.type;
              return (
                <button
                  key={opt.type}
                  style={{
                    ...styles.soundItem,
                    ...(isActive ? styles.soundItemActive : {})
                  }}
                  // Aggiungiamo un effetto hover simulato via inline style (opzionale ma carino)
                  onMouseEnter={(e) => {
                    if(!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.color = '#ccc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if(!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#888';
                    }
                  }}
                  onClick={() => { playAmbient(opt.type); setShowSoundMenu(false); }}
                >
                  <span style={{
                    fontSize: '1.1rem', 
                    width: '24px', 
                    display: 'flex', 
                    justifyContent: 'center',
                    opacity: isActive ? 1 : 0.7 
                  }}>
                    {opt.icon}
                  </span> 
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showBurnModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{color: '#ff6432', margin: 0, fontSize: '1.5rem'}}>Brucia un pensiero</h2>
            <input style={styles.modalInput} type="text" placeholder="Cosa vuoi lasciar andare?" value={burnInput} onChange={(e) => setBurnInput(e.target.value)} autoFocus />
            <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
              <button onClick={handleBurnSubmit} style={{padding: '12px 25px', borderRadius: '30px', border: 'none', background: 'linear-gradient(45deg, #ff4d4d, #ff9933)', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'}}>BRUCIA <FaFire style={{marginLeft: 5}}/></button>
              <button onClick={() => setShowBurnModal(false)} style={{padding: '12px 20px', borderRadius: '30px', border: 'none', background: 'transparent', color: '#aaa', cursor: 'pointer'}}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {!showChat && (
        <button style={styles.fab} onClick={() => setShowChat(true)}>
          <BsChatDotsFill />
        </button>
      )}
      
      {showChat && (
        <div style={styles.chatContainer}>
          <div style={styles.chatHeader}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{width: 10, height: 10, background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 8px #00ff88'}}></div>
              <span style={{fontWeight: 'bold', color: 'white'}}>AI Therapist</span>
            </div>
            <button onClick={() => setShowChat(false)} style={{background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem'}}><FaTimes /></button>
          </div>
          <div style={styles.chatBody}>
            {messages.map((msg, i) => (
              <div key={i} style={{...styles.msgBubble, ...(msg.role === 'user' ? styles.userMsg : styles.botMsg)}}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div style={{...styles.msgBubble, ...styles.botMsg, fontStyle: 'italic', opacity: 0.7}}>Sta scrivendo...</div>}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.inputWrapper}>
            <input style={styles.chatInput} type="text" placeholder="Scrivi un pensiero..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} disabled={isLoading} />
            <button style={styles.sendBtn} onClick={sendMessage} disabled={isLoading}><FaPaperPlane /></button>
          </div>
        </div>
      )}

      {trackId && (
        <div style={{position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', zIndex: 25}}>
          <iframe title="Spotify" src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)'}}></iframe>
        </div>
      )}
    </div>
  );
};

export default App;