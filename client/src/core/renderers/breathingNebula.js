/**
 * Renders the soft, pulsating atmospheric background for the "Breathe" mode.
 * * ATMOSPHERIC LAYER:
 * This function creates a subtle, nebulous backdrop that sits behind the sharp fractal geometry.
 * Unlike the "Primordial Soup" (which is fluid and chaotic), this layer is rhythmic and structured.
 *
 * * VISUAL SYNC:
 * It connects the user's breath to the ambient light of the environment:
 * - Inhale (approaching 1.0): The nebula expands (pulseSize) and brightens (pulseBri).
 * - Exhale (approaching 0.0): The nebula contracts and dims.
 *
 * * RENDERING LOGIC:
 * 1. Uses a low-resolution grid (step = 80px) to draw large, soft, overlapping orbs.
 * 2. Perlin Noise determines the placement and base size of these orbs to avoid a mechanical look.
 * 3. The overlapping low-alpha circles blend together to form a seamless, cloud-like texture.
 *
 * @param {object} p5 - The p5.js instance.
 * @param {object} preset - Color configuration (hue/sat).
 * @param {number} breathCycle - Normalized float (0.0 to 1.0) representing the current breath phase.
 * @returns {void} Directly modifies the p5 canvas.
 */
<<<<<<< HEAD
export const drawBreathingNebula = (p5, preset, breathCycle, profile = null) => {
    p5.blendMode(p5.BLEND);
    p5.noStroke();
    p5.fill((preset.hue + 8) % 360, 28, 11, 0.18);
    p5.rect(0, 0, p5.width, p5.height);

    const driftMultiplier = profile?.drift || 1;
    const gridSize = 92 / Math.max(0.86, Math.min(1.2, driftMultiplier));
    const t = p5.frameCount * 0.0018;
    const pulseBri = p5.map(breathCycle, 0, 1, 0.04, 0.17);
    const pulseSize = p5.map(breathCycle, 0, 1, 0.95, 1.26);

    for (let x = 0; x < p5.width; x += gridSize) {
        for (let y = 0; y < p5.height; y += gridSize) {
            const n = p5.noise(x * 0.004, y * 0.004, t);
            if (n > 0.28) {
                const size = gridSize * 2.6 * n * pulseSize;
                p5.fill((preset.hue + n * 22) % 360, preset.sat * 0.7, 48 + breathCycle * 36, pulseBri);
                p5.circle(x, y, size);
            }
        }
    }
};
=======
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
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
