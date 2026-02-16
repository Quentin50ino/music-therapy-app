export class TextParticle {
<<<<<<< HEAD
  constructor(p5, x, y, creationTime, options = {}) {
    this.pos = p5.createVector(x, y);
    this.anchor = p5.createVector(x, y);
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.variant = options.variant || 'fire';
    this.life = this.variant === 'calm' ? 320 : 255;
    this.creationTime = creationTime;
    this.igniteTime = creationTime + (this.variant === 'calm' ? 1100 : 3000); 
=======
  constructor(p5, x, y, creationTime) {
    this.pos = p5.createVector(x, y);
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.life = 255;
    this.creationTime = creationTime;
    this.igniteTime = creationTime + 3000; 
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
    this.isIgnited = false;
    this.noiseOffset = Math.random() * 1000;
  }
  update(p5) {
    if (!this.isIgnited) {
        if (p5.millis() > this.igniteTime + 500) {
            this.isIgnited = true;
<<<<<<< HEAD
            if (this.variant === 'calm') {
                this.vel.y = p5.random(-0.14, 0.14);
                this.vel.x = p5.random(-0.14, 0.14);
            } else {
                this.vel.y = p5.random(-2, -0.5);
                this.vel.x = p5.random(-0.5, 0.5);
            }
        }
        return;
    }

    if (this.variant === 'calm') {
        let nX = p5.noise(this.noiseOffset, p5.frameCount * 0.02);
        let nY = p5.noise(this.noiseOffset + 300, p5.frameCount * 0.02);
        this.acc.x += p5.map(nX, 0, 1, -0.06, 0.06);
        this.acc.y += p5.map(nY, 0, 1, -0.06, 0.06);
        let pull = p5.createVector(this.anchor.x - this.pos.x, this.anchor.y - this.pos.y);
        pull.mult(0.02);
        this.acc.add(pull);
        this.vel.add(this.acc);
        this.vel.limit(0.8);
        this.vel.mult(0.95);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.life -= p5.random(0.35, 0.85);
        return;
    }

=======
            this.vel.y = p5.random(-2, -0.5);
            this.vel.x = p5.random(-0.5, 0.5);
        }
        return;
    }
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
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
<<<<<<< HEAD
        p5.fill(0, 0, 100, this.variant === 'calm' ? 0.22 : 1); 
        p5.circle(this.pos.x, this.pos.y, this.variant === 'calm' ? 1.8 : 3); 
        return;
    }

    if (this.variant === 'calm') {
        let normalizedLife = this.life / 320;
        let pulse = 0.92 + Math.sin((p5.frameCount + this.noiseOffset) * 0.08) * 0.1;
        p5.blendMode(p5.ADD);
        p5.fill(186, 58, 100, 0.09 * normalizedLife);
        p5.circle(this.pos.x, this.pos.y, 12 * pulse);
        p5.fill(195, 24, 100, 0.72 * normalizedLife);
        p5.circle(this.pos.x, this.pos.y, 3.1 * pulse);
        p5.blendMode(p5.BLEND);
        return;
    }

    let normalizedLife = this.life / 255;
    p5.blendMode(p5.ADD);
    if (normalizedLife > 0.4) {
=======
        p5.fill(0, 0, 100); 
        p5.circle(this.pos.x, this.pos.y, 3); 
        return;
    }
    let normalizedLife = this.life / 255;
    p5.blendMode(p5.ADD);
    if (normalizedLife > 0.4) {
        let hue = p5.map(normalizedLife, 0.4, 1, 0, 50); 
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
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
<<<<<<< HEAD
}
=======
}
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
