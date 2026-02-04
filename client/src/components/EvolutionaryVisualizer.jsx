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
import { drawFluidBackground } from "../core/renderers/fluidBackground.js";
import { drawBreathScene } from "../core/renderers/breathScene.js";
import { drawTextParticles } from "../core/renderers/textPatricles.js";

const EvolutionaryVisualizer = ({ moodData, mode, burnSignal, ambientType, onInteraction, onParticleMerge }) => {
  const modeRef = useRef(mode);
  const moodRef = useRef(moodData);
  const ambientTypeRef = useRef(ambientType); 
  const onMergeRef = useRef(onParticleMerge);

  const organisms = useRef([]);      
  const textParticles = useRef([]);  
  const ripples = useRef([]); 

  const p5Ref = useRef(null);
  const mainLSystem = useRef("");

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { moodRef.current = moodData || { valence: 0.5, energy: 0.5 }; }, [moodData]);
  useEffect(() => { ambientTypeRef.current = ambientType || 'off'; }, [ambientType]);
  useEffect(() => { onMergeRef.current = onParticleMerge; }, [onParticleMerge]);

  const setup = useCallback((p5, canvasParentRef) => {
    p5Ref.current = p5;
    p5.pixelDensity(1); 
    
    // ---- CANVAS STYLING TO FILL BACKGROUND ----
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

  const spawnParticles = useCallback((p5, count, x = null, y = null) => {
    const currentPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];
    for(let i=0; i<count; i++) {
      let px = x ? x + p5.random(-20, 20) : p5.random(p5.width);
      let py = y ? y + p5.random(-20, 20) : p5.random(p5.height);
      let startEnergy = p5.random(0.2, 0.4);
      organisms.current.push(new LuminousParticle(p5, px, py, startEnergy, currentPreset));
    }
  }, []);

  const draw = useCallback((p5) => {
    const currentMode = modeRef.current;
    const currentPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];

    const time = p5.millis() / 1000;
    const rawSin = Math.sin((time * (Math.PI * 2)) / 6.0 - Math.PI / 2);
    const breathCycle = (rawSin + 1) / 2;
    

    if (currentMode === "flow") {
        drawPrimordialSoup(p5, currentPreset);
        drawFluidBackground(p5, organisms, currentPreset, onMergeRef, ripples, modeRef);
    } else if (currentMode === "breathe") {
        drawBreathingNebula(p5, currentPreset, breathCycle);
        drawRecursiveFractalBackground(p5, currentPreset, breathCycle);
        drawBreathScene(p5, breathCycle, currentPreset, mainLSystem.current);
    }

    for (let i = ripples.current.length - 1; i >= 0; i--) {
        let r = ripples.current[i];
        r.update();
        r.display(p5);
        if (r.isDead()) ripples.current.splice(i, 1);
    }

    if (textParticles.current.length > 0) {
        drawTextParticles(p5, textParticles);
    }
  }, []);

  const mousePressed = useCallback((p5) => {
    if (onInteraction) onInteraction(p5.mouseX, p5.mouseY, p5.width, p5.height);
    ripples.current.push(new Ripple(p5.mouseX, p5.mouseY));
    if (modeRef.current !== "breathe") {
      spawnParticles(p5, 3, p5.mouseX, p5.mouseY); 
    }
  }, [onInteraction, spawnParticles]);

  const mouseDragged = useCallback((p5) => {
    if (onInteraction) onInteraction(p5.mouseX, p5.mouseY, p5.width, p5.height);
    if (p5.frameCount % 10 === 0) {
       ripples.current.push(new Ripple(p5.mouseX, p5.mouseY));
       if (modeRef.current === "flow") {
         spawnParticles(p5, 1, p5.mouseX, p5.mouseY);
       }
    }
  }, [onInteraction, spawnParticles]);

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