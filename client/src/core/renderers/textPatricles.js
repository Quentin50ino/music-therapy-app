/**
 * Manages the simulation loop for the "Burn Thoughts" ritual.
 * * DISINTEGRATION ENGINE:
 * This function handles the array of particles generated when a user's negative thought is "burned".
 * Unlike the fluid background, these particles have a finite lifespan and behave like sparks or ash
 * rising from a fire (upward velocity + turbulence).
 *
 * * ALGORITHMIC LOGIC:
 * 1. Backwards Iteration: Loops through the array from end to start. This is a standard
 * optimization technique when removing elements from an array during a loop (prevents index skipping).
 * 2. Physics Update: Calculates the new position (velocity + acceleration) for every spark.
 * 3. Rendering: Draws the particle at its new location.
 * 4. Cleanup: Checks if the particle has faded out (finished). If so, it permanently removes it
 * from memory to prevent performance leaks.
 *
 * @param {object} p5 - The p5.js instance.
 * @param {React.MutableRefObject} textParticles - Ref containing the array of active TextParticle objects.
 * @returns {void} Directly modifies the p5 canvas and mutates the particle array.
 */
export const drawTextParticles = (p5, textParticles) => {
    for (let i = textParticles.current.length - 1; i >= 0; i--) {
      let p = textParticles.current[i];
      p.update(p5);
      p.show(p5);
      if (p.finished()) textParticles.current.splice(i, 1);
    }
};