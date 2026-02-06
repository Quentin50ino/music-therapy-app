/**
 * Renders the atmospheric background for the "Flow" mode, simulating a dense, fluid medium.
 * * ATMOSPHERIC ENGINE:
 * This function creates the "deep water" or "nebula" look that sits behind the active particles.
 * Instead of clearing the screen completely, it applies a semi-transparent layer to create trails/motion blur.
 *
 * * HOW IT WORKS:
 * 1. Trail Effect: Draws a semi-transparent rectangle over the entire screen. This preserves
 * a "ghost" of previous frames, giving the moving particles (drawn later) a smooth tail.
 * 2. Perlin Noise Field: Uses a grid loop (step = 20px) to sample noise values.
 * 3. Domain Warping: Calculates two layers of noise (`n1` and `n2`). The second layer is distorted
 * by the first, creating organic, swirling patterns rather than simple clouds.
 * 4. Threshold Rendering: Only draws circles where the noise density exceeds 0.45, creating
 * distinct "pockets" of gas or fluid rather than a uniform wash.
 *
 * @param {object} p5 - The p5.js instance.
 * @param {object} preset - The current sound/mood configuration object containing:
 * - hue: Base color hue (0-360).
 * - sat: Base saturation.
 * - speed: Multiplier for the time variable 't' (controls how fast the clouds morph).
 * @returns {void} Directly modifies the p5 canvas pixels.
 */
export const drawPrimordialSoup = (p5, preset) => {
      p5.blendMode(p5.BLEND);
      p5.noStroke();
      p5.fill(preset.hue, 50, 15, 0.3); 
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