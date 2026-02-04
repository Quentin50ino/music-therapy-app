import React, { useEffect, useRef, useCallback } from "react";
import Sketch from "react-p5";

// ===============================================
// 1. CONFIGURAZIONE PRESET
// ===============================================
const SOUND_PRESETS = {
  off:      { hue: 210, sat: 80,  speed: 0.8 }, 
  brown:    { hue: 30,  sat: 90,  speed: 0.5 }, 
  green:    { hue: 130, sat: 70,  speed: 0.9 }, 
  pink:     { hue: 330, sat: 60,  speed: 1.1 }, 
  binaural: { hue: 270, sat: 90,  speed: 0.3 }, 
  '432':    { hue: 50,  sat: 100, speed: 0.4 }, 
};

// ===============================================
// 2. HELPER FUNCTIONS
// ===============================================

const generateLSystem = (axiom, rules, iterations) => {
    let sentence = axiom;
    for (let i = 0; i < iterations; i++) {
        let nextSentence = "";
        for (let j = 0; j < sentence.length; j++) {
            let char = sentence.charAt(j);
            if (rules[char]) nextSentence += rules[char];
            else nextSentence += char;
        }
        sentence = nextSentence;
    }
    return sentence;
};

const renderTurtle = (p5, sentence, len, angle, hueBase, satBase) => {
  for (let i = 0; i < sentence.length; i++) {
    let char = sentence.charAt(i);
    if (char === "F") {
      p5.stroke(hueBase + (i % 20), satBase, 95, 0.6);
      p5.line(0, 0, 0, -len);
      p5.translate(0, -len);
    } else if (char === "+") {
      p5.rotate(angle);
    } else if (char === "-") {
      p5.rotate(-angle);
    } else if (char === "[") {
      p5.push();
    } else if (char === "]") {
      p5.pop();
    }
  }
};

const drawFractalRing = (p5, sentence, symmetry, len, angle, hue, sat, weight) => {
  for (let i = 0; i < symmetry; i++) {
    p5.rotate(p5.TWO_PI / symmetry);
    p5.push();
    p5.strokeWeight(weight);
    renderTurtle(p5, sentence, len, angle, hue, sat);
    p5.pop();
  }
};

// ===============================================
// 3. CLASSI
// ===============================================

class LuminousParticle {
  constructor(p5, x, y, energy, initialPreset) {
    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.energy = energy || 0.3; 
    this.baseSpeed = 0.8;
    this.currentHue = initialPreset ? initialPreset.hue : 210;
    this.currentSat = initialPreset ? initialPreset.sat : 80;
    this.xOff = p5.random(1000);
    this.yOff = p5.random(1000);
    this.pulseOffset = p5.random(100);
    this.lifespan = p5.random(2000, 3000); 
    this.age = 0;
    this.reproCooldown = 200; 
    this.isDeadState = false;
  }

  update(p5, preset) {
    let angle = p5.noise(this.xOff, this.yOff, p5.frameCount * 0.002) * p5.TWO_PI * 4;
    let flowForce = p5.createVector(p5.cos(angle), p5.sin(angle));
    flowForce.mult(0.05); 
    let speedMod = p5.map(this.energy, 0, 1, 1.0, 0.5); 
    this.acc.add(flowForce);
    this.vel.add(this.acc);
    this.vel.limit(this.baseSpeed * preset.speed * speedMod);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.xOff += 0.003;
    this.yOff += 0.003;
    this.age++;
    if (this.reproCooldown > 0) this.reproCooldown--;
    let agingSpeed = 1 + (this.energy * 0.3); 
    if (this.age * agingSpeed > this.lifespan) this.isDeadState = true;
    this.currentHue = p5.lerp(this.currentHue, preset.hue, 0.01);
    this.currentSat = p5.lerp(this.currentSat, preset.sat, 0.01);
    if (this.pos.x > p5.width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = p5.width;
    if (this.pos.y > p5.height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = p5.height;
  }

  combine(partner, p5) {
      let newEnergy = this.energy + partner.energy + p5.random(-0.05, 0.1);
      newEnergy = p5.constrain(newEnergy, 0.2, 1.2);
      let midX = (this.pos.x + partner.pos.x) / 2;
      let midY = (this.pos.y + partner.pos.y) / 2;
      this.reproCooldown = 300;
      partner.reproCooldown = 300;
      return new LuminousParticle(p5, midX, midY, newEnergy, null);
  }

  display(p5) {
    p5.noStroke();
    let breath = p5.sin(p5.frameCount * 0.05 + this.pulseOffset);
    let sizeVar = p5.map(breath, -1, 1, 0.9, 1.1); 
    let baseSize = p5.map(p5.constrain(this.energy, 0, 1), 0, 1, 10, 40);
    let r = baseSize * sizeVar;
    let alpha = 1;
    if (this.age < 100) alpha = p5.map(this.age, 0, 100, 0, 1);
    else if (this.age > this.lifespan - 200) alpha = p5.map(this.age, this.lifespan - 200, this.lifespan, 1, 0);
    p5.push();
    p5.translate(this.pos.x, this.pos.y);
    p5.fill(this.currentHue, this.currentSat, 100, 0.05 * alpha);
    p5.circle(0, 0, r * 4);
    p5.fill(this.currentHue, this.currentSat, 100, 0.15 * alpha);
    p5.circle(0, 0, r * 2.5);
    let brightness = p5.map(this.energy, 0, 1, 80, 100);
    let coreSat = p5.map(this.energy, 0, 1, this.currentSat, 10); 
    p5.fill(this.currentHue, coreSat, brightness, 0.8 * alpha);
    p5.circle(0, 0, r);
    if (this.energy > 0.6) {
        p5.fill(0, 0, 100, 0.9 * alpha); 
        p5.circle(0, 0, r * 0.3);
    }
    p5.pop();
  }

  isDead() { return this.isDeadState; }
}

class Ripple {
  constructor(x, y) {
    this.pos = { x, y };
    this.size = 0;
    this.life = 255;
  }
  update() {
    this.size += 5; 
    this.life -= 4; 
  }
  display(p5) {
    p5.noFill();
    p5.stroke(180, 20, 100, p5.map(this.life, 0, 255, 0, 0.6));
    p5.strokeWeight(2);
    p5.circle(this.pos.x, this.pos.y, this.size);
  }
  isDead() { return this.life < 0; }
}

class TextParticle {
  constructor(p5, x, y, creationTime) {
    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.life = 255;
    this.creationTime = creationTime;
    this.igniteTime = creationTime + 3000; 
    this.isIgnited = false;
    this.noiseOffset = Math.random() * 1000;
  }
  update(p5) {
    if (!this.isIgnited) {
        if (p5.millis() > this.igniteTime + 500) {
            this.isIgnited = true;
            this.vel.y = p5.random(-2, -0.5);
            this.vel.x = p5.random(-0.5, 0.5);
        }
        return;
    }
    let n = p5.noise(this.noiseOffset, p5.frameCount * 0.05);
    let wind = p5.map(n, 0, 1, -1, 1);
    this.acc.x += wind * 0.2; 
    this.acc.y -= 0.15;       
    this.vel.add(this.acc);
    this.vel.mult(0.96);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= p5.random(3, 6);
  }
  show(p5) {
    p5.noStroke();
    if (!this.isIgnited) {
        p5.blendMode(p5.BLEND); 
        p5.fill(0, 0, 100); 
        p5.circle(this.pos.x, this.pos.y, 3); 
        return;
    }
    let normalizedLife = this.life / 255;
    p5.blendMode(p5.ADD);
    if (normalizedLife > 0.4) {
        let hue = p5.map(normalizedLife, 0.4, 1, 0, 50); 
        let size = p5.random(8, 20); 
        p5.fill(0, 100, 100, 0.1); p5.circle(this.pos.x, this.pos.y, size * 2);
        p5.fill(15, 100, 100, 0.2); p5.circle(this.pos.x, this.pos.y, size * 1.5);
        p5.fill(40, 50, 100, 0.8); p5.circle(this.pos.x, this.pos.y, size * 0.6);
    } else {
        p5.fill(0, 0, 30, normalizedLife * 0.5); p5.circle(this.pos.x, this.pos.y, 25);
    }
    p5.blendMode(p5.BLEND); 
  }
  finished() { return this.life < 0; }
}

// ===============================================
// 4. COMPONENTE REACT (FIX CANVAS POSITION)
// ===============================================

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
    
    // --- FIX CRUCIALE: FORZIAMO IL CANVAS A STARE FERMO ---
    const cnv = p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    cnv.style('display', 'block');
    cnv.style('position', 'absolute');
    cnv.style('top', '0');
    cnv.style('left', '0');
    cnv.style('z-index', '-1'); 
    // ----------------------------------------------------

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

  // --- BACKGROUND RENDERING (VISIBILE) ---

  const drawPrimordialSoup = (p5, preset) => {
      p5.blendMode(p5.BLEND);
      p5.noStroke();
      p5.fill(preset.hue, 50, 15, 0.3); // Base scura ma visibile
      p5.rect(0, 0, p5.width, p5.height);

      let t = p5.frameCount * 0.002 * preset.speed;
      let step = 20; 

      for (let x = 0; x < p5.width; x += step) {
          for (let y = 0; y < p5.height; y += step) {
              let n1 = p5.noise(x * 0.003 + t, y * 0.003, t*0.5);
              let n2 = p5.noise(x * 0.006 - n1, y * 0.006 + n1, t*1.2);
              let density = n2;

              if (density > 0.45) { 
                  let alpha = p5.map(density, 0.45, 1, 0, 0.2); 
                  let bri = p5.map(density, 0.45, 1, 20, 60); 
                  let sat = p5.map(density, 0.45, 1, preset.sat, preset.sat + 10);
                  let hueShift = p5.map(n1, 0, 1, -15, 15);

                  p5.fill(preset.hue + hueShift, sat, bri, alpha);
                  p5.circle(x, y, step * 4 * density);
              }
          }
      }
  };

  const drawBreathingNebula = (p5, preset, breathCycle) => {
      p5.blendMode(p5.BLEND);
      p5.noStroke();
      p5.fill(preset.hue, 40, 15, 0.2); 
      p5.rect(0, 0, p5.width, p5.height);

      let gridSize = 80;
      let t = p5.frameCount * 0.002;
      let pulseBri = p5.map(breathCycle, 0, 1, 0.05, 0.2); 
      let pulseSize = p5.map(breathCycle, 0, 1, 1.0, 1.3);

      for (let x = 0; x < p5.width; x += gridSize) {
          for (let y = 0; y < p5.height; y += gridSize) {
              let n = p5.noise(x * 0.005, y * 0.005, t);
              if (n > 0.3) {
                  let size = gridSize * 3 * n * pulseSize;
                  p5.fill(preset.hue + n*30, preset.sat, 60 + breathCycle*40, pulseBri);
                  p5.circle(x, y, size);
              }
          }
      }
  };

  const drawRecursiveFractalBackground = (p5, preset, breathCycle) => {
    p5.blendMode(p5.ADD);
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    p5.rotate(p5.frameCount * 0.001 * preset.speed);

    let breathWeight = 1 + (breathCycle * 1.5); 
    let breathAlpha = 0.25 + (breathCycle * 0.25); 
    let breathScale = 1.0 + (breathCycle * 0.1); 

    p5.scale(breathScale);

    const drawCircle = (x, y, d, depth) => {
        if (depth === 0) return;
        p5.noFill();
        p5.stroke(preset.hue, preset.sat, 60 + (breathCycle * 20), breathAlpha); 
        p5.strokeWeight(breathWeight);
        p5.circle(x, y, d);
        if (depth > 1) {
            const newD = d * 0.5;
            if (newD > 10) {
                for (let i = 0; i < 6; i++) {
                    const angle = (p5.TWO_PI / 6) * i;
                    const nx = x + Math.cos(angle) * (d * 0.5);
                    const ny = y + Math.sin(angle) * (d * 0.5);
                    drawCircle(nx, ny, newD, depth - 1);
                }
            }
        }
    };
    let baseSize = p5.width * 0.6; 
    drawCircle(0, 0, baseSize, 4);
    p5.pop();
    p5.blendMode(p5.BLEND);
  };

  const drawFluidBackground = (p5) => {
    p5.blendMode(p5.ADD); 
    const targetPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];
    for (let i = 0; i < organisms.current.length; i++) {
        let p1 = organisms.current[i];
        p1.update(p5, targetPreset);
        p1.display(p5);
        if (p1.reproCooldown <= 0 && organisms.current.length < 150) {
            for (let j = i + 1; j < organisms.current.length; j++) {
                let p2 = organisms.current[j];
                if (p2.reproCooldown <= 0) {
                    let r1 = p1.energy * 30;
                    let r2 = p2.energy * 30;
                    let d = p5.dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
                    if (d < (r1 + r2) * 0.8) {
                        let child = p1.combine(p2, p5);
                        child.currentHue = targetPreset.hue; 
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
    if (organisms.current.length < 10 && modeRef.current === 'flow') {
        const dna = { speed: p5.random(0.5, 1.5), size: p5.random(10, 30) };
        let px = p5.random(p5.width);
        let py = p5.random(p5.height);
        const preset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];
        organisms.current.push(new LuminousParticle(p5, px, py, 0.3, preset));
    }
    p5.blendMode(p5.BLEND); 
  };

  const drawBreathScene = (p5, breathCycle) => {
    p5.blendMode(p5.ADD);
    const time = p5.millis() / 1000;
    const preset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    const mainAngle = p5.radians(p5.map(breathCycle, 0, 1, 15, 25));
    const mainLen = p5.map(breathCycle, 0, 1, 3, 6);
    
    p5.push(); p5.rotate(time * 0.05 * preset.speed);
    let hue1 = (preset.hue - 10 + 360) % 360; 
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue1, preset.sat, 1.5);
    p5.pop();
    p5.push(); p5.rotate(-time * 0.03 * preset.speed); p5.scale(1.2); 
    let hue2 = preset.hue; 
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue2, preset.sat, 1.0);
    p5.pop();
    p5.push(); p5.rotate(time * 0.02 * preset.speed); p5.scale(1.4); 
    let hue3 = (preset.hue + 10) % 360;
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue3, preset.sat, 0.8);
    p5.pop();
    
    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = 'rgba(255,255,255,0.5)';
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(18);
    p5.text(breathCycle > 0.5 ? "ESPIRA" : "ISPIRA", 0, 0);
    p5.drawingContext.shadowBlur = 0;
    p5.pop();
    p5.blendMode(p5.BLEND);
  };

  const drawTextParticles = (p5) => {
    for (let i = textParticles.current.length - 1; i >= 0; i--) {
      let p = textParticles.current[i];
      p.update(p5);
      p.show(p5);
      if (p.finished()) textParticles.current.splice(i, 1);
    }
  };

  const draw = useCallback((p5) => {
    const currentMode = modeRef.current;
    const currentPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];

    const time = p5.millis() / 1000;
    const rawSin = Math.sin((time * (Math.PI * 2)) / 6.0 - Math.PI / 2);
    const breathCycle = (rawSin + 1) / 2;

    if (currentMode === "flow") {
        drawPrimordialSoup(p5, currentPreset);
        drawFluidBackground(p5);
    } else if (currentMode === "breathe") {
        drawBreathingNebula(p5, currentPreset, breathCycle);
        drawRecursiveFractalBackground(p5, currentPreset, breathCycle);
        drawBreathScene(p5, breathCycle);
    }

    for (let i = ripples.current.length - 1; i >= 0; i--) {
        let r = ripples.current[i];
        r.update();
        r.display(p5);
        if (r.isDead()) ripples.current.splice(i, 1);
    }

    if (textParticles.current.length > 0) {
        drawTextParticles(p5);
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