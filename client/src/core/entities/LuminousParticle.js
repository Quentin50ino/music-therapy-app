export class LuminousParticle {
  constructor(p5, x, y, energy, initialPreset) {
    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.energy = energy || 0.3; 
<<<<<<< HEAD
    this.baseSpeed = 0.56;
=======
    this.baseSpeed = 0.8;
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    this.currentHue = initialPreset ? initialPreset.hue : 210;
    this.currentSat = initialPreset ? initialPreset.sat : 80;
    this.xOff = p5.random(1000);
    this.yOff = p5.random(1000);
    this.pulseOffset = p5.random(100);
<<<<<<< HEAD
    this.lifespan = p5.random(2600, 3800); 
=======
    this.lifespan = p5.random(2000, 3000); 
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    this.age = 0;
    this.reproCooldown = 200; 
    this.isDeadState = false;
  }

  update(p5, preset, bpm) {
<<<<<<< HEAD
    let angle = p5.noise(this.xOff, this.yOff, p5.frameCount * 0.0015) * p5.TWO_PI * 3;
    let flowForce = p5.createVector(p5.cos(angle), p5.sin(angle));
    flowForce.mult(0.035); 
    
    let speedMod = p5.map(this.energy, 0, 1, 1.0, 0.65); 

    let bpmFactor = p5.map(bpm, 60, 180, 0.55, 1.35, true); 
=======
    let angle = p5.noise(this.xOff, this.yOff, p5.frameCount * 0.002) * p5.TWO_PI * 4;
    let flowForce = p5.createVector(p5.cos(angle), p5.sin(angle));
    flowForce.mult(0.05); 
    
    let speedMod = p5.map(this.energy, 0, 1, 1.0, 0.5); 

    let bpmFactor = p5.map(bpm, 60, 180, 0.6, 1.8, true); 
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e

    this.acc.add(flowForce);
    this.vel.add(this.acc);
    
    this.vel.limit(this.baseSpeed * preset.speed * speedMod * bpmFactor);
    
    this.pos.add(this.vel);
    this.acc.mult(0);

<<<<<<< HEAD
    this.xOff += 0.0022 * bpmFactor;
    this.yOff += 0.0022 * bpmFactor;
    
    this.age++;
    if (this.reproCooldown > 0) this.reproCooldown--;
    let agingSpeed = 0.88 + (this.energy * 0.25); 
=======
    this.xOff += 0.003 * bpmFactor;
    this.yOff += 0.003 * bpmFactor;
    
    this.age++;
    if (this.reproCooldown > 0) this.reproCooldown--;
    let agingSpeed = 1 + (this.energy * 0.3); 
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
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

  display(p5, bpm) {
    p5.noStroke();
    
<<<<<<< HEAD
    let pulseSpeed = p5.map(bpm, 60, 180, 0.02, 0.08, true);
=======
    let pulseSpeed = p5.map(bpm, 60, 180, 0.03, 0.15, true);
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    
    let breath = p5.sin(p5.frameCount * pulseSpeed + this.pulseOffset);
    let sizeVar = p5.map(breath, -1, 1, 0.85, 1.15); 
    
<<<<<<< HEAD
    let baseSize = p5.map(p5.constrain(this.energy, 0, 1), 0, 1, 8, 32);
=======
    let baseSize = p5.map(p5.constrain(this.energy, 0, 1), 0, 1, 10, 40);
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    let r = baseSize * sizeVar;

    let alpha = 1;
    if (this.age < 100) alpha = p5.map(this.age, 0, 100, 0, 1);
    else if (this.age > this.lifespan - 200) alpha = p5.map(this.age, this.lifespan - 200, this.lifespan, 1, 0);
    
    p5.push();
    p5.translate(this.pos.x, this.pos.y);
<<<<<<< HEAD
    p5.fill(this.currentHue, this.currentSat * 0.78, 100, 0.05 * alpha);
    p5.circle(0, 0, r * 4.6);
    p5.fill(this.currentHue, this.currentSat * 0.85, 100, 0.11 * alpha);
    p5.circle(0, 0, r * 2.9);
    let brightness = p5.map(this.energy, 0, 1, 84, 100);
    let coreSat = p5.map(this.energy, 0, 1, this.currentSat * 0.9, 12); 
    p5.fill(this.currentHue, coreSat, brightness, 0.72 * alpha);
    p5.circle(0, 0, r);
    if (this.energy > 0.6) {
        p5.fill(0, 0, 100, 0.75 * alpha); 
        p5.circle(0, 0, r * 0.26);
=======
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
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    }
    p5.pop();
  }

  isDead() { return this.isDeadState; }
<<<<<<< HEAD
}
=======
}
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
