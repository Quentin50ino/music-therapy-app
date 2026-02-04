// src/hooks/useChat.js
import { useState, useRef } from 'react';

export const useChat = (setMusicalKey) => {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Ciao. Come ti senti in questo momento?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const moodRef = useRef({ valence: 0.5, energy: 0.5 }); 

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
      
      if (data.track) { 
        if (data.track.id) {
            setTrackId(data.track.id); 
        }
        if (data.track.key) {
            console.log("Setting key to:", data.track.key);
            setMusicalKey(data.track.key); 
        }
      } else if (data.analysis?.key) {
          setMusicalKey(data.analysis.key);
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'bot', text: "Errore di connessione..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    trackId,
    setTrackId,
    moodRef,
    sendMessage
  };
};