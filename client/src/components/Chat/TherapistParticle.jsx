import React from 'react';

const TherapistParticle = ({ assistantState, onActivate }) => {
  if (assistantState === 'open') {
    return null;
  }

  let stateClass = 'therapist-particle therapist-particle-visible';
  if (assistantState === 'closing') {
    stateClass = 'therapist-particle therapist-particle-materializing';
  } else if (assistantState === 'opening') {
    stateClass = 'therapist-particle therapist-particle-dematerializing';
  }

  return (
    <button
      type="button"
      className={stateClass}
      onClick={assistantState === 'closed' ? onActivate : undefined}
      disabled={assistantState !== 'closed'}
      aria-label="Open Serenify therapist"
    >
      <span className="therapist-particle-aura" />
      <span className="therapist-particle-halo" />
      <span className="therapist-particle-orbit" />
      <span className="therapist-particle-core" />
      <span className="therapist-particle-symbol">S</span>
    </button>
  );
};

export default TherapistParticle;
