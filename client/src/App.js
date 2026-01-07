import React, { useState, useEffect, useRef } from 'react';
import Sketch from 'react-p5';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Ciao. Dimmi come ti senti, troverò la musica per te.' }
  ]);
  const [input, setInput] = useState('');
  const [trackId, setTrackId] = useState(null);
  
  // Parametri per i visuals (Default: Neutro)
  const [visuals, setVisuals] = useState({ valence: 0.5, energy: 0.5 });
  
  // Riferimento per scorrere la chat in basso
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('botResponse', (data) => {
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
      if (data.trackId) setTrackId(data.trackId);
      if (data.mood) setVisuals(data.mood);
    });
    return () => socket.off('botResponse');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    socket.emit('userMessage', input);
    setInput('');
  };

  // --- CONFIGURAZIONE P5.JS ---
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
  };

  const draw = (p5) => {
    // Colori basati sulla Valenza (Triste=Blu, Felice=Giallo)
    const r = p5.map(visuals.valence, 0, 1, 20, 255);
    const g = p5.map(visuals.valence, 0, 1, 30, 200);
    const b = p5.map(visuals.energy, 0, 1, 100, 50);

    // Sfondo semi-trasparente per effetto scia
    p5.background(r, g, b, 20); 

    // Calcoli per il movimento
    const speed = p5.map(visuals.energy, 0, 1, 0.01, 0.2);
    const chaos = p5.map(visuals.energy, 0, 1, 50, 300);

    p5.translate(p5.width / 2, p5.height / 2);
    p5.noFill();
    p5.stroke(255, 150);
    p5.strokeWeight(2);

    p5.beginShape();
    for (let i = 0; i < p5.TWO_PI; i += 0.1) {
      // Forma che pulsa e cambia
      let offset = p5.map(p5.noise(i * 0.5, p5.frameCount * speed), 0, 1, -chaos, chaos);
      let rShape = 150 + offset;
      let x = rShape * p5.cos(i);
      let y = rShape * p5.sin(i);
      p5.vertex(x, y);
    }
    p5.endShape(p5.CLOSE);
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  return (
    <div className="App">
      {/* Sfondo 3D/Visual */}
      <div className="visual-background">
        <Sketch setup={setup} draw={draw} windowResized={windowResized} />
      </div>

      {/* Interfaccia UI */}
      <div className="ui-container">
        <div className="chat-box">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Player Spotify */}
        {trackId && (
          <div className="spotify-player">
            <iframe
              title="Spotify Player"
              src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        )}

        <div className="input-area">
          <input
            type="text"
            placeholder="Come stai?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Invia</button>
        </div>
      </div>
    </div>
  );
}

export default App;
