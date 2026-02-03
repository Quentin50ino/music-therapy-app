import React, { useEffect, useRef } from "react";
import Sketch from "react-p5";

// ===============================================
// 1. HELPER FUNCTIONS
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
      p5.stroke(hueBase + (i % 20), 60, 90, 0.4);
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
// 2. CLASSI
// ===============================================

class FluidParticle {
  constructor(p5, x, y, dna) {
    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    this.acc = p5.createVector(0, 0);
    this.dna = dna;
    this.maxSpeed = dna.speed * 0.5; 
    this.xOff = p5.random(1000);
    this.yOff = p5.random(1000);
    this.pulseOffset = p5.random(100);
    this.lifespan = p5.random(400, 800); 
    this.age = 0;
    this.isDeadState = false;
  }

  update(p5) {
    let angle = p5.noise(this.xOff, this.yOff, p5.frameCount * 0.005) * p5.TWO_PI * 2;
    let force = p5.createVector(p5.cos(angle), p5.sin(angle));
    force.mult(0.1); 
    this.acc.add(force);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
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
    let interHue = (this.dna.hue + p5.sin(p5.frameCount * 0.01) * 20) % 360;
    let alpha = 1;
    if (this.age < 100) alpha = p5.map(this.age, 0, 100, 0, 1); 
    else if (this.age > this.lifespan - 100) alpha = p5.map(this.age, this.lifespan - 100, this.lifespan, 1, 0); 
    if (this.age > this.lifespan) { this.isDeadState = true; alpha = 0; }

    p5.fill(interHue, 70, 80, 0.05 * alpha); 
    let pulse = p5.sin(p5.frameCount * 0.05 + this.pulseOffset) * 10;
    p5.circle(this.pos.x, this.pos.y, this.dna.size * 5 + pulse);
    p5.fill(interHue, 50, 100, 0.15 * alpha);
    p5.circle(this.pos.x, this.pos.y, this.dna.size * 2);
  }

  shouldReproduce(p5) {
    return this.age > this.lifespan * 0.5 && this.age < this.lifespan * 0.51 && p5.random(1) < 0.8;
  }

  reproduce(p5) {
    let newHue = this.dna.hue + p5.random(-15, 15);
    if (newHue < 140) newHue = 140 + 10;
    if (newHue > 280) newHue = 280 - 10;
    let newDna = {
        hue: newHue,
        speed: this.dna.speed + p5.random(-0.1, 0.1), 
        size: this.dna.size * p5.random(0.9, 1.1)     
    };
    return new FluidParticle(p5, this.pos.x, this.pos.y, newDna);
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
    this.maxSpeed = 2 + Math.random() * 2; 
    this.igniteOffset = Math.random() * 500;
  }

  update(p5) {
    if (!this.isIgnited) {
        if (p5.millis() > this.igniteTime + this.igniteOffset) {
            this.isIgnited = true;
            this.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 0));
        }
        return;
    }
    let turbulenceX = p5.map(p5.noise(this.noiseOffset, p5.frameCount * 0.02), 0, 1, -0.5, 0.5);
    let force = p5.createVector(turbulenceX * 0.5, -0.15);
    this.acc.add(force);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.vel.mult(0.96); 
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= p5.random(2, 4);
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
    let hue, sat, bri, alpha, size;
    if (normalizedLife > 0.6) {
        hue = p5.map(normalizedLife, 0.6, 1, 0, 60); 
        sat = 100; bri = 100; alpha = 1;
        size = p5.random(6, 15); 
    } else {
        hue = 0; sat = p5.map(normalizedLife, 0, 0.6, 0, 80);
        bri = p5.map(normalizedLife, 0, 0.6, 50, 100);
        alpha = normalizedLife;
        size = p5.map(normalizedLife, 0.6, 0, 10, 30);
    }
    p5.blendMode(p5.ADD);
    p5.fill(hue, sat, bri, alpha);
    p5.circle(this.pos.x, this.pos.y, size);
    p5.fill(hue, sat/2, bri, alpha);
    p5.circle(this.pos.x, this.pos.y, size * 0.5);
    p5.blendMode(p5.BLEND);
  }
  finished() { return this.life < 0; }
}

// ===============================================
// 3. COMPONENTE REACT
// ===============================================

const EvolutionaryVisualizer = ({ moodData, mode, burnSignal, onInteraction }) => {
  const modeRef = useRef(mode);
  const moodRef = useRef(moodData);
  
  const organisms = useRef([]);      
  const textParticles = useRef([]);  
  const fractalFlowers = useRef([]); 
  const ripples = useRef([]);        

  const p5Ref = useRef(null);
  const mainLSystem = useRef("");

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { moodRef.current = moodData || { valence: 0.5, energy: 0.5 }; }, [moodData]);

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
    for(let i=0; i<count; i++) {
      const hueBase = p5.random(160, 260); 
      const dna = {
        hue: hueBase,
        speed: p5.random(0.5, 1.5),
        size: p5.random(10, 30)
      };
      let px = x ? x + p5.random(-20, 20) : p5.random(p5.width);
      let py = y ? y + p5.random(-20, 20) : p5.random(p5.height);
      organisms.current.push(new FluidParticle(p5, px, py, dna));
    }
  };

  // --- NUOVA FUNZIONE: BACKGROUND FRATTALE RICORSIVO (Solo per Breathe Mode) ---
  const drawRecursiveFractalBackground = (p5) => {
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    // Lenta rotazione ipnotica
    p5.rotate(p5.frameCount * 0.002);

    // Funzione ricorsiva per disegnare cerchi concentrici frattali
    const drawCircle = (x, y, d, depth) => {
        if (depth === 0) return;

        p5.noFill();
        // Colore molto scuro e sottile (Deep Teal/Purple)
        p5.stroke(220, 60, 40, 0.15); 
        p5.strokeWeight(1);
        p5.circle(x, y, d);

        // Ricorsione
        if (depth > 1) {
            // Disegna 6 cerchi più piccoli intorno
            const newD = d * 0.5;
            // Solo se sono abbastanza grandi da essere visti
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

    // Avvia la ricorsione: un grande frattale che copre tutto
    // Dimensione basata sulla larghezza schermo
    drawCircle(0, 0, p5.width * 0.6, 4);
    p5.pop();
  };

  const drawFluidBackground = (p5) => {
    p5.blendMode(p5.ADD); 
    for (let i = organisms.current.length - 1; i >= 0; i--) {
      let org = organisms.current[i];
      org.update(p5);
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

    const mainAngle = p5.radians(p5.map(breathCycle, 0, 1, 15, 25));
    const mainLen = p5.map(breathCycle, 0, 1, 3, 6);

    p5.push();
    p5.rotate(time * 0.05);
    let hue1 = p5.map(breathCycle, 0, 1, 180, 220); 
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue1, 1.5);
    p5.pop();

    p5.push();
    p5.rotate(-time * 0.03);
    p5.scale(1.2);
    let hue2 = p5.map(breathCycle, 0, 1, 220, 260); 
    drawFractalRing(p5, mainLSystem.current, 6, mainLen, mainAngle, hue2, 0.8);
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

    for (let i = fractalFlowers.current.length - 1; i >= 0; i--) {
      let flower = fractalFlowers.current[i];
      flower.update();
      flower.display(p5, breathCycle, mainAngle);
      if (flower.isDead()) fractalFlowers.current.splice(i, 1);
    }
  };

  const drawTextParticles = (p5) => {
    p5.blendMode(p5.BLEND); 
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
    
    // SFONDO COMUNE: Gradient Deep Ocean
    let c1 = p5.color(230, 80, 10); 
    let c2 = p5.color(200, 70, 20); 
    setGradient(p5, 0, 0, p5.width, p5.height, c1, c2);

    // GESTIONE MODALITÀ (Switch Background)
    if (currentMode === "flow") {
        // Modalità normale: Particelle Fluide Evolutive
        drawFluidBackground(p5);
    } else if (currentMode === "breathe") {
        // Modalità Respiro: Frattale Geometrico Ricorsivo
        drawRecursiveFractalBackground(p5);
        // Overlay scena respiro (Mandala)
        drawBreathScene(p5);
    }

    // GESTIONE ELEMENTI COMUNI
    // Ripples (funzionano sempre)
    for (let i = ripples.current.length - 1; i >= 0; i--) {
        let r = ripples.current[i];
        r.update();
        r.display(p5);
        if (r.isDead()) ripples.current.splice(i, 1);
    }

    // Testo Bruciato (funziona sempre sopra tutto)
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
      // In Flow mode creo fluido
      spawnFluidParticles(p5, 5, p5.mouseX, p5.mouseY);
      // Spinta
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
      let particlesFound = 0;
      for (let y = 0; y < pg.height; y += step) {
        for (let x = 0; x < pg.width; x += step) {
          const index = (x + y * pg.width) * 4;
          if (pg.pixels[index + 3] > 128) {
             textParticles.current.push(new TextParticle(p5, x, y, creationTime));
             particlesFound++;
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