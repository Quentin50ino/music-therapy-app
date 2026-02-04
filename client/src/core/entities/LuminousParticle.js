export class LuminousParticle {
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