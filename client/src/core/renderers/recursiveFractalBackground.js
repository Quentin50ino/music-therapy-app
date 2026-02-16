 /**
 * Renders the hypnotic, recursive background for the "Breathe" mode.
 * * FRACTAL GEOMETRY ENGINE:
 * This function generates a "Flower of Life" style fractal pattern using recursive circles.
 * Unlike the L-System (which is vector-based), this uses geometric recursion to create a
 * deep, tunnel-like effect that expands and contracts with the user's breath.
 *
 * * VISUAL SYNC:
 * The entire structure is tightly coupled to the 'breathCycle' (0.0 to 1.0):
 * - Inhale (approaching 1.0): The fractal expands (scale), brightens (alpha), and lines get thicker (weight).
 * - Exhale (approaching 0.0): The fractal contracts, dims, and becomes more delicate.
 *
 * * RECURSIVE LOGIC:
 * 1. Sets context to Additive Blending for a glowing light effect.
 * 2. Defines an inner closure `drawCircle` that draws a parent circle.
 * 3. If depth allows, it calculates 6 equidistant points on the perimeter (Hexagonal symmetry).
 * 4. Calls itself recursively at those new points with half the diameter.
 *
 * @param {object} p5 - The p5.js instance.
 * @param {object} preset - Configuration for color (hue/sat) and rotation speed.
 * @param {number} breathCycle - A normalized float (0.0 to 1.0) representing the current breath phase (Sine wave).
 * @returns {void} Directly modifies the p5 canvas.
 */
 export const drawRecursiveFractalBackground = (p5, preset, breathCycle, profile = null) => {
    p5.blendMode(p5.ADD);
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    const drift = profile?.drift || 1;
    p5.rotate(p5.frameCount * 0.001 * preset.speed * drift);

    let breathWeight = 0.8 + (breathCycle * 1.1);
    let breathAlpha = 0.12 + (breathCycle * 0.2);
    let breathScale = 0.96 + (breathCycle * 0.12);

    p5.scale(breathScale);

    const drawCircle = (x, y, d, depth) => {
        if (depth === 0) return;
        p5.noFill();
        p5.stroke(preset.hue, preset.sat * 0.75, 56 + (breathCycle * 24), breathAlpha);
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
    let baseSize = p5.width * 0.52;
    drawCircle(0, 0, baseSize, 4);
    p5.pop();
    p5.blendMode(p5.BLEND);
  };
