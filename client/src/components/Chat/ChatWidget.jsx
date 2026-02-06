import React, { useRef, useEffect, useState } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const ChatWidget = ({ messages, isLoading, onSend, onClose }) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSend(inputText);
      setInputText('');
    }
  };

  const styles = {
    container: {
      position: 'absolute', bottom: '100px', right: '30px',
      width: '350px', height: '500px', maxHeight: '60vh',
      backgroundColor: 'rgba(25, 25, 35, 0.85)', backdropFilter: 'blur(20px)',
      borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 30,
      animation: 'fadeInUp 0.3s ease'
    },
    header: {
      padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(255,255,255,0.02)'
    },
    body: {
      flex: 1, overflowY: 'auto', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '15px'
    },
    msg: {
      padding: '12px 16px', borderRadius: '18px', fontSize: '0.95rem',
      lineHeight: '1.4', maxWidth: '80%'
    },
    botMsg: {
      alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)',
      color: '#eee', borderBottomLeftRadius: '4px'
    },
    userMsg: {
      alignSelf: 'flex-end', backgroundColor: '#4da6ff', color: 'white',
      borderBottomRightRadius: '4px', boxShadow: '0 2px 10px rgba(77, 166, 255, 0.2)'
    },
    inputArea: {
      padding: '15px', borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)'
    },
    input: {
      flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none',
      borderRadius: '25px', padding: '12px 18px', color: 'white',
      outline: 'none', fontSize: '0.95rem'
    },
    sendBtn: {
      width: '45px', height: '45px', borderRadius: '50%', border: 'none',
      background: 'transparent', color: '#4da6ff', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div style={{width: 10, height: 10, background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 8px #00ff88'}}></div>
          <span style={{fontWeight: 'bold', color: 'white'}}>Serenify Therapist</span>
        </div>
        <button onClick={onClose} style={{background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem'}}>
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div style={styles.body}>
        {messages.map((msg, i) => (
          <div key={i} style={{...styles.msg, ...(msg.role === 'user' ? styles.userMsg : styles.botMsg)}}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div style={{...styles.msg, ...styles.botMsg, fontStyle: 'italic', opacity: 0.7}}>
            Sta scrivendo...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <input 
          style={styles.input} 
          type="text" 
          placeholder="Scrivi un pensiero..." 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          disabled={isLoading} 
        />
        <button style={styles.sendBtn} onClick={handleSend} disabled={isLoading}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;