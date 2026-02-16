import React, { useState } from 'react';
import { FaVolumeMute, FaTree, FaBrain, FaCloudRain, FaOm } from 'react-icons/fa';
import { GiEarthAmerica } from 'react-icons/gi';

const soundOptions = [
  { type: 'off', label: 'Mute', icon: <FaVolumeMute /> },
  { type: 'brown', label: 'Earth', icon: <GiEarthAmerica /> },
  { type: 'green', label: 'Forest', icon: <FaTree /> },
  { type: 'pink', label: 'Rain', icon: <FaCloudRain /> },
  { type: 'binaural', label: 'Theta', icon: <FaBrain /> },
  { type: '432', label: '432 Hz', icon: <FaOm /> },
];

const SoundMenu = ({ currentType, onSelect, isOpen, onClose }) => {
  const [hoveredId, setHoveredId] = useState(null);

<<<<<<< HEAD
  return (
    <div className={`sound-menu ${isOpen ? 'sound-menu-open' : ''}`}>
      {soundOptions.map((opt) => {
        const isActive = currentType === opt.type;
        const isHovered = hoveredId === opt.type;
        const optionClass = [
          'sound-option-button',
          isActive ? 'sound-option-active' : '',
          !isActive && isHovered ? 'sound-option-hover' : ''
        ]
          .filter(Boolean)
          .join(' ');
=======
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
    // STILE BASE (Resettiamo tutto qui per evitare il blu di default)
    item: {
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px', 
      padding: '12px 16px',
      color: '#888', // Grigio spento di base
      fontSize: '0.95rem', 
      fontWeight: '500', 
      cursor: 'pointer',
      borderRadius: '12px', 
      transition: 'all 0.2s ease', 
      border: 'none',
      backgroundColor: 'transparent', // FORZIAMO TRASPARENTE SEMPRE
      width: '100%', 
      textAlign: 'left', 
      outline: 'none',
      margin: 0 // Reset margini
    },
    // STILE ATTIVO (Elemento selezionato)
    itemActive: {
      backgroundColor: 'transparent', // NIENTE SFONDO BIANCO
      color: '#4da6ff', // Azzurro neon (Theme color)
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(77, 166, 255, 0.3)' // Leggero bagliore sul testo
    },
    // STILE HOVER (Passaggio mouse)
    itemHover: {
      backgroundColor: 'transparent', // NIENTE SFONDO
      color: '#fff', // Diventa bianco puro
      transform: 'translateX(5px)' // Piccolo movimento per feedback
    }
  };

  return (
    <div style={styles.menu}>
      {soundOptions.map((opt) => {
        const isActive = currentType === opt.type;
        const isHovered = hoveredId === opt.type;

        let finalStyle = { ...styles.item };
        
        if (isActive) {
          finalStyle = { ...finalStyle, ...styles.itemActive };
        } else if (isHovered) {
          finalStyle = { ...finalStyle, ...styles.itemHover };
        }
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e

        return (
          <button
            key={opt.type}
<<<<<<< HEAD
            className={optionClass}
            onMouseEnter={() => setHoveredId(opt.type)}
            onMouseLeave={() => setHoveredId(null)}
            type="button"
=======
            style={finalStyle}
            onMouseEnter={() => setHoveredId(opt.type)}
            onMouseLeave={() => setHoveredId(null)}
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
            onClick={() => { 
              onSelect(opt.type); 
              onClose(); 
              setHoveredId(null); 
            }}
          >
<<<<<<< HEAD
            <span className={`sound-option-icon ${(isActive || isHovered) ? 'sound-option-icon-on' : ''}`}>
=======
            <span style={{ 
              fontSize: '1.1rem', 
              width: '24px', 
              display: 'flex', 
              justifyContent: 'center', 
              // L'icona è luminosa se attiva o in hover, spenta altrimenti
              opacity: (isActive || isHovered) ? 1 : 0.5,
              transition: 'opacity 0.2s'
            }}>
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
              {opt.icon}
            </span> 
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

<<<<<<< HEAD
export default SoundMenu;
=======
export default SoundMenu;
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
