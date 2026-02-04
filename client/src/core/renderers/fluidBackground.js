import { LuminousParticle } from "../entities/LuminousParticle.js";
import { Ripple } from "../entities/Ripple.js";
import { SOUND_PRESETS } from "../constants.js";

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
        const dna = { speed: p5.random(0.5, 1.5), size: p5.random(10, 30) };
        let px = p5.random(p5.width);
        let py = p5.random(p5.height);
        organisms.current.push(new LuminousParticle(p5, px, py, 0.3, targetPreset));
    }
    p5.blendMode(p5.BLEND); 
  };