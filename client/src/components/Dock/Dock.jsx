import React, { useState } from 'react';
import SoundMenu from './SoundMenu';
import { FaFire, FaMusic } from 'react-icons/fa';
import { GiLungs } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';

const Dock = ({ mode, onToggleBreathe, onBurnClick, ambientType, onPlayAmbient }) => {
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  return (
    <div className="dock-container">
      <button 
        type="button"
        className={`dock-btn ${mode === 'breathe' ? 'dock-btn-active' : ''}`}
        onClick={onToggleBreathe}
        title="Guided Breathing"
      >
        {mode === 'breathe' ? <GiLungs /> : <BsStars />}
      </button>

      <button 
        type="button"
        className="dock-btn dock-btn-burn"
        onClick={onBurnClick} 
        title="Burn Thoughts"
      >
        <FaFire />
      </button>

      <div className="dock-sound-wrap">
        <button 
          type="button"
          className={`dock-btn ${ambientType !== 'off' ? 'dock-btn-sound-active' : ''}`}
          onClick={() => setShowSoundMenu(!showSoundMenu)}
          title="Ambient Sounds"
        >
          <FaMusic />
        </button>

        <SoundMenu 
          currentType={ambientType} 
          onSelect={onPlayAmbient} 
          isOpen={showSoundMenu} 
          onClose={() => setShowSoundMenu(false)} 
        />
      </div>
    </div>
  );
};

export default Dock;
