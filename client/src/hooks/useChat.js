import { useState, useRef } from 'react';

export const useChat = (setMusicalKey) => {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi. How do you feel today?' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const [bpm, setBpm] = useState(100);
  
  const moodRef = useRef({ valence: 0.5, energy: 0.5 }); 
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const sendMessage = async (userText) => {
    if (!userText || !userText.trim()) return;
    
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.reply || 'Chat request failed');
      }
      
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply || 'I am here with you.' }]);
      
      if (data.analysis?.mood) moodRef.current = data.analysis.mood;
      else if (data.mood) moodRef.current = data.mood;

      if (data.analysis?.bpm) {
          console.log("Setting BPM to:", data.analysis.bpm);
          setBpm(data.analysis.bpm);
      }
      
      if (data.track) { 
        if (data.track.id) {
            setTrackId(data.track.id); 
        }
        if (data.track.key) {
            setMusicalKey(data.track.key); 
        }
      } else if (data.analysis?.key) {
          setMusicalKey(data.analysis.key);
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'bot', text: "I cannot reach the therapist server right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const reframeThought = async (thought) => {
    const cleanThought = String(thought || '').trim();
    if (!cleanThought) return [];

    const response = await fetch(`${API_BASE_URL}/burn-reframe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thought: cleanThought }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to generate reframes');
    }

    if (!Array.isArray(data.reframes) || data.reframes.length === 0) {
      throw new Error('No reframes returned from server');
    }

    return data.reframes.slice(0, 4);
  };

  return {
    messages,
    isLoading,
    trackId,
    setTrackId,
    moodRef,
    bpm, 
    sendMessage,
    reframeThought
  };
};
