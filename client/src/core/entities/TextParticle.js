export class TextParticle {
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