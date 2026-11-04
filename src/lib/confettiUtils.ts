import confetti from "canvas-confetti";

export interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  shapes?: confetti.Shape[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

/**
 * Triggers a stylish confetti burst when a deliverable/task is completed.
 * Features DesignFlow brand colors (indigo, violet, emerald, amber, rose).
 */
export function triggerTaskCompletedConfetti(options?: ConfettiOptions): void {
  try {
    if (typeof window === "undefined") return;

    confetti({
      particleCount: 55,
      spread: 65,
      startVelocity: 35,
      origin: options?.origin || { y: 0.75, x: 0.5 },
      colors: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"],
      disableForReducedMotion: true,
      zIndex: 9999,
      scalar: 0.9,
      ...options,
    });
  } catch {
    // Fail silently in non-browser or mock environments
  }
}

/**
 * Triggers a multi-stage celebratory confetti cannon burst when completing
 * the onboarding walkthrough or reaching a major creative milestone.
 */
export function triggerOnboardingCelebrationConfetti(): void {
  try {
    if (typeof window === "undefined") return;

    // First burst: left cannon
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.15, y: 0.65 },
      colors: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"],
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    // Second burst: right cannon
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.85, y: 0.65 },
      colors: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"],
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    // Center starburst slightly delayed
    setTimeout(() => {
      try {
        confetti({
          particleCount: 65,
          spread: 90,
          origin: { x: 0.5, y: 0.55 },
          colors: ["#6366f1", "#a855f7", "#3b82f6", "#10b981", "#fbbf24"],
          zIndex: 9999,
          disableForReducedMotion: true,
        });
      } catch {
        // Fail silently
      }
    }, 200);
  } catch {
    // Fail silently in non-browser or mock environments
  }
}
