export const generateLSystem = (axiom, rules, iterations) => {
    let sentence = axiom;
    for (let i = 0; i < iterations; i++) {
        let nextSentence = "";
        for (let j = 0; j < sentence.length; j++) {
            let char = sentence.charAt(j);
            if (rules[char]) nextSentence += rules[char];
            else nextSentence += char;
        }
        sentence = nextSentence;
    }
    return sentence;
};

export const renderTurtle = (p5, sentence, len, angle, hueBase, satBase) => {
  for (let i = 0; i < sentence.length; i++) {
    let char = sentence.charAt(i);
    if (char === "F") {
      p5.stroke(hueBase + (i % 20), satBase, 95, 0.6);
      p5.line(0, 0, 0, -len);
      p5.translate(0, -len);
    } else if (char === "+") {
      p5.rotate(angle);
    } else if (char === "-") {
      p5.rotate(-angle);
    } else if (char === "[") {
      p5.push();
    } else if (char === "]") {
      p5.pop();
    }
  }
};


export const drawFractalRing = (p5, sentence, symmetry, len, angle, hue, sat, weight) => {
  for (let i = 0; i < symmetry; i++) {
    p5.rotate(p5.TWO_PI / symmetry);
    p5.push();
    p5.strokeWeight(weight);
    renderTurtle(p5, sentence, len, angle, hue, sat);
    p5.pop();
  }
};