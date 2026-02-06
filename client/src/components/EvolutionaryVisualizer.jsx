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

const EvolutionaryVisualizer = ({ moodData, mode, burnSignal, ambientType, bpm, onInteraction, onParticleMerge }) => {
  const modeRef = useRef(mode);
  const moodRef = useRef(moodData);
  const ambientTypeRef = useRef(ambientType); 
  const onMergeRef = useRef(onParticleMerge);
  const bpmRef = useRef(bpm || 100); 

  const organisms = useRef([]);      
  const textParticles = useRef([]);  
  const ripples = useRef([]); 

  const p5Ref = useRef(null);
  const mainLSystem = useRef("");
  
  // Refs per colore fluido
  const smoothedHueRef = useRef(210);
  const smoothedSatRef = useRef(80);

  useEffect(() => { modeRef.current = mode; }, [mode]);
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

    // Calcolo Preset e Colore Fluido
    const targetPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];
    smoothedHueRef.current = p5.lerp(smoothedHueRef.current, targetPreset.hue, 0.05);
    smoothedSatRef.current = p5.lerp(smoothedSatRef.current, targetPreset.sat, 0.05);
    
    const currentHue = smoothedHueRef.current;
    const currentSat = smoothedSatRef.current;
    
    // Oggetto preset dinamico per le funzioni che richiedono ancora un oggetto
    const dynamicPreset = { ...targetPreset, hue: currentHue, sat: currentSat };

    const time = p5.millis() / 1000;
    const rawSin = Math.sin((time * (Math.PI * 2)) / 6.0 - Math.PI / 2);
    const breathCycle = (rawSin + 1) / 2;

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
        drawBreathingNebula(p5, dynamicPreset, breathCycle);
        drawRecursiveFractalBackground(p5, dynamicPreset, breathCycle);
        drawBreathScene(p5, breathCycle, dynamicPreset, mainLSystem.current);
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
      const creationTime = p5.millis();
      let pg = p5.createGraphics(p5.width, p5.height);
      pg.pixelDensity(1); 
      pg.background(0, 0); 
      pg.fill(255); 
      pg.noStroke();
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

export default React.memo(EvolutionaryVisualizer);