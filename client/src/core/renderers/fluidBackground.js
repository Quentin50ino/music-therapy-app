import { LuminousParticle } from "../entities/LuminousParticle.js";
import { Ripple } from "../entities/Ripple.js";

/**
 * Manages the rendering and simulation logic of the fluid particle system ("Primordial Soup").
 * * THIS IS THE CORE "PHYSICS ENGINE" OF THE FLOW MODE.
 * It is responsible for updating, drawing, and handling interactions between luminous particles for every frame.
 * * DETAILED OPERATION:
 * 1. Rendering: Sets blendMode to ADD to create the "glowing/neon" visual effect when particles overlap.
 * 2. Physics Loop: Iterates through all existing particles (organisms):
 * - Calculates new positions based on fluid dynamics.
 * - Renders the particle onto the canvas.
 * 3. Collision & Reproduction (O(n^2) logic):
 * - Checks if two "fertile" particles are close enough to touch.
 * - If yes: creates a new child particle, generates a visual "Ripple", and triggers the audio callback (onMerge).
 * 4. Lifecycle Management: Removes "dead" particles (those that ran out of energy or lifespan).
 * 5. Population Control: If the population drops below a threshold, it automatically spawns new particles to keep the system alive.
 * * @param {object} p5 - The main p5.js instance used for drawing.
 * @param {React.MutableRefObject} organisms - Ref containing the array of all living particles (LuminousParticle).
 * @param {object} targetPreset - Current configuration object (hue, speed) based on the active sound or mood.
 * @param {React.MutableRefObject} onMergeRef - Ref to the callback function that triggers the harmonic sound upon particle fusion.
 * @param {React.MutableRefObject} ripples - Ref containing the array of visual Ripples to be generated.
 * @param {React.MutableRefObject} modeRef - Ref indicating the current app mode (e.g., 'flow', 'breathe') to determine if spawning is allowed.
 * * @returns {void} No return value. Directly modifies the p5 canvas and mutates the passed Ref arrays.
 */
export const drawFluidBackground = (p5, organisms, targetPreset, onMergeRef, ripples, modeRef) => {
    p5.blendMode(p5.ADD); 
    for (let i = 0; i < organisms.current.length; i++) {
        let p1 = organisms.current[i];
        p1.update(p5, targetPreset);
        p1.display(p5);
        if (p1.reproCooldown <= 0 && organisms.current.length < 150) {
            for (let j = i + 1; j < organisms.current.length; j++) {
                let p2 = organisms.current[j];
                if (p2.reproCooldown <= 0) {
                    let r1 = p1.energy * 30;
                    let r2 = p2.energy * 30;
                    let d = p5.dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
                    if (d < (r1 + r2) * 0.8) {
                        let child = p1.combine(p2, p5);
                        child.currentHue = targetPreset.hue; 
                        organisms.current.push(child);
                        ripples.current.push(new Ripple(child.pos.x, child.pos.y));
                        if(onMergeRef.current) onMergeRef.current();
                        break; 
                    }
                }
            }
        }
        if (p1.isDead()) {
            organisms.current.splice(i, 1);
            i--;
        }
    }
    if (organisms.current.length < 10 && modeRef.current === 'flow') {
        let px = p5.random(p5.width);
        let py = p5.random(p5.height);
        organisms.current.push(new LuminousParticle(p5, px, py, 0.3, targetPreset));
    }
    p5.blendMode(p5.BLEND); 
  };