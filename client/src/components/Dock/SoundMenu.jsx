import React from 'react';
import { FaVolumeMute, FaTree, FaBrain, FaCloudRain, FaOm } from 'react-icons/fa';
import { GiEarthAmerica } from 'react-icons/gi';

const soundOptions = [
  { type: 'off', label: 'Muto', icon: <FaVolumeMute /> },
  { type: 'brown', label: 'Earth', icon: <GiEarthAmerica /> },
  { type: 'green', label: 'Forest', icon: <FaTree /> },
  { type: 'pink', label: 'Rain', icon: <FaCloudRain /> },
  { type: 'binaural', label: 'Theta', icon: <FaBrain /> },
  { type: '432', label: '432 Hz', icon: <FaOm /> },
];

const SoundMenu = ({ currentType, onSelect, isOpen, onClose }) => {
  const styles = {
    menu: {
      position: 'absolute',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '240px',
      backgroundColor: 'rgba(18, 18, 24, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
      transformOrigin: 'bottom center',
      scale: isOpen ? '1' : '0.95',
      translate: isOpen ? '0 0' : '0 10px'
    },
    item: {
      display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 16px',
      color: '#888', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer',
      borderRadius: '12px', transition: 'all 0.2s ease', border: 'none',
      background: 'transparent', width: '100%', textAlign: 'left', outline: 'none'
    },
    itemActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }
  };

  return (
    <div style={styles.menu}>
      {soundOptions.map((opt) => {
        const isActive = currentType === opt.type;
        return (
          <button
            key={opt.type}
            style={{ ...styles.item, ...(isActive ? styles.itemActive : {}) }}
            onMouseEnter={(e) => { if(!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#ccc'; } }}
            onMouseLeave={(e) => { if(!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888'; } }}
            onClick={() => { onSelect(opt.type); onClose(); }}
          >
            <span style={{ fontSize: '1.1rem', width: '24px', display: 'flex', justifyContent: 'center', opacity: isActive ? 1 : 0.7 }}>
              {opt.icon}
            </span> 
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default SoundMenu;