import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { TopLoadingBar, topLoadingBar } from "../TopLoadingBar";

describe("TopLoadingBar Component", () => {
  it("renders progressbar element with accessibility role", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]}>
        <TopLoadingBar />
      </MemoryRouter>
    );

    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-label", "Navigation progress indicator");
    expect(bar.className).toContain("fixed top-0");
    expect(bar.className).toContain("h-[2px]");
  });

  it("responds to manual programmatic start and complete triggers", () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <TopLoadingBar />
      </MemoryRouter>
    );

    // Fast-forward initial auto-trigger
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Trigger start
    act(() => {
      topLoadingBar.start();
    });

    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();

    // Trigger complete
    act(() => {
      topLoadingBar.complete();
      vi.advanceTimersByTime(100);
    });

    expect(bar).toHaveAttribute("aria-valuenow", "100");

    vi.useRealTimers();
  });
});
