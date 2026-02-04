 export const drawRecursiveFractalBackground = (p5, preset, breathCycle) => {
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