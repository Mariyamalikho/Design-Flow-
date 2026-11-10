import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Skeleton } from "../Skeleton";

describe("Skeleton Component", () => {
  it("renders with editorial shimmer class and default rounded-md style", () => {
    render(<Skeleton data-testid="test-skeleton" className="h-6 w-32" />);

    const el = screen.getByTestId("test-skeleton");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("skeleton-editorial");
    expect(el.className).toContain("rounded-md");
    expect(el.className).toContain("h-6");
    expect(el.className).toContain("w-32");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("supports text and circular variants", () => {
    const { rerender } = render(
      <Skeleton data-testid="variant-skeleton" variant="text" />
    );
    let el = screen.getByTestId("variant-skeleton");
    expect(el.className).toContain("rounded");
    expect(el.className).toContain("h-4");

    rerender(<Skeleton data-testid="variant-skeleton" variant="circular" />);
    el = screen.getByTestId("variant-skeleton");
    expect(el.className).toContain("rounded-full");
  });
});
