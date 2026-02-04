export const drawPrimordialSoup = (p5, preset) => {
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