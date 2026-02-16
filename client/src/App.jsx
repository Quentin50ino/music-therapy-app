<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useRef } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
import './App.css'; 

// --- IMPORT COMPONENTI UI ---
import EvolutionaryVisualizer from './components/EvolutionaryVisualizer';
import Dock from './components/Dock/Dock';
import BurnModal from './components/Dock/BurnModal';
<<<<<<< HEAD
import BurnReframeOverlay from './components/Dock/BurnReframeOverlay';
import ChatWidget from './components/Chat/ChatWidget';
import TherapistParticle from './components/Chat/TherapistParticle';
import SerenifyLogo from './components/Brand/SerenifyLogo';
=======
import ChatWidget from './components/Chat/ChatWidget';
import Fab from './components/Chat/Fab';
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
import SpotifyPlayer from './components/Player/SpotifyPlayer';

// --- IMPORT CUSTOM HOOKS (LOGICA) ---
import { useAudioEngine } from './hooks/useAudioEngine';
import { useChat } from './hooks/useChat';

const App = () => {
<<<<<<< HEAD
  const ASSISTANT_TRANSITION_MS = 520;

  // --- STATI UI ---
  const [mode, setMode] = useState('flow'); 
  const [breathProfileIndex, setBreathProfileIndex] = useState(3);
  const [assistantState, setAssistantState] = useState('open');
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [musicalKey, setMusicalKey] = useState('C Major'); 
  const [burnSignal, setBurnSignal] = useState(null); 
  const [burnReframeChoices, setBurnReframeChoices] = useState(null);
  const assistantStateRef = useRef('open');
  const assistantTransitionRef = useRef(null);
=======
  // --- STATI UI ---
  const [mode, setMode] = useState('flow'); 
  const [showChat, setShowChat] = useState(true);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [musicalKey, setMusicalKey] = useState('C Major'); 
  const [burnSignal, setBurnSignal] = useState(null); 
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e

  // --- HOOKS ---
  const { 
    messages, 
    isLoading, 
    trackId, 
    moodRef, 
    bpm,
<<<<<<< HEAD
    sendMessage,
    reframeThought
=======
    sendMessage 
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
  } = useChat(setMusicalKey);

  const { 
    ambientType, 
    playAmbient, 
    triggerMergeSound, 
    triggerFireSound, 
    handleVisualInteraction 
  } = useAudioEngine(musicalKey, mode);

<<<<<<< HEAD
  const transitionAssistant = useCallback((targetState) => {
    const currentState = assistantStateRef.current;
    const isClosing = targetState === 'closed';
    const isAlreadyClosing = currentState === 'closed' || currentState === 'closing';
    const isAlreadyOpening = currentState === 'open' || currentState === 'opening';

    if ((isClosing && isAlreadyClosing) || (!isClosing && isAlreadyOpening)) return;

    if (assistantTransitionRef.current) {
      clearTimeout(assistantTransitionRef.current);
      assistantTransitionRef.current = null;
    }

    const transientState = isClosing ? 'closing' : 'opening';
    assistantStateRef.current = transientState;
    setAssistantState(transientState);

    assistantTransitionRef.current = setTimeout(() => {
      assistantStateRef.current = targetState;
      setAssistantState(targetState);
      assistantTransitionRef.current = null;
    }, ASSISTANT_TRANSITION_MS);
  }, []);

  const closeAssistant = useCallback(() => {
    transitionAssistant('closed');
  }, [transitionAssistant]);

  const openAssistant = useCallback(() => {
    transitionAssistant('open');
  }, [transitionAssistant]);

  useEffect(() => {
    if (mode === 'breathe') {
      closeAssistant();
    }
  }, [mode, closeAssistant]);

  useEffect(() => {
    return () => {
      if (assistantTransitionRef.current) {
        clearTimeout(assistantTransitionRef.current);
      }
    };
  }, []);

  const handleBurnGenerateReframes = useCallback(async (thoughtText) => {
    const thought = String(thoughtText || '').trim();
    if (!thought) return;

    const reframes = await reframeThought(thought);
    setBurnSignal({
      id: Date.now(),
      text: thought,
      displayText: thought,
      originalThought: thought,
      effectStyle: 'fire-original'
    });
    setTimeout(() => { triggerFireSound(); }, 900);
    setBurnReframeChoices({ originalThought: thought, reframes });
    setShowBurnModal(false);
  }, [reframeThought, triggerFireSound]);

  const handleSelectReframe = useCallback((selectedReframe) => {
    if (!selectedReframe) return;
    setBurnSignal({
      id: Date.now(),
      text: selectedReframe,
      displayText: selectedReframe,
      originalThought: burnReframeChoices?.originalThought || '',
      effectStyle: 'calm-selected'
    });
    setBurnReframeChoices(null);
  }, [burnReframeChoices?.originalThought]);

  const handleBurnClick = useCallback(() => {
    closeAssistant();
    setBurnReframeChoices(null);
    setShowBurnModal(true);
  }, [closeAssistant]);

  const handleToggleBreathe = useCallback(() => {
    setMode((prevMode) => {
      if (prevMode === 'flow') {
        setBreathProfileIndex((prevIndex) => (prevIndex + 1) % 4);
        return 'breathe';
      }
      return 'flow';
    });
  }, []);

  return (
    <div className="app-shell">
      <div className="app-atmosphere-layer" />

      <div className="app-visual-layer">
        <EvolutionaryVisualizer 
          moodData={moodRef.current}
          mode={mode}
          breathProfileIndex={breathProfileIndex}
=======
  const handleBurnConfirm = (text) => {
    if (!text) return;
    setBurnSignal({ text: text.toUpperCase(), id: Date.now() });
    setTimeout(() => { triggerFireSound(); }, 3000);
    setShowBurnModal(false);
  };

  const layoutStyles = {
    container: { position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
    visualLayer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }
  };

  return (
    <div style={layoutStyles.container}>
      
      <div style={layoutStyles.visualLayer}>
        <EvolutionaryVisualizer 
          moodData={moodRef.current}
          mode={mode}
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
          burnSignal={burnSignal}
          ambientType={ambientType}
          bpm={bpm} 
          onInteraction={handleVisualInteraction}
          onParticleMerge={triggerMergeSound}
        />
      </div>

<<<<<<< HEAD
      <SerenifyLogo />

      <Dock 
        mode={mode} 
        onToggleBreathe={handleToggleBreathe}
        onBurnClick={handleBurnClick}
=======
      <Dock 
        mode={mode} 
        setMode={setMode} 
        onBurnClick={() => setShowBurnModal(true)}
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
        ambientType={ambientType}
        onPlayAmbient={playAmbient}
      />

      {showBurnModal && (
        <BurnModal 
<<<<<<< HEAD
          onCancel={() => setShowBurnModal(false)}
          onGenerateReframes={handleBurnGenerateReframes}
        />
      )}

      {burnReframeChoices && (
        <BurnReframeOverlay
          originalThought={burnReframeChoices.originalThought}
          reframes={burnReframeChoices.reframes}
          onSelect={handleSelectReframe}
          onDismiss={() => setBurnReframeChoices(null)}
        />
      )}

      {assistantState !== 'closed' && (
=======
          onConfirm={handleBurnConfirm} 
          onCancel={() => setShowBurnModal(false)} 
        />
      )}

      {showChat ? (
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
        <ChatWidget 
          messages={messages} 
          isLoading={isLoading} 
          onSend={sendMessage} 
<<<<<<< HEAD
          onClose={closeAssistant}
          displayState={assistantState}
        />
      )}

      <TherapistParticle
        assistantState={assistantState}
        onActivate={openAssistant}
      />
=======
          onClose={() => setShowChat(false)} 
        />
      ) : (
        <Fab onClick={() => setShowChat(true)} />
      )}
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
      
      <SpotifyPlayer trackId={trackId} />

    </div>
  );
};

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
