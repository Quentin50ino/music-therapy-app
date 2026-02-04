export class Ripple {
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