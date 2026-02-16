import React, { useState } from 'react';
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
    }
  };

  return (
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default BurnModal;
