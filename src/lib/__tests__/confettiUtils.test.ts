import { describe, it, expect, vi } from "vitest";
import { triggerTaskCompletedConfetti } from "../confettiUtils";

vi.mock("canvas-confetti", () => {
  const confetti = vi.fn();
  return { default: confetti };
});

import confetti from "canvas-confetti";

describe("confettiUtils", () => {
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
});
