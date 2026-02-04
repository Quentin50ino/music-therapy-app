export const drawBreathingNebula = (p5, preset, breathCycle) => {
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