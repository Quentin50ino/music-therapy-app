// File: src/core/renderers/drawBreathScene.js (o dove preferisci metterlo)

import { drawFractalRing } from "../logic/l-systems"; // Controlla che questo percorso sia giusto!

export const drawBreathScene = (p5, breathCycle, preset, lSystemString) => {
    // Usa ADD per l'effetto luminoso/etereo
    p5.blendMode(p5.ADD);
    
    const time = p5.millis() / 1000;
    
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);

    // Parametri dinamici basati sul respiro
    // L'angolo cambia leggermente per dare l'effetto di "apertura" del fiore/mandala
    const mainAngle = p5.radians(p5.map(breathCycle, 0, 1, 15, 25));
    const mainLen = p5.map(breathCycle, 0, 1, 3, 6);
    
    // --- ANELLO 1 (Sfondo lento) ---
    p5.push(); 
    p5.rotate(time * 0.05 * preset.speed);
    let hue1 = (preset.hue - 10 + 360) % 360; 
    drawFractalRing(p5, lSystemString, 6, mainLen, mainAngle, hue1, preset.sat, 1.5);
    p5.pop();

    // --- ANELLO 2 (Contrasto e rotazione opposta) ---
    p5.push(); 
    p5.rotate(-time * 0.03 * preset.speed); 
    p5.scale(1.2); 
    let hue2 = preset.hue; 
    drawFractalRing(p5, lSystemString, 6, mainLen, mainAngle, hue2, preset.sat, 1.0);
    p5.pop();

    // --- ANELLO 3 (Dettaglio centrale veloce) ---
    p5.push(); 
    p5.rotate(time * 0.02 * preset.speed); 
    p5.scale(1.4); 
    let hue3 = (preset.hue + 10) % 360;
    drawFractalRing(p5, lSystemString, 6, mainLen, mainAngle, hue3, preset.sat, 0.8);
    p5.pop();
    
    // --- TESTO GUIDA (ISPIRA / ESPIRA) ---
    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = 'rgba(255,255,255,0.5)';
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(18);
    
    const textContent = breathCycle > 0.5 ? "ESPIRA" : "ISPIRA";
    p5.text(textContent, 0, 0);
    
    // Reset ombra
    p5.drawingContext.shadowBlur = 0;
    
    p5.pop();
    
    // Reset blend mode per non rovinare i frame successivi
    p5.blendMode(p5.BLEND);
};