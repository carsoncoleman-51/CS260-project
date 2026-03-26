import confetti from 'canvas-confetti';

const COLORS = ['#ff3b30', '#ffcc00', '#34c759', '#0a84ff', '#ff2d55'];

function shouldReduceMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function fireHighScoreConfetti() {
  if (typeof window === 'undefined' || shouldReduceMotion()) {
    return;
  }

  confetti({
    particleCount: 110,
    spread: 75,
    startVelocity: 42,
    origin: { y: 0.7 },
    colors: COLORS,
  });

  setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 95,
      startVelocity: 35,
      origin: { y: 0.7 },
      colors: COLORS,
    });
  }, 170);
}
