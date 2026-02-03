import React, { useEffect, useRef } from "react";
import Sketch from "react-p5";

// ===============================================
// 1. CONFIGURAZIONE PRESET SUONI (Colore + Fisica)
// ===============================================
const SOUND_PRESETS = {
  off:      { hue: 210, sat: 80,  speed: 1.0, size: 1.0 }, // Ocean Blue
  brown:    { hue: 25,  sat: 90,  speed: 0.5, size: 1.5 }, // Deep Earth/Lava (Lento e grande)
  green:    { hue: 130, sat: 70,  speed: 1.2, size: 1.1 }, // Forest Green (Organico)
  pink:     { hue: 320, sat: 60,  speed: 1.8, size: 0.7 }, // Soft Pink (Veloce e piccolo - Pioggia)
  binaural: { hue: 260, sat: 90,  speed: 0.2, size: 1.3 }, // Electric Purple (Quasi fermo - Focus)
  '432':    { hue: 45,  sat: 100, speed: 0.3, size: 1.6 }, // Gold (Molto lento - Solenne)
};

// ===============================================
// 2. HELPER FUNCTIONS
// ===============================================

const setGradient = (p5, x, y, w, h, c1, c2) => {
  p5.noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = p5.map(i, y, y + h, 0, 1);
    let c = p5.lerpColor(c1, c2, inter);
    p5.stroke(c);
    p5.line(x, i, x + w, i);
  }
};

const renderTurtle = (p5, sentence, len, angle, hueBase) => {
  for (let i = 0; i < sentence.length; i++) {
    let char = sentence.charAt(i);
    if (char === "F") {
      p5.stroke(hueBase + (i % 20), 70, 95, 0.5);
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

const drawFractalRing = (p5, sentence, symmetry, len, angle, hue, weight) => {
  for (let i = 0; i < symmetry; i++) {
    p5.rotate(p5.TWO_PI / symmetry);
    p5.push();
    p5.strokeWeight(weight);
    renderTurtle(p5, sentence, len, angle, hue);
    p5.pop();
  }
};

// ===============================================
// 3. CLASSI
// ===============================================

class FluidParticle {
  constructor(p5, x, y, dna, initialPreset) {
    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    this.acc = p5.createVector(0, 0);
    
    // DNA base
    this.baseSpeed = dna.speed;
    this.baseSize = dna.size;
    
    // Stato Corrente (per le transizioni fluide)
    this.currentHue = initialPreset ? initialPreset.hue : 210;
    this.targetHue = this.currentHue;
    
    this.currentSat = initialPreset ? initialPreset.sat : 80;
    
    this.speedMult = 1.0;
    this.sizeMult = 1.0;

    this.xOff = p5.random(1000);
    this.yOff = p5.random(1000);
    this.pulseOffset = p5.random(100);
    this.lifespan = p5.random(400, 800); 
    this.age = 0;
    this.isDeadState = false;
  }

  // Riceve il preset attuale (dal suono)
  update(p5, preset) {
    // 1. Interpolazione Colore (Lerp)
    // Se il suono cambia, il colore cambia gradualmente, non a scatto
    // Gestione speciale per il passaggio ciclico (es. da 350 a 10)
    let diff = preset.hue - this.currentHue;
    if (Math.abs(diff) > 180) { 
        if (diff > 0) this.currentHue += 360; 
        else this.currentHue -= 360; 
    }
    this.currentHue = p5.lerp(this.currentHue, preset.hue, 0.05);
    // Normalizza hue tra 0 e 360
    if (this.currentHue > 360) this.currentHue -= 360;
    if (this.currentHue < 0) this.currentHue += 360;

    this.currentSat = p5.lerp(this.currentSat, preset.sat, 0.05);
    
    // 2. Interpolazione Fisica
    this.speedMult = p5.lerp(this.speedMult, preset.speed, 0.05);
    this.sizeMult = p5.lerp(this.sizeMult, preset.size, 0.05);

    // 3. Movimento Standard
    let angle = p5.noise(this.xOff, this.yOff, p5.frameCount * 0.005) * p5.TWO_PI * 2;
    let force = p5.createVector(p5.cos(angle), p5.sin(angle));
    force.mult(0.1); 
    
    this.acc.add(force);
    this.vel.add(this.acc);
    
    // Applica moltiplicatore velocità del suono
    this.vel.limit((this.baseSpeed * 0.5) * this.speedMult);
    
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    this.xOff += 0.005;
    this.yOff += 0.005;
    this.age++;
    
    if (this.pos.x > p5.width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = p5.width;
    if (this.pos.y > p5.height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = p5.height;
  }

  display(p5) {
      p5.noStroke();
      
      // Calcoliamo una variazione pulsante per far sembrare la particella "viva" (respiro)
      // Non solo si muove, ma "respira" leggermente
      let breath = p5.sin(p5.frameCount * 0.05 + this.pulseOffset);
      let sizeVar = p5.map(breath, -1, 1, 0.9, 1.1); // Variazione del 10%

      // Dimensione finale basata sul DNA, il suono e il respiro
      let baseR = this.baseSize * this.sizeMult * sizeVar;

      // Colore dinamico
      let dynamicHue = (this.currentHue + p5.sin(p5.frameCount * 0.01) * 5) % 360;
      
      // Gestione Alpha (Vita)
      let alpha = 1;
      if (this.age < 100) alpha = p5.map(this.age, 0, 100, 0, 1); 
      else if (this.age > this.lifespan - 100) alpha = p5.map(this.age, this.lifespan - 100, this.lifespan, 1, 0); 
      if (this.age > this.lifespan) { this.isDeadState = true; alpha = 0; }

      // --- RENDERING "BOKEH" (GLOW) ---
      // Invece di 2 cerchi, ne disegniamo 3 molto soffusi per creare un gradiente di luce
      
      // 1. Alone Esterno (Molto largo e impercettibile)
      p5.fill(dynamicHue, this.currentSat, 100, 0.03 * alpha); 
      p5.circle(this.pos.x, this.pos.y, baseR * 8);

      // 2. Alone Medio (Il corpo della medusa)
      p5.fill(dynamicHue, this.currentSat, 100, 0.1 * alpha); 
      p5.circle(this.pos.x, this.pos.y, baseR * 4);

      // 3. Nucleo (Più definito ma sempre morbido)
      p5.fill(dynamicHue, this.currentSat - 20, 100, 0.4 * alpha);
      p5.circle(this.pos.x, this.pos.y, baseR * 1.5);
      
      // 4. Punto Luce (Il cuore brillante, opzionale, per dare "focus")
      // Lo rendiamo quasi bianco per dare l'idea di fonte luminosa
      p5.fill(dynamicHue, 20, 100, 0.6 * alpha);
      p5.circle(this.pos.x, this.pos.y, baseR * 0.5);
    }

  shouldReproduce(p5) {
    return this.age > this.lifespan * 0.5 && this.age < this.lifespan * 0.51 && p5.random(1) < 0.8;
  }

  reproduce(p5) {
    let newDna = {
        speed: this.baseSpeed + p5.random(-0.1, 0.1), 
        size: this.baseSize * p5.random(0.9, 1.1)     
    };
    // Passiamo lo stato attuale del genitore (colore) per continuità
    let presetSnapshot = { hue: this.currentHue, sat: this.currentSat, speed: this.speedMult, size: this.sizeMult };
    return new FluidParticle(p5, this.pos.x, this.pos.y, newDna, presetSnapshot);
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
    if (this.size > 40) {
        p5.stroke(180, 20, 100, p5.map(this.life, 0, 255, 0, 0.3));
        p5.circle(this.pos.x, this.pos.y, this.size * 0.7);
    }
  }
  isDead() { return this.life < 0; }
}

class FractalFlower {
  constructor(x, y, dnaString) {
    this.pos = { x, y };
    this.dna = dnaString;
    this.life = 255;
    this.hue = Math.random() * 60 + 160; 
    this.rotationSpeed = (Math.random() - 0.5) * 0.01;
    this.scale = 0;
    this.maxScale = 0.4 + Math.random() * 0.4;
  }
  update() {
    this.life -= 1.0;
    if (this.scale < this.maxScale) this.scale += 0.01;
  }
  display(p5, breathCycle, globalAngle) {
    p5.push();
    p5.translate(this.pos.x, this.pos.y);
    p5.scale(this.scale);
    p5.rotate(p5.millis() * 0.0005 + this.rotationSpeed * 50);
    
    let pulseLen = p5.map(breathCycle, 0, 1, 3, 5);
    
    for (let i = 0; i < 5; i++) {
      p5.rotate(p5.TWO_PI / 5);
      p5.push();
      p5.strokeWeight(1);
      renderTurtle(p5, this.dna, pulseLen, globalAngle * 1.5, this.hue);
      p5.pop();
    }
    p5.pop();
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
    this.maxSpeed = 3 + Math.random() * 2; 
    this.igniteOffset = Math.random() * 500;
  }

  update(p5) {
    if (!this.isIgnited) {
        if (p5.millis() > this.igniteTime + this.igniteOffset) {
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
    let hue, size;
    p5.blendMode(p5.ADD);
    if (normalizedLife > 0.4) {
        hue = p5.map(normalizedLife, 0.4, 1, 0, 50); 
        size = p5.random(8, 20); 
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
// 4. COMPONENTE REACT
// ===============================================

const EvolutionaryVisualizer = ({ moodData, mode, burnSignal, ambientType, onInteraction }) => {
  const modeRef = useRef(mode);
  const moodRef = useRef(moodData);
  const ambientTypeRef = useRef(ambientType); // Ref per accesso dentro p5

  const organisms = useRef([]);      
  const textParticles = useRef([]);  
  const fractalFlowers = useRef([]); 
  const ripples = useRef([]);        

  const p5Ref = useRef(null);
  const mainLSystem = useRef("");

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { moodRef.current = moodData || { valence: 0.5, energy: 0.5 }; }, [moodData]);
  useEffect(() => { ambientTypeRef.current = ambientType || 'off'; }, [ambientType]);

  const generateString = (level, ruleSet = "complex") => {
    let sentence = "X";
    const rulesComplex = { X: "F-[[X]+X]+F[+FX]-X", F: "FF" };
    const rulesSimple = { X: "F[+X][-X]FX", F: "FF" };
    const activeRules = ruleSet === "complex" ? rulesComplex : rulesSimple;
    for (let i = 0; i < level; i++) {
      let nextSentence = "";
      for (let j = 0; j < sentence.length; j++) {
        let char = sentence.charAt(j);
        if (activeRules[char]) nextSentence += activeRules[char];
        else nextSentence += char;
      }
      sentence = nextSentence;
    }
    return sentence;
  };

  const spawnFluidParticles = (p5, count, x = null, y = null) => {
    // Otteniamo il preset corrente per dare il colore giusto alle nuove particelle
    const currentPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];

    for(let i=0; i<count; i++) {
      const dna = {
        speed: p5.random(0.5, 1.5),
        size: p5.random(10, 30)
      };
      let px = x ? x + p5.random(-20, 20) : p5.random(p5.width);
      let py = y ? y + p5.random(-20, 20) : p5.random(p5.height);
      organisms.current.push(new FluidParticle(p5, px, py, dna, currentPreset));
    }
  };

  const drawFluidBackground = (p5) => {
    p5.blendMode(p5.ADD); 
    
    // Identifichiamo il preset target in base al suono attuale
    const targetPreset = SOUND_PRESETS[ambientTypeRef.current] || SOUND_PRESETS['off'];

    for (let i = organisms.current.length - 1; i >= 0; i--) {
      let org = organisms.current[i];
      
      // Passiamo il targetPreset alla particella che si aggiornerà gradualmente
      org.update(p5, targetPreset);
      org.display(p5);
      
      if (org.shouldReproduce(p5) && organisms.current.length < 120) {
        organisms.current.push(org.reproduce(p5));
      }
      if (org.isDead()) {
          organisms.current.splice(i, 1);
      }
    }
    // Ripopola solo se in Flow Mode
    if (organisms.current.length < 20 && modeRef.current === 'flow') {
        spawnFluidParticles(p5, 5);
    }
    p5.blendMode(p5.BLEND); 
  };

  const drawBreathScene = (p5) => {
    const time = p5.millis() / 1000;
    const cycleDuration = 6.0;
    const rawSin = Math.sin((time * (Math.PI * 2)) / cycleDuration - Math.PI / 2);
    const breathCycle = (rawSin + 1) / 2; 

    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);

    const mainAngle = p5.radians(p5.map(breathCycle, 0, 1, 15, 30));
    const mainLen = p5.map(breathCycle, 0, 1, 5, 12); 

    p5.push();
    p5.rotate(time * 0.05);
    let hue1 = p5.map(breathCycle, 0, 1, 180, 200); 
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue1, 2);
    p5.pop();

    p5.push();
    p5.rotate(-time * 0.03);
    p5.scale(p5.map(breathCycle, 0, 1, 1.1, 1.6)); 
    let hue2 = p5.map(breathCycle, 0, 1, 200, 230); 
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue2, 1.5);
    p5.pop();

    p5.push();
    p5.rotate(time * 0.02);
    p5.scale(p5.map(breathCycle, 0, 1, 1.5, 2.5)); 
    let hue3 = p5.map(breathCycle, 0, 1, 230, 260); 
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue3, 1);
    p5.pop();

    p5.push();
    p5.rotate(-time * 0.01); 
    p5.scale(p5.map(breathCycle, 0, 1, 2.0, 4.0)); 
    let hue4 = p5.map(breathCycle, 0, 1, 260, 290); 
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue4, 0.8);
    p5.pop();

    p5.drawingContext.shadowBlur = 30;
    p5.drawingContext.shadowColor = 'rgba(255,255,255,0.8)';
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(22); 
    p5.text(breathCycle > 0.5 ? "ESPIRA" : "ISPIRA", 0, 0);
    p5.drawingContext.shadowBlur = 0;
    p5.pop();

    for (let i = fractalFlowers.current.length - 1; i >= 0; i--) {
      let flower = fractalFlowers.current[i];
      flower.update();
      flower.display(p5, breathCycle, mainAngle);
      if (flower.isDead()) fractalFlowers.current.splice(i, 1);
    }
  };

  const drawTextParticles = (p5) => {
    for (let i = textParticles.current.length - 1; i >= 0; i--) {
      let p = textParticles.current[i];
      p.update(p5);
      p.show(p5);
      if (p.finished()) textParticles.current.splice(i, 1);
    }
  };

  const setup = (p5, canvasParentRef) => {
    p5Ref.current = p5;
    p5.pixelDensity(1); 
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    p5.noStroke();
    mainLSystem.current = generateString(4, "complex");
    spawnFluidParticles(p5, 60);
  };

  const draw = (p5) => {
    const currentMode = modeRef.current;
    
    // SFONDO COMUNE (Gradient di base)
    // Nota: Il gradiente di sfondo rimane scuro per far risaltare le particelle colorate
    let c1 = p5.color(230, 80, 15); 
    let c2 = p5.color(200, 70, 25); 
    setGradient(p5, 0, 0, p5.width, p5.height, c1, c2);

    if (currentMode === "flow") {
        drawFluidBackground(p5);
    } else if (currentMode === "breathe") {
        drawBreathScene(p5);
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
  };

  const mousePressed = (p5) => {
    if (onInteraction) onInteraction(p5.mouseX, p5.mouseY, p5.width, p5.height);
    ripples.current.push(new Ripple(p5.mouseX, p5.mouseY));
    
    if (modeRef.current === "breathe") {
      const flowerDNA = generateString(3, "simple");
      fractalFlowers.current.push(new FractalFlower(p5.mouseX, p5.mouseY, flowerDNA));
    } else {
      spawnFluidParticles(p5, 5, p5.mouseX, p5.mouseY);
      for(let org of organisms.current) {
        let d = p5.dist(p5.mouseX, p5.mouseY, org.pos.x, org.pos.y);
        if (d < 200) {
            let pushForce = p5.createVector(org.pos.x - p5.mouseX, org.pos.y - p5.mouseY);
            pushForce.normalize();
            pushForce.mult(3);
            org.vel.add(pushForce);
        }
      }
    }
  };

  const mouseDragged = (p5) => {
    if (onInteraction) onInteraction(p5.mouseX, p5.mouseY, p5.width, p5.height);
    if (p5.frameCount % 10 === 0) {
       ripples.current.push(new Ripple(p5.mouseX, p5.mouseY));
       if (modeRef.current === "flow") {
         spawnFluidParticles(p5, 1, p5.mouseX, p5.mouseY);
       }
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

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

export default EvolutionaryVisualizer;