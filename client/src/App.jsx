import React, { useState, useEffect } from 'react';
import './App.css'; 
// Custom components Import
import EvolutionaryVisualizer from './components/EvolutionaryVisualizer';
import Dock from './components/Dock/Dock';
import BurnModal from './components/Dock/BurnModal';
import ChatWidget from './components/Chat/ChatWidget';
import Fab from './components/Chat/Fab';
import SpotifyPlayer from './components/Player/SpotifyPlayer';
// custom hooks Import
import { useAudioEngine } from './hooks/useAudioEngine';
import { useChat } from './hooks/useChat';

const App = () => {

  const [mode, setMode] = useState('flow'); // 'flow' | 'breathe'
  const [showChat, setShowChat] = useState(true);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [musicalKey, setMusicalKey] = useState('C Major'); 
  const [burnSignal, setBurnSignal] = useState(null); 
  
  // Hook Chat: handle messages, update the musical key based on mood/track
  const { 
    messages, 
    isLoading, 
    trackId, 
    moodRef, 
    sendMessage 
  } = useChat(setMusicalKey);

  // Hook Audio: handle ambient sounds and interaction sounds
  // Depends on musicalKey and mode
  const { 
    ambientType, 
    playAmbient, 
    triggerMergeSound, 
    triggerFireSound, 
    handleVisualInteraction 
  } = useAudioEngine(musicalKey, mode);

  // Chiude la chat automaticamente quando inizia una canzone
  useEffect(() => {
    if (trackId) setShowChat(false);
  }, [trackId]);

  const handleBurnConfirm = (text) => {
    if (!text) return;

    setBurnSignal({ text: text.toUpperCase(), id: Date.now() });
    
    setTimeout(() => { 
      triggerFireSound(); 
    }, 3000);
    
    setShowBurnModal(false);
  };

  const layoutStyles = {
    container: {
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#000',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    },
    visualLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0
    }
  };

  return (
    <div style={layoutStyles.container}>
      
      {/* BACKGROUND GENERATIVO (p5.js) */}
      <div style={layoutStyles.visualLayer}>
        <EvolutionaryVisualizer 
          moodData={moodRef.current}
          mode={mode}
          burnSignal={burnSignal}
          ambientType={ambientType}
          onInteraction={handleVisualInteraction}
          onParticleMerge={triggerMergeSound}
        />
      </div>

      {/* DOCK BAR (Menu suoni, Respiro, Fuoco) */}
      <Dock 
        mode={mode} 
        setMode={setMode} 
        onBurnClick={() => setShowBurnModal(true)}
        ambientType={ambientType}
        onPlayAmbient={playAmbient}
      />

      {/* MODALE "BRUCIA PENSIERI" */}
      {showBurnModal && (
        <BurnModal 
          onConfirm={handleBurnConfirm} 
          onCancel={() => setShowBurnModal(false)} 
        />
      )}

      {/* SISTEMA CHAT (Widget o Bottone FAB) */}
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
      
      {/* PLAYER MUSICALE (Appare solo se c'è una traccia) */}
      <SpotifyPlayer trackId={trackId} />

    </div>
  );
};

export default App;