import { useState, useRef } from 'react';

export const useChat = (setMusicalKey) => {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi. How do you feel today?' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const [bpm, setBpm] = useState(100);
  
  const moodRef = useRef({ valence: 0.5, energy: 0.5 }); 
<<<<<<< HEAD
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
=======
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e

  const sendMessage = async (userText) => {
    if (!userText || !userText.trim()) return;
    
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
<<<<<<< HEAD
=======
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
<<<<<<< HEAD

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.reply || 'Chat request failed');
      }
      
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply || 'I am here with you.' }]);
=======
      
      const data = await response.json();
      
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
      
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
<<<<<<< HEAD
      setMessages((prev) => [...prev, { role: 'bot', text: "I cannot reach the therapist server right now." }]);
=======
      setMessages((prev) => [...prev, { role: 'bot', text: "Errore di connessione..." }]);
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
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

=======
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
  return {
    messages,
    isLoading,
    trackId,
    setTrackId,
    moodRef,
    bpm, 
<<<<<<< HEAD
    sendMessage,
    reframeThought
  };
};
=======
    sendMessage
  };
};
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
