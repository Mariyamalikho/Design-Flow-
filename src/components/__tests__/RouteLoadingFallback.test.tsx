import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RouteLoadingFallback } from "../RouteLoadingFallback";

describe("RouteLoadingFallback", () => {
  it("renders loading spinner and indicator text", () => {
    render(<RouteLoadingFallback />);

    expect(screen.getByTestId("route-loading-fallback")).toBeDefined();
    expect(screen.getByText("Loading workspace...")).toBeDefined();
  });
});
