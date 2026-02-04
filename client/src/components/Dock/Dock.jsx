import React, { useState } from 'react';
import SoundMenu from './SoundMenu';
import { FaFire, FaMusic } from 'react-icons/fa';
import { GiLungs } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';

const Dock = ({ mode, setMode, onBurnClick, ambientType, onPlayAmbient }) => {
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  const styles = {
    container: {
      position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: '20px', alignItems: 'center', zIndex: 20,
      padding: '10px 25px', borderRadius: '50px',
      backgroundColor: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    },
    btn: {
      width: '50px', height: '50px', borderRadius: '50%', border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem', color: 'white', cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative'
    },
    activeBreathe: { backgroundColor: 'rgba(0, 200, 255, 0.2)', color: '#00c8ff', boxShadow: '0 0 15px rgba(0, 200, 255, 0.4)' },
    activeSound: { backgroundColor: 'rgba(50, 200, 100, 0.2)', color: '#32c864' },
    // activeBurn non serve stato persistente, è solo un trigger
  };

  return (
    <div style={styles.container}>
      {/* Breathe Toggle */}
      <button 
        style={{...styles.btn, ...(mode === 'breathe' ? styles.activeBreathe : {})}} 
        onClick={() => setMode(mode === 'flow' ? 'breathe' : 'flow')} 
        title="Respiro Guidato"
      >
        {mode === 'breathe' ? <GiLungs /> : <BsStars />}
      </button>

      {/* Burn Trigger */}
      <button 
        style={styles.btn} 
        onClick={onBurnClick} 
        title="Brucia Pensieri"
      >
        <FaFire />
      </button>

      {/* Sound Menu Trigger */}
      <div style={{position: 'relative'}}>
        <button 
          style={{...styles.btn, ...(ambientType !== 'off' ? styles.activeSound : {})}} 
          onClick={() => setShowSoundMenu(!showSoundMenu)}
          title="Suoni Ambientali"
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