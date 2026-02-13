import { drawFractalRing } from "../logic/l-systems";

export const drawBreathScene = (p5, breathCycle, preset, lSystemString, guideLabel = "INHALE", profileName = "BREATH") => {
    p5.blendMode(p5.ADD);
    
    const time = p5.millis() / 1000;
    
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);

    const mainAngle = p5.radians(p5.map(breathCycle, 0, 1, 15, 25));
    const mainLen = p5.map(breathCycle, 0, 1, 3, 6);
    
    p5.push(); 
    p5.rotate(time * 0.05 * preset.speed);
    let hue1 = (preset.hue - 10 + 360) % 360; 
    drawFractalRing(p5, lSystemString, 6, mainLen, mainAngle, hue1, preset.sat * 0.7, 1.2);
    p5.pop();

    p5.push(); 
    p5.rotate(-time * 0.03 * preset.speed); 
    p5.scale(1.2); 
    let hue2 = preset.hue; 
    drawFractalRing(p5, lSystemString, 6, mainLen, mainAngle, hue2, preset.sat * 0.72, 0.9);
    p5.pop();

    p5.push(); 
    p5.rotate(time * 0.02 * preset.speed); 
    p5.scale(1.4); 
    let hue3 = (preset.hue + 10) % 360;
    drawFractalRing(p5, lSystemString, 6, mainLen, mainAngle, hue3, preset.sat * 0.68, 0.7);
    p5.pop();
    
    p5.drawingContext.shadowBlur = 18;
    p5.drawingContext.shadowColor = 'rgba(182, 230, 255, 0.55)';
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(16);
    
    p5.text(guideLabel, 0, 0);

    p5.textSize(11);
    p5.fill(0, 0, 95, 0.9);
    p5.text(profileName, 0, 26);
    
    p5.drawingContext.shadowBlur = 0;
    
    p5.pop();
    
    p5.blendMode(p5.BLEND);
};
