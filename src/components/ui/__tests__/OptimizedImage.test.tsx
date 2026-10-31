import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { OptimizedImage } from "../OptimizedImage";

describe("OptimizedImage Component", () => {
  it("renders image with lazy loading and async decoding defaults", () => {
    render(<OptimizedImage src="/test-asset.png" alt="Test Asset" />);

    const img = screen.getByRole("img", { name: "Test Asset" });
    expect(img).toBeDefined();
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("decoding")).toBe("async");
    expect(img.getAttribute("src")).toBe("/test-asset.png");
  });

  it("shows loading skeleton placeholder before image load finishes", () => {
    render(<OptimizedImage src="/placeholder.png" alt="Placeholder" />);

    const skeleton = screen.getByTestId("optimized-image-skeleton");
    expect(skeleton).toBeDefined();

    const img = screen.getByRole("img", { name: "Placeholder" });
    expect(img.className).toContain("opacity-0");

    // Simulate load event
    fireEvent.load(img);

    expect(screen.queryByTestId("optimized-image-skeleton")).toBeNull();
    expect(img.className).toContain("opacity-100");
  });

  it("renders fallback UI when image fails to load", () => {
    render(
      <OptimizedImage
        src="/broken-image.png"
        alt="Broken"
        fallback={<span data-testid="custom-fallback">Image unavailable</span>}
      />
    );

    const img = screen.getByRole("img", { name: "Broken" });
    fireEvent.error(img);

    expect(screen.getByTestId("optimized-image-error")).toBeDefined();
    expect(screen.getByTestId("custom-fallback")).toBeDefined();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("allows overriding loading attribute to eager for above-the-fold heroes", () => {
    render(<OptimizedImage src="/hero.png" alt="Hero" loading="eager" decoding="sync" />);

    const img = screen.getByRole("img", { name: "Hero" });
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("decoding")).toBe("sync");
  });
});
