import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { triggerTaskCompletedConfetti, triggerOnboardingCelebrationConfetti } from "../confettiUtils";

vi.mock("canvas-confetti", () => {
  const confetti = vi.fn();
  return { default: confetti };
});

import confetti from "canvas-confetti";

describe("confettiUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("triggers confetti with custom particles and brand palette", () => {
    triggerTaskCompletedConfetti();

    expect(confetti).toHaveBeenCalledTimes(1);
    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 55,
        spread: 65,
        disableForReducedMotion: true,
        colors: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"],
      })
    );
  });

  it("accepts custom options overriding default values", () => {
    triggerTaskCompletedConfetti({ particleCount: 100, spread: 90 });

    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 100,
        spread: 90,
      })
    );
  });

  it("triggers multi-stage onboarding celebration cannons", () => {
    vi.useFakeTimers();
    triggerOnboardingCelebrationConfetti();

    // Two cannon bursts triggered immediately (left and right)
    expect(confetti).toHaveBeenCalledTimes(2);

    // Third starburst triggered after delay
    vi.advanceTimersByTime(250);
    expect(confetti).toHaveBeenCalledTimes(3);
  });
});
