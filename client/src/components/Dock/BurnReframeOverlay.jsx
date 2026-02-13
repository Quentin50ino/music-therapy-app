import React from 'react';
import { FaFire } from 'react-icons/fa';

const BurnReframeOverlay = ({ originalThought, reframes, onSelect, onDismiss }) => {
  if (!originalThought || !Array.isArray(reframes) || reframes.length === 0) {
    return null;
  }

  return (
    <div className="burn-reframe-overlay">
      <div className="burn-reframe-overlay-head">
        <span>Choose a new perspective</span>
        <button type="button" className="burn-reframe-overlay-close" onClick={onDismiss}>
          Close
        </button>
      </div>

      <div className="burn-reframe-overlay-grid">
        {reframes.map((phrase, idx) => (
          <button
            key={`${phrase}-${idx}`}
            type="button"
            className="burn-reframe-overlay-card"
            onClick={() => onSelect(phrase)}
          >
            <span className="burn-reframe-overlay-index">0{idx + 1}</span>
            <span className="burn-reframe-overlay-text">{phrase}</span>
            <span className="burn-reframe-overlay-cta">
              Blend
              <FaFire />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BurnReframeOverlay;
