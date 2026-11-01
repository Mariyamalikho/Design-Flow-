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
