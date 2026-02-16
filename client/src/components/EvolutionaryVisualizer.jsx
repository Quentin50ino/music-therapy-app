import React, { useEffect, useRef, useCallback } from "react";
import Sketch from "react-p5";
import { SOUND_PRESETS } from "../core/constants.js";
import { LuminousParticle } from "../core/entities/LuminousParticle.js";
import { Ripple } from "../core/entities/Ripple.js";
import { TextParticle } from "../core/entities/TextParticle.js";
import { generateLSystem } from "../core/logic/l-systems.js";
import { drawPrimordialSoup } from "../core/renderers/primordialSoup.js";
import { drawBreathingNebula } from "../core/renderers/breathingNebula.js";
import { drawRecursiveFractalBackground } from "../core/renderers/recursiveFractalBackground.js";
import { drawBreathScene } from "../core/renderers/breathScene.js";

<<<<<<< HEAD
const BREATH_PROFILES = [
  {
    id: "box",
    name: "BOX 4-4-4-4",
    phases: [
      { label: "INHALE", duration: 4000, from: 0.04, to: 1 },
      { label: "HOLD", duration: 4000, from: 1, to: 1 },
      { label: "EXHALE", duration: 4000, from: 1, to: 0.06 },
      { label: "HOLD", duration: 4000, from: 0.06, to: 0.06 }
    ],
    hueShift: 0,
    drift: 1
  },
  {
    id: "478",
    name: "4-7-8",
    phases: [
      { label: "INHALE", duration: 4000, from: 0.05, to: 1 },
      { label: "HOLD", duration: 7000, from: 1, to: 1 },
      { label: "EXHALE", duration: 8000, from: 1, to: 0.02 }
    ],
    hueShift: 9,
    drift: 0.86
  },
  {
    id: "coherent",
    name: "COHERENT 5-5",
    phases: [
      { label: "INHALE", duration: 5000, from: 0.06, to: 1 },
      { label: "EXHALE", duration: 5000, from: 1, to: 0.05 }
    ],
    hueShift: -8,
    drift: 1.2
  },
  {
    id: "sigh",
    name: "PHYSIOLOGICAL SIGH",
    phases: [
      { label: "INHALE", duration: 2200, from: 0.05, to: 0.72 },
      { label: "INHALE", duration: 1500, from: 0.72, to: 1 },
      { label: "EXHALE", duration: 6500, from: 1, to: 0.08 },
      { label: "REST", duration: 1500, from: 0.08, to: 0.08 }
    ],
    hueShift: 16,
    drift: 0.92
  }
];

const getBreathState = (profile, elapsedMs) => {
  const phases = profile.phases;
  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
  const localMs = elapsedMs % totalDuration;
  let cursor = 0;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const end = cursor + phase.duration;
    if (localMs <= end) {
      const rawProgress = (localMs - cursor) / phase.duration;
      const progress = Math.max(0, Math.min(1, rawProgress));
      const eased = progress * progress * (3 - (2 * progress));
      const cycle = phase.from + ((phase.to - phase.from) * eased);
      return { cycle, label: phase.label, progress, profile };
    }
    cursor = end;
  }

  const lastPhase = phases[phases.length - 1];
  return { cycle: lastPhase.to, label: lastPhase.label, progress: 1, profile };
};

const EvolutionaryVisualizer = ({ moodData, mode, breathProfileIndex, burnSignal, ambientType, bpm, onInteraction, onParticleMerge }) => {
  const modeRef = useRef(mode);
  const breathProfileRef = useRef(breathProfileIndex || 0);
=======
const EvolutionaryVisualizer = ({ moodData, mode, burnSignal, ambientType, bpm, onInteraction, onParticleMerge }) => {
  const modeRef = useRef(mode);
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
  const moodRef = useRef(moodData);
  const ambientTypeRef = useRef(ambientType); 
  const onMergeRef = useRef(onParticleMerge);
  const bpmRef = useRef(bpm || 100); 

  const organisms = useRef([]);      
  const textParticles = useRef([]);  
  const ripples = useRef([]); 

  const p5Ref = useRef(null);
  const mainLSystem = useRef("");
<<<<<<< HEAD
  const burnPhraseOverlay = useRef(null);
=======
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
  
  const smoothedHueRef = useRef(210);
  const smoothedSatRef = useRef(80);

  useEffect(() => { modeRef.current = mode; }, [mode]);
<<<<<<< HEAD
  useEffect(() => { breathProfileRef.current = Number.isInteger(breathProfileIndex) ? breathProfileIndex : 0; }, [breathProfileIndex]);
=======
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
  useEffect(() => { moodRef.current = moodData || { valence: 0.5, energy: 0.5 }; }, [moodData]);
  useEffect(() => { ambientTypeRef.current = ambientType || 'off'; }, [ambientType]);
  useEffect(() => { onMergeRef.current = onParticleMerge; }, [onParticleMerge]);
  useEffect(() => { bpmRef.current = bpm || 100; }, [bpm]);

  const setup = useCallback((p5, canvasParentRef) => {
    p5Ref.current = p5;
    p5.pixelDensity(1); 
    
    const cnv = p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    cnv.style('display', 'block');
    cnv.style('position', 'absolute');
    cnv.style('top', '0');
    cnv.style('left', '0');
    cnv.style('z-index', '-1'); 

    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    p5.noStroke();
    
    mainLSystem.current = generateLSystem("X", { X: "F-[[X]+X]+F[+FX]-X", F: "FF" }, 4);
    
    const currentPreset = SOUND_PRESETS['off'];
    for(let i=0; i<50; i++) {
        let px = p5.random(p5.width);
        let py = p5.random(p5.height);
        organisms.current.push(new LuminousParticle(p5, px, py, p5.random(0.2, 0.4), currentPreset));
    }
  }, []);

  const draw = useCallback((p5) => {
    const currentMode = modeRef.current;
    const currentBpm = bpmRef.current;

    const targetPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];
    smoothedHueRef.current = p5.lerp(smoothedHueRef.current, targetPreset.hue, 0.05);
    smoothedSatRef.current = p5.lerp(smoothedSatRef.current, targetPreset.sat, 0.05);
    
    const currentHue = smoothedHueRef.current;
    const currentSat = smoothedSatRef.current;
    
    const dynamicPreset = { ...targetPreset, hue: currentHue, sat: currentSat };

<<<<<<< HEAD
    const breathProfile = BREATH_PROFILES[
      ((breathProfileRef.current % BREATH_PROFILES.length) + BREATH_PROFILES.length) % BREATH_PROFILES.length
    ];
    const breathState = getBreathState(breathProfile, p5.millis());
    const breathCycle = breathState.cycle;
    const breathLabel = breathState.label;
=======
    const time = p5.millis() / 1000;
    const rawSin = Math.sin((time * (Math.PI * 2)) / 6.0 - Math.PI / 2);
    const breathCycle = (rawSin + 1) / 2;
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e

    if (currentMode === "flow") {
        drawPrimordialSoup(p5, dynamicPreset);
        
        p5.blendMode(p5.ADD); 
        for (let i = 0; i < organisms.current.length; i++) {
            let p1 = organisms.current[i];
            
            p1.update(p5, dynamicPreset, currentBpm);
            p1.display(p5, currentBpm);
            
            if (p1.reproCooldown <= 0 && organisms.current.length < 150) {
                for (let j = i + 1; j < organisms.current.length; j++) {
                    let p2 = organisms.current[j];
                    if (p2.reproCooldown <= 0) {
                        let r1 = p1.energy * 30;
                        let r2 = p2.energy * 30;
                        let d = p5.dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
                        if (d < (r1 + r2) * 0.8) {
                            let child = p1.combine(p2, p5); 
                            child.currentHue = currentHue; 
                            organisms.current.push(child);
                            ripples.current.push(new Ripple(child.pos.x, child.pos.y));
                            if(onMergeRef.current) onMergeRef.current();
                            break; 
                        }
                    }
                }
            }
            if (p1.isDead()) {
                organisms.current.splice(i, 1);
                i--;
            }
        }
        if (organisms.current.length < 10) {
             let px = p5.random(p5.width);
             let py = p5.random(p5.height);
             organisms.current.push(new LuminousParticle(p5, px, py, 0.3, dynamicPreset));
        }
        p5.blendMode(p5.BLEND); 

    } else if (currentMode === "breathe") {
<<<<<<< HEAD
        const profilePreset = {
          ...dynamicPreset,
          hue: (dynamicPreset.hue + breathProfile.hueShift + 360) % 360,
          speed: dynamicPreset.speed * breathProfile.drift
        };
        drawBreathingNebula(p5, profilePreset, breathCycle, breathProfile);
        drawRecursiveFractalBackground(p5, profilePreset, breathCycle, breathProfile);
        drawBreathScene(p5, breathCycle, profilePreset, mainLSystem.current, breathLabel, breathProfile.name);
=======
        drawBreathingNebula(p5, dynamicPreset, breathCycle);
        drawRecursiveFractalBackground(p5, dynamicPreset, breathCycle);
        drawBreathScene(p5, breathCycle, dynamicPreset, mainLSystem.current);
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    }

    for (let i = ripples.current.length - 1; i >= 0; i--) {
        let r = ripples.current[i];
        r.update();
        r.display(p5);
        if (r.isDead()) ripples.current.splice(i, 1);
    }

    if (textParticles.current.length > 0) {
        for (let i = textParticles.current.length - 1; i >= 0; i--) {
            let p = textParticles.current[i];
            p.update(p5);
            p.show(p5);
            if (p.finished()) textParticles.current.splice(i, 1);
        }
    }
<<<<<<< HEAD

    if (burnPhraseOverlay.current) {
        const overlay = burnPhraseOverlay.current;
        const elapsed = p5.millis() - overlay.createdAt;

        if (elapsed > overlay.duration) {
            burnPhraseOverlay.current = null;
        } else {
            const fade = elapsed < overlay.fadeStart
                ? 1
                : p5.map(elapsed, overlay.fadeStart, overlay.duration, 1, 0, true);

            p5.push();
            p5.blendMode(p5.BLEND);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textFont('Arial');
            p5.textStyle(p5.BOLD);
            p5.textSize(overlay.fontSize);
            const lineHeight = overlay.fontSize * 1.25;
            const startY = (p5.height / 2) - (((overlay.lines.length - 1) * lineHeight) / 2);

            const samplePoints = [
              [0, 0], [-140, -56], [140, -56], [-140, 56], [140, 56], [0, -110], [0, 110]
            ];
            let lumaSum = 0;
            samplePoints.forEach(([dx, dy]) => {
              const sx = Math.max(0, Math.min(p5.width - 1, Math.round((p5.width / 2) + dx)));
              const sy = Math.max(0, Math.min(p5.height - 1, Math.round((p5.height / 2) + dy)));
              const px = p5.get(sx, sy);
              const r = px[0] || 0;
              const g = px[1] || 0;
              const b = px[2] || 0;
              lumaSum += (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
            });
            const avgLuma = lumaSum / samplePoints.length;
            const useDarkText = avgLuma > 128;

            p5.stroke(0, 0, useDarkText ? 100 : 0, 0.34 * fade);
            p5.strokeWeight(3.2);
            p5.strokeJoin(p5.ROUND);

            if (overlay.style === 'glass') {
                p5.drawingContext.shadowBlur = 20;
                p5.drawingContext.shadowColor = `rgba(150, 222, 255, ${0.42 * fade})`;
                p5.fill(0, 0, useDarkText ? 10 : 100, 0.98 * fade);
            } else {
                p5.drawingContext.shadowBlur = 24;
                p5.drawingContext.shadowColor = `rgba(255, 195, 148, ${0.42 * fade})`;
                p5.fill(0, 0, useDarkText ? 12 : 100, 0.9 * fade);
            }

            overlay.lines.forEach((line, index) => {
                p5.text(line, p5.width / 2, startY + (index * lineHeight));
            });

            p5.drawingContext.shadowBlur = 0;
            p5.pop();
        }
    }
=======
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
  }, []);

  const mousePressed = useCallback((p5) => {
    if (onInteraction) onInteraction(p5.mouseX, p5.mouseY, p5.width, p5.height);
    ripples.current.push(new Ripple(p5.mouseX, p5.mouseY));
    if (modeRef.current !== "breathe") {
       const currentPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];
       for(let i=0; i<3; i++) {
          organisms.current.push(new LuminousParticle(p5, p5.mouseX + p5.random(-20,20), p5.mouseY + p5.random(-20,20), 0.3, currentPreset));
       }
    }
  }, [onInteraction]);

  const mouseDragged = useCallback((p5) => {
    if (onInteraction) onInteraction(p5.mouseX, p5.mouseY, p5.width, p5.height);
    if (p5.frameCount % 10 === 0) {
       ripples.current.push(new Ripple(p5.mouseX, p5.mouseY));
       if (modeRef.current === "flow") {
         const currentPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];
         organisms.current.push(new LuminousParticle(p5, p5.mouseX, p5.mouseY, 0.3, currentPreset));
       }
    }
  }, [onInteraction]);

  const windowResized = useCallback((p5) => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  }, []);

  useEffect(() => {
    if (burnSignal && burnSignal.text && p5Ref.current) {
      const p5 = p5Ref.current;
      const textToBurn = burnSignal.text;
<<<<<<< HEAD
      const displayText = burnSignal.displayText || textToBurn;
      const isCalmSelected = burnSignal.effectStyle === 'calm-selected';
      const variant = isCalmSelected ? 'calm' : 'fire';
=======
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
      const creationTime = p5.millis();
      let pg = p5.createGraphics(p5.width, p5.height);
      pg.pixelDensity(1); 
      pg.background(0, 0); 
      pg.fill(255); 
      pg.noStroke();
<<<<<<< HEAD
      pg.textAlign(p5.LEFT, p5.TOP);
      pg.textStyle(p5.BOLD);
      pg.textFont('Arial'); 

      const maxTextWidth = pg.width * 0.72;
      const buildLines = (sourceText) => {
        const words = sourceText.trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return [sourceText];
        const lines = [];
        let currentLine = '';
        words.forEach((word) => {
          const candidate = currentLine ? `${currentLine} ${word}` : word;
          if (!currentLine || pg.textWidth(candidate) <= maxTextWidth) {
            currentLine = candidate;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      let fontSize = variant === 'calm' ? 82 : 110;
      let lines = [displayText];
      while (fontSize > 26) {
        pg.textSize(fontSize);
        lines = buildLines(displayText);
        const totalHeight = lines.length * fontSize * 1.16;
        if (totalHeight <= pg.height * 0.46) break;
        fontSize -= 4;
      }

      if (isCalmSelected) {
        textParticles.current = [];
        const cx = pg.width / 2;
        const cy = pg.height / 2;
        const radius = Math.min(pg.width, pg.height) * 0.17;
        for (let i = 0; i < 290; i++) {
          const angle = p5.random(p5.TWO_PI);
          const distance = p5.constrain(Math.abs(p5.randomGaussian(radius * 0.45, radius * 0.2)), 10, radius);
          const px = cx + (Math.cos(angle) * distance);
          const py = cy + (Math.sin(angle) * distance * 0.6);
          textParticles.current.push(new TextParticle(p5, px, py, creationTime, { variant: 'calm' }));
        }
      } else {
        const lineHeight = fontSize * 1.16;
        const startY = (pg.height / 2) - ((lines.length * lineHeight) / 2);
        lines.forEach((line, index) => {
          const lineWidth = pg.textWidth(line);
          const lineX = (pg.width / 2) - (lineWidth / 2);
          pg.text(line, lineX, startY + (index * lineHeight));
        });

        pg.loadPixels();
        const step = 4;
        for (let y = 0; y < pg.height; y += step) {
          for (let x = 0; x < pg.width; x += step) {
            const index = (x + y * pg.width) * 4;
            if (pg.pixels[index + 3] > 128) {
               textParticles.current.push(new TextParticle(p5, x, y, creationTime, { variant: 'fire' }));
            }
          }
        }
      }

      burnPhraseOverlay.current = isCalmSelected
        ? {
            lines,
            style: 'glass',
            fontSize: Math.max(24, Math.min(44, fontSize * 0.42)),
            createdAt: creationTime,
            fadeStart: 15000,
            duration: 22000
          }
        : null;
=======
      pg.textAlign(p5.CENTER, p5.CENTER);
      let fontSize = 150;
      if (textToBurn.length > 6) fontSize = 100;
      if (textToBurn.length > 12) fontSize = 60;
      pg.textSize(fontSize);
      pg.textStyle(p5.BOLD);
      pg.textFont('Arial'); 
      pg.text(textToBurn, pg.width / 2, pg.height / 2);
      pg.loadPixels();
      const step = 4; 
      for (let y = 0; y < pg.height; y += step) {
        for (let x = 0; x < pg.width; x += step) {
          const index = (x + y * pg.width) * 4;
          if (pg.pixels[index + 3] > 128) {
             textParticles.current.push(new TextParticle(p5, x, y, creationTime));
          }
        }
      }
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
      pg.remove();
    }
  }, [burnSignal]);

  return (
    <Sketch
      setup={setup}
      draw={draw}
      mousePressed={mousePressed}
      mouseDragged={mouseDragged}
      windowResized={windowResized}
    />
  );
};

<<<<<<< HEAD
export default React.memo(EvolutionaryVisualizer);
=======
export default React.memo(EvolutionaryVisualizer);
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
