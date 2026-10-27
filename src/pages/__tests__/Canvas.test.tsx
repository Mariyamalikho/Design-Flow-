import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Canvas from "../Canvas";

describe("Canvas Page", () => {
  const renderCanvas = (route = "/canvas") => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/canvas/:id" element={<Canvas />} />
          <Route path="/notes" element={<div>Notes Page Destination</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders Brainstorm Canvas header and freeform workspace", () => {
    renderCanvas();

    expect(screen.getByRole("heading", { name: "Brainstorm Canvas" })).toBeDefined();
    expect(screen.getByText("Infinite Workspace")).toBeDefined();
    expect(screen.getByTestId("canvas-viewport")).toBeDefined();
    expect(screen.getByTestId("canvas-plane")).toBeDefined();
  });

  it("renders initial starter idea nodes", () => {
    renderCanvas();

    expect(screen.getByText("🎨 Design System Architecture")).toBeDefined();
    expect(screen.getByText("⚡ Interactive Flowchart")).toBeDefined();
    expect(screen.getByText("💡 Brainstorming Prompts")).toBeDefined();
  });

  it("switches active tool between Select and Pan", () => {
    renderCanvas();

    const selectBtn = screen.getByRole("button", { name: /select/i });
    const panBtn = screen.getByRole("button", { name: /pan/i });

    expect(selectBtn).toBeDefined();
    expect(panBtn).toBeDefined();

    fireEvent.click(panBtn);
    expect(screen.getByTestId("canvas-viewport").className).toContain("cursor-grab");

    fireEvent.click(selectBtn);
    expect(screen.getByTestId("canvas-viewport").className).toContain("cursor-default");
  });

  it("adds new idea nodes when clicking Add Idea button", () => {
    renderCanvas();

    const addBtn = screen.getByRole("button", { name: /add idea/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("💡 Idea Node #4")).toBeDefined();
  });

  it("resets pan coordinates and zoom level when Reset View is clicked", () => {
    renderCanvas();

    const zoomInBtn = screen.getByTitle("Zoom in (+)");
    fireEvent.click(zoomInBtn);

    expect(screen.getByTestId("canvas-zoom-indicator").textContent).toBe("110%");

    const resetBtn = screen.getByRole("button", { name: /reset view/i });
    fireEvent.click(resetBtn);

    expect(screen.getByTestId("canvas-zoom-indicator").textContent).toBe("100%");
    expect(screen.getByTestId("canvas-pan-coordinates").textContent).toBe("X: 0 Y: 0");
  });
});
