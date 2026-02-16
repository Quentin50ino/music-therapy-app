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

    const t = p5.frameCount * 0.0012 * preset.speed;

    // Deep ocean gradient with a soft shift from sky-lit cyan to abyssal blue.
    const bands = 22;
    const bandHeight = p5.height / bands;
    for (let i = 0; i <= bands; i++) {
        const depth = i / bands;
        const hue = 192 + (depth * 18) + (Math.sin(t * 1.4 + (depth * 2.4)) * 2.1);
        const sat = 52 + (depth * 22);
        const bri = 26 - (depth * 18);
        p5.fill((hue + 360) % 360, sat, bri, 0.32);
        p5.rect(0, i * bandHeight, p5.width, bandHeight + 2);
    }

    // Dynamic god rays from surface.
    p5.blendMode(p5.ADD);
    const rayStep = 72;
    for (let x = -rayStep; x < p5.width + rayStep; x += rayStep) {
        const n = p5.noise((x * 0.002) + (t * 0.2), t * 0.08);
        const rayX = x + (Math.sin((t * 0.8) + (x * 0.017)) * 26);
        const rayWidth = 42 + (n * 88);
        const rayHeight = p5.height * (0.58 + (n * 0.28));
        p5.fill(190, 35, 96, 0.042 + (n * 0.026));
        p5.ellipse(rayX, p5.height * 0.2, rayWidth, rayHeight);
    }

    // Caustics and shallow-water light ripples.
    const causticStepX = 40;
    const causticStepY = 32;
    for (let x = 0; x < p5.width; x += causticStepX) {
        for (let y = 0; y < p5.height * 0.78; y += causticStepY) {
            const n = p5.noise((x * 0.0065) + (t * 0.9), (y * 0.0065) - (t * 0.45), t * 0.3);
            if (n > 0.64) {
                const glow = p5.map(n, 0.64, 1, 0.018, 0.12);
                const size = p5.map(n, 0.64, 1, 18, 74);
                p5.fill(183, 42, 100, glow);
                p5.ellipse(x, y, size, size * 0.42);
            }
        }
    }

    // Far underwater haze.
    p5.blendMode(p5.BLEND);
    p5.fill(210, 46, 5, 0.3);
    p5.rect(0, p5.height * 0.62, p5.width, p5.height * 0.4);
};
