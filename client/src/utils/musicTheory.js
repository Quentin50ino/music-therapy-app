import { BASE_FREQUENCIES, NOTES_ORDER, SCALES_INTERVALS } from '../core/constants.js';

export const getScaleFrequencies = (keyString = 'C Major') => {
  if (!keyString) return Object.values(BASE_FREQUENCIES); // Fallback su tutte le note

  let cleanKey = keyString.trim();
  let root = 'C';
  let type = 'major';

  // 1. Identifica la Nota Tonica (Root)
  // Gestisce diesis (#) o bemolle (b)
  if (cleanKey.length > 1 && (cleanKey[1] === '#' || cleanKey[1] === 'b')) {
    root = cleanKey.substring(0, 2);
  } else {
    root = cleanKey.substring(0, 1);
  }
  
  // Normalizzazione (es. c# -> C#)
  root = root.charAt(0).toUpperCase() + root.slice(1);

  // 2. Identifica il Modo (Maggiore o Minore)
  const lowerKey = cleanKey.toLowerCase();
  if (lowerKey.includes('min') || lowerKey.includes('m') && !lowerKey.includes('maj')) {
    type = 'minor';
  }

  // 3. Calcola le frequenze
  let rootIndex = NOTES_ORDER.indexOf(root);
  if (rootIndex === -1) rootIndex = 0; // Fallback C se non trova la nota

  const intervals = SCALES_INTERVALS[type];
  const frequencies = [];

  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12; // Modulo 12 per girare dopo il SI
    const noteName = NOTES_ORDER[noteIndex];
    const baseFreq = BASE_FREQUENCIES[noteName];
    
    // Se l'indice della nota è minore della root, siamo nell'ottava successiva
    // Es: In scala di SOL (G), il DO (C) viene dopo, quindi è più acuto.
    let octaveMult = (rootIndex + interval) >= 12 ? 2 : 1;
    
    // Aggiungiamo frequenza base
    frequencies.push(baseFreq * octaveMult);
    
    // Aggiungiamo anche un'ottava sopra per dare brillantezza
    frequencies.push(baseFreq * octaveMult * 2);
  });

  return frequencies;
};