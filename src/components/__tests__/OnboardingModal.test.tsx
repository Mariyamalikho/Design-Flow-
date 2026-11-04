import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  OnboardingModal,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_STEPS,
} from "../OnboardingModal";
import { safeLocalStorage } from "@/lib/storageUtils";
import * as confettiUtils from "@/lib/confettiUtils";

// Mock confetti
vi.mock("@/lib/confettiUtils", () => ({
  triggerTaskCompletedConfetti: vi.fn(),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("OnboardingModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    safeLocalStorage.clear();
  });

  it("renders the first step when opened", () => {
    render(<OnboardingModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Your Creative Direction Studio")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Skip Tour")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("navigates forward through steps with Next button and back with Back button", () => {
    render(<OnboardingModal open={true} onOpenChange={() => {}} />);

    // Step 1
    expect(screen.getByText("Your Creative Direction Studio")).toBeInTheDocument();

    // Click Next -> Step 2
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(ONBOARDING_STEPS[1].title)).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();

    // Click Next -> Step 3
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(ONBOARDING_STEPS[2].title)).toBeInTheDocument();
    expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();

    // Click Next -> Step 4 (Last step)
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(ONBOARDING_STEPS[3].title)).toBeInTheDocument();
    expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();

    // Click Back -> Step 3
    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByText(ONBOARDING_STEPS[2].title)).toBeInTheDocument();
  });

  it("completes walkthrough, marks storage, triggers confetti, and closes modal", () => {
    const handleOpenChange = vi.fn();
    const handleComplete = vi.fn();

    render(
      <OnboardingModal
        open={true}
        onOpenChange={handleOpenChange}
        onComplete={handleComplete}
      />
    );

    // Skip directly from Step 1
    fireEvent.click(screen.getByText("Skip Tour"));

    expect(safeLocalStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe("true");
    expect(confettiUtils.triggerTaskCompletedConfetti).toHaveBeenCalled();
    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(handleComplete).toHaveBeenCalled();
  });

  it("navigates via step indicator dot buttons", () => {
    render(<OnboardingModal open={true} onOpenChange={() => {}} />);

    // Click 3rd dot button
    const step3Button = screen.getByLabelText("Go to step 3");
    fireEvent.click(step3Button);

    expect(screen.getByText(ONBOARDING_STEPS[2].title)).toBeInTheDocument();
    expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
  });
});
