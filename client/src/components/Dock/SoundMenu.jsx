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

        return (
          <button
            key={opt.type}
            className={optionClass}
            onMouseEnter={() => setHoveredId(opt.type)}
            onMouseLeave={() => setHoveredId(null)}
            type="button"
            onClick={() => { 
              onSelect(opt.type); 
              onClose(); 
              setHoveredId(null); 
            }}
          >
            <span className={`sound-option-icon ${(isActive || isHovered) ? 'sound-option-icon-on' : ''}`}>
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
