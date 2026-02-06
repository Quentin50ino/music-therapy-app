import { useState, useRef } from 'react';

export const useChat = (setMusicalKey) => {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi. How do you feel today?' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const [bpm, setBpm] = useState(100);
  
  const moodRef = useRef({ valence: 0.5, energy: 0.5 }); 

  const sendMessage = async (userText) => {
    if (!userText || !userText.trim()) return;
    
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      
      const data = await response.json();
      
      // 2. Aggiungi risposta bot
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
      
      // 3. Aggiorna Mood
      if (data.analysis?.mood) moodRef.current = data.analysis.mood;
      else if (data.mood) moodRef.current = data.mood;

      // 4. ESTRAZIONE BPM
      if (data.analysis?.bpm) {
          console.log("Setting BPM to:", data.analysis.bpm);
          setBpm(data.analysis.bpm);
      }
      
      // 5. Aggiorna Musica e Chiave
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
      setMessages((prev) => [...prev, { role: 'bot', text: "Errore di connessione..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    trackId,
    setTrackId,
    moodRef,
    bpm, // Esportiamo il BPM
    sendMessage
  };
};