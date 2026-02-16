import React, { useState } from 'react';
<<<<<<< HEAD
import { BsStars } from 'react-icons/bs';

const BurnModal = ({ onCancel, onGenerateReframes }) => {
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canGenerate = inputValue.trim().length > 4 && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate || !onGenerateReframes) return;
    setErrorMessage('');
    setIsGenerating(true);
    try {
      await onGenerateReframes(inputValue);
    } catch (error) {
      console.error(error);
      setErrorMessage('Could not reach Gemini right now. Try again in a moment.');
    } finally {
      setIsGenerating(false);
=======
import { FaFire } from 'react-icons/fa';

const BurnModal = ({ onConfirm, onCancel }) => {
  const [inputValue, setInputValue] = useState('');

  const styles = {
    overlay: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    },
    content: {
      background: 'linear-gradient(135deg, #2a1a1a, #1a1a1a)', padding: '40px',
      borderRadius: '20px', border: '1px solid rgba(255, 100, 50, 0.3)',
      width: '90%', maxWidth: '400px', textAlign: 'center',
      boxShadow: '0 0 50px rgba(255, 60, 0, 0.2)'
    },
    input: {
      width: '100%', padding: '15px', marginTop: '20px', marginBottom: '20px',
      background: 'rgba(0,0,0,0.3)', border: '1px solid #444', borderRadius: '10px',
      color: 'white', fontSize: '1rem', outline: 'none'
    },
    btnConfirm: {
      padding: '12px 25px', borderRadius: '30px', border: 'none',
      background: 'linear-gradient(45deg, #ff4d4d, #ff9933)', color: 'white',
      fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px'
    },
    btnCancel: {
      padding: '12px 20px', borderRadius: '30px', border: 'none',
      background: 'transparent', color: '#aaa', cursor: 'pointer'
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    }
  };

  return (
<<<<<<< HEAD
    <div className="burn-modal-overlay">
      <div className="burn-modal-card">
        <h2 className="burn-modal-title">Burn a thought</h2>

        <textarea
          className="burn-modal-input"
          placeholder="Write the thought you want to burn..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
          rows={4}
        />

        {errorMessage && <p className="burn-modal-error">{errorMessage}</p>}

        <div className="burn-modal-actions">
          <button className="burn-modal-cancel" onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="burn-modal-generate"
            onClick={handleGenerate}
            type="button"
            disabled={!canGenerate}
          >
            {isGenerating ? 'Generating...' : 'Generate 4 reframes'}
            <BsStars />
=======
    <div style={styles.overlay}>
      <div style={styles.content}>
        <h2 style={{color: '#ff6432', margin: 0, fontSize: '1.5rem'}}>What do you want to burn?</h2>
        <input 
          style={styles.input} 
          type="text" 
          placeholder="What do you want to burn?" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          autoFocus 
        />
        <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
          <button style={styles.btnCancel} onClick={onCancel}>
            cancel
          </button>
          <button style={styles.btnConfirm} onClick={() => onConfirm(inputValue)}>
            BURN <FaFire />
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
          </button>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default BurnModal;
=======
export default BurnModal;
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
