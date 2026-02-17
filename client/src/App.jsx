import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css'; 

// --- IMPORT COMPONENTI UI ---
import EvolutionaryVisualizer from './components/EvolutionaryVisualizer';
import Dock from './components/Dock/Dock';
import BurnModal from './components/Dock/BurnModal';
import BurnReframeOverlay from './components/Dock/BurnReframeOverlay';
import ChatWidget from './components/Chat/ChatWidget';
import TherapistParticle from './components/Chat/TherapistParticle';
import SerenifyLogo from './components/Brand/SerenifyLogo';
import SpotifyPlayer from './components/Player/SpotifyPlayer';

// --- IMPORT CUSTOM HOOKS (LOGICA) ---
import { useAudioEngine } from './hooks/useAudioEngine';
import { useChat } from './hooks/useChat';

const App = () => {
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

  // --- HOOKS ---
  const { 
    messages, 
    isLoading, 
    trackId, 
    moodRef, 
    bpm,
    sendMessage,
    reframeThought
  } = useChat(setMusicalKey);

  const { 
    ambientType, 
    playAmbient, 
    triggerMergeSound, 
    triggerFireSound, 
    handleVisualInteraction 
  } = useAudioEngine(musicalKey, mode);

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

    // 1. Ottieni le frasi dall'AI (l'utente aspetta un attimo qui, va bene)
    const reframes = await reframeThought(thought);

    // 2. Chiudi il modale di input immediatamente per liberare la visuale
    setShowBurnModal(false);

    // 3. Innesca l'effetto visivo del fuoco (Burn Signal)
    setBurnSignal({
      id: Date.now(),
      text: thought,
      displayText: thought,
      originalThought: thought,
      effectStyle: 'fire-original'
    });

    setTimeout(() => { triggerFireSound(); }, 3000);

    setTimeout(() => {
        setBurnReframeChoices({ originalThought: thought, reframes: reframes });
    }, 3500);

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
          burnSignal={burnSignal}
          ambientType={ambientType}
          bpm={bpm} 
          onInteraction={handleVisualInteraction}
          onParticleMerge={triggerMergeSound}
        />
      </div>

      <SerenifyLogo />

      <Dock 
        mode={mode} 
        onToggleBreathe={handleToggleBreathe}
        onBurnClick={handleBurnClick}
        ambientType={ambientType}
        onPlayAmbient={playAmbient}
      />

      {showBurnModal && (
        <BurnModal 
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
        <ChatWidget 
          messages={messages} 
          isLoading={isLoading} 
          onSend={sendMessage} 
          onClose={closeAssistant}
          displayState={assistantState}
        />
      )}

      <TherapistParticle
        assistantState={assistantState}
        onActivate={openAssistant}
      />
      
      <SpotifyPlayer trackId={trackId} />

    </div>
  );
};

export default App;
