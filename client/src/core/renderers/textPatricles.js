 export const drawTextParticles = (p5, textParticles) => {
    for (let i = textParticles.current.length - 1; i >= 0; i--) {
      let p = textParticles.current[i];
      p.update(p5);
      p.show(p5);
      if (p.finished()) textParticles.current.splice(i, 1);
    }
};