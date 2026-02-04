// src/hooks/useAudioEngine.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { getScaleFrequencies } from '../utils/musicTheory';

export const useAudioEngine = (musicalKey, mode) => {
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const [ambientType, setAmbientType] = useState('off');

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopAudio = () => {
    const ctx = audioCtxRef.current;
    if (gainNodeRef.current && ctx) {
      gainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      setTimeout(() => {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          sourceNodeRef.current = null;
        }
      }, 600);
    }
    setAmbientType('off');
  };

  const playAmbient = (type) => {
    const ctx = initAudioContext();
    if (type === ambientType) { stopAudio(); return; }
    if (sourceNodeRef.current) sourceNodeRef.current.stop();
    
    if (!gainNodeRef.current) {
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;
    }
    if (!filterNodeRef.current) {
        const filter = ctx.createBiquadFilter();
        filter.connect(gainNodeRef.current);
        filterNodeRef.current = filter;
    }

    if (type === '432') {
      const source = ctx.createOscillator(); source.type = 'sine'; source.frequency.value = 432;
      filterNodeRef.current.type = 'allpass'; source.connect(filterNodeRef.current);
      source.start(); sourceNodeRef.current = source;
    } else if (type === 'binaural') {
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = 200; 
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = 206; 
      const gainL = ctx.createGain(); gainL.gain.value = 0.5;
      const gainR = ctx.createGain(); gainR.gain.value = 0.5;
      const pannerL = ctx.createStereoPanner(); pannerL.pan.value = -1;
      const pannerR = ctx.createStereoPanner(); pannerR.pan.value = 1;
      oscL.connect(pannerL).connect(gainL).connect(merger, 0, 0);
      oscR.connect(pannerR).connect(gainR).connect(merger, 0, 1);
      merger.connect(filterNodeRef.current);
      filterNodeRef.current.type = 'lowpass'; filterNodeRef.current.frequency.value = 1000; 
      oscL.start(); oscR.start();
      sourceNodeRef.current = { stop: () => { oscL.stop(); oscR.stop(); } };
    } else {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'green') {
           const b0 = 0.99886 * lastOut + white * 0.0555179; const b1 = 0.99332 * lastOut + white * 0.0750759;
           const b2 = 0.96900 * lastOut + white * 0.1538520; output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11; lastOut = output[i];
        } else if (type === 'brown') {
          output[i] = (lastOut + (0.02 * white)) / 1.02; lastOut = output[i]; output[i] *= 3.5; 
        } else if (type === 'pink') {
             const b0 = 0.99886 * lastOut + white * 0.0555179; const b1 = 0.99332 * lastOut + white * 0.0750759;
             const b2 = 0.96900 * lastOut + white * 0.1538520; output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11; lastOut = output[i];
        }
      }
      const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true; source.connect(filterNodeRef.current);
      if (type === 'green') { filterNodeRef.current.type = 'bandpass'; filterNodeRef.current.frequency.value = 500; filterNodeRef.current.Q.value = 0.5; } 
      else if (type === 'brown') { filterNodeRef.current.type = 'lowpass'; filterNodeRef.current.frequency.value = 800; } 
      else { filterNodeRef.current.type = 'lowpass'; filterNodeRef.current.frequency.value = 2000; }
      source.start(); sourceNodeRef.current = source;
    }
    gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1);
    setAmbientType(type);
  };

  const triggerMergeSound = useCallback(() => {
    const ctx = initAudioContext();
    const t = ctx.currentTime;
    const currentScale = getScaleFrequencies(musicalKey);
    const freq = currentScale[Math.floor(Math.random() * currentScale.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = 'sine'; 
    osc.frequency.value = freq;
    panner.pan.value = (Math.random() * 2) - 1; 

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    osc.start(t);
    osc.stop(t + 2.5);
  }, [musicalKey]);

  const triggerFireSound = () => {
    const ctx = initAudioContext();
    const t = ctx.currentTime;
    const duration = 4.0;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        if (Math.random() < 0.005) data[i] += (Math.random() * 0.5); 
        data[i] *= 3.5;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;
    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.value = 800; 
    const fireGain = ctx.createGain();
    noiseSrc.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(ctx.destination);
    fireGain.gain.setValueAtTime(0, t);
    fireGain.gain.linearRampToValueAtTime(0.8, t + 0.2); 
    fireGain.gain.exponentialRampToValueAtTime(0.4, t + 1.5); 
    fireGain.gain.exponentialRampToValueAtTime(0.01, t + duration); 
    fireFilter.frequency.setValueAtTime(800, t);
    fireFilter.frequency.exponentialRampToValueAtTime(200, t + duration);
    noiseSrc.start(t);
    noiseSrc.stop(t + duration);
  };

  const handleVisualInteraction = useCallback((mouseX, mouseY, width, height) => {
    if (mode !== 'flow' || ambientType === 'off' || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ambientType !== '432') {
      const freq = 100 + (mouseX / width) * 4000;
      if (filterNodeRef.current) filterNodeRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    }
    const vol = 1 - (mouseY / height);
    if (gainNodeRef.current) gainNodeRef.current.gain.setTargetAtTime(Math.max(0, Math.min(0.8, vol)), ctx.currentTime, 0.1);
  }, [mode, ambientType]);

  // Modulazione Respiro
  useEffect(() => {
    let animationFrameId;
    const modulateBreathSound = () => {
      if (mode === 'breathe' && audioCtxRef.current && filterNodeRef.current && gainNodeRef.current && ambientType !== 'off' && ambientType !== '432') {
        const ctx = audioCtxRef.current;
        const time = Date.now() / 1000;
        const rawSin = Math.sin((time * (Math.PI * 2)) / 6.0 - Math.PI / 2);
        const breathCycle = (rawSin + 1) / 2;
        const minFreq = 150; const maxFreq = 900;
        const targetFreq = minFreq + (breathCycle * (maxFreq - minFreq));
        filterNodeRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
        const baseVol = 0.4; const volMod = baseVol + (breathCycle * 0.2); 
        gainNodeRef.current.gain.setTargetAtTime(volMod, ctx.currentTime, 0.1);
      }
      animationFrameId = requestAnimationFrame(modulateBreathSound);
    };
    if (mode === 'breathe') {
      if (ambientType === 'off') playAmbient('brown');
      modulateBreathSound();
    } else {
      cancelAnimationFrame(animationFrameId);
      if (filterNodeRef.current && audioCtxRef.current) {
        filterNodeRef.current.frequency.setTargetAtTime(1000, audioCtxRef.current.currentTime, 0.5);
      }
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, ambientType]);

  return {
    ambientType,
    playAmbient,
    triggerMergeSound,
    triggerFireSound,
    handleVisualInteraction
  };
};