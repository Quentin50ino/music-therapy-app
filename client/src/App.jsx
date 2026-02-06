import React, { useState, useEffect } from 'react';
import './App.css'; 

// --- IMPORT COMPONENTI UI ---
import EvolutionaryVisualizer from './components/EvolutionaryVisualizer';
import Dock from './components/Dock/Dock';
import BurnModal from './components/Dock/BurnModal';
import ChatWidget from './components/Chat/ChatWidget';
import Fab from './components/Chat/Fab';
import SpotifyPlayer from './components/Player/SpotifyPlayer';

// --- IMPORT CUSTOM HOOKS (LOGICA) ---
import { useAudioEngine } from './hooks/useAudioEngine';
import { useChat } from './hooks/useChat';

const App = () => {
  // --- STATI UI ---
  const [mode, setMode] = useState('flow'); 
  const [showChat, setShowChat] = useState(true);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [musicalKey, setMusicalKey] = useState('C Major'); 
  const [burnSignal, setBurnSignal] = useState(null); 

  // --- HOOKS ---
  const { 
    messages, 
    isLoading, 
    trackId, 
    moodRef, 
    bpm,
    sendMessage 
  } = useChat(setMusicalKey);

  const { 
    ambientType, 
    playAmbient, 
    triggerMergeSound, 
    triggerFireSound, 
    handleVisualInteraction 
  } = useAudioEngine(musicalKey, mode);

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
          burnSignal={burnSignal}
          ambientType={ambientType}
          bpm={bpm} 
          onInteraction={handleVisualInteraction}
          onParticleMerge={triggerMergeSound}
        />
      </div>

      <Dock 
        mode={mode} 
        setMode={setMode} 
        onBurnClick={() => setShowBurnModal(true)}
        ambientType={ambientType}
        onPlayAmbient={playAmbient}
      />

      {showBurnModal && (
        <BurnModal 
          onConfirm={handleBurnConfirm} 
          onCancel={() => setShowBurnModal(false)} 
        />
      )}

      {showChat ? (
        <ChatWidget 
          messages={messages} 
          isLoading={isLoading} 
          onSend={sendMessage} 
          onClose={() => setShowChat(false)} 
        />
      ) : (
        <Fab onClick={() => setShowChat(true)} />
      )}
      
      <SpotifyPlayer trackId={trackId} />

    </div>
  );
};

export default App;