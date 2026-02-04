import { FaVolumeMute, FaTree, FaCloudRain, FaBrain, FaOm } from 'react-icons/fa';
import { GiEarthAmerica } from 'react-icons/gi';

export const SOUND_PRESETS = {
  off:      { hue: 210, sat: 80,  speed: 0.8 }, 
  brown:    { hue: 30,  sat: 90,  speed: 0.5 }, 
  green:    { hue: 130, sat: 70,  speed: 0.9 }, 
  pink:     { hue: 330, sat: 60,  speed: 1.1 }, 
  binaural: { hue: 270, sat: 90,  speed: 0.3 }, 
  '432':    { hue: 50,  sat: 100, speed: 0.4 }, 
};

// Frequenze base (Ottava 3 - Medio Basse, ideali per pad/chimes)
export const BASE_FREQUENCIES = {
  'C': 130.81, 'C#': 138.59, 'Db': 138.59,
  'D': 146.83, 'D#': 155.56, 'Eb': 155.56,
  'E': 164.81,
  'F': 174.61, 'F#': 185.00, 'Gb': 185.00,
  'G': 196.00, 'G#': 207.65, 'Ab': 207.65,
  'A': 220.00, 'A#': 233.08, 'Bb': 233.08,
  'B': 246.94
};

// Ordine cromatico per calcolare gli intervalli
export const NOTES_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Intervalli in semitoni
export const SCALES_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11], // Scala Maggiore
  minor: [0, 2, 3, 5, 7, 8, 10]  // Scala Minore Naturale
};

export const soundOptions = [
    { type: 'off', label: 'Muto', icon: <FaVolumeMute /> },
    { type: 'brown', label: 'Earth', icon: <GiEarthAmerica /> },
    { type: 'green', label: 'Forest', icon: <FaTree /> },
    { type: 'pink', label: 'Rain', icon: <FaCloudRain /> },
    { type: 'binaural', label: 'Theta', icon: <FaBrain /> },
    { type: '432', label: '432 Hz', icon: <FaOm /> },
  ];