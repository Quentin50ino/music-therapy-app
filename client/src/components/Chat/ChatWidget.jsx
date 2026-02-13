import React, { useRef, useEffect, useState } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const ChatWidget = ({ messages, isLoading, onSend, onClose, displayState = 'open' }) => {
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

  const widgetClass = [
    'chat-widget',
    displayState === 'closing' ? 'chat-closing' : '',
    displayState === 'opening' ? 'chat-opening' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={widgetClass}>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-status-dot" />
          <span className="chat-title">Serenify Therapist</span>
        </div>
        <button type="button" onClick={onClose} className="chat-close-btn" aria-label="Close chat">
          <FaTimes />
        </button>
      </div>

      <div className="chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="chat-message chat-message-bot chat-message-loading">
            Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-area">
        <input 
          className="chat-input"
          type="text" 
          placeholder="Share what is on your mind..." 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          disabled={isLoading} 
        />
        <button type="button" className="chat-send-btn" onClick={handleSend} disabled={isLoading} aria-label="Send message">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
