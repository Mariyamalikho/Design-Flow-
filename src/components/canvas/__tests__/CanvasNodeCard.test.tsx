import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  CanvasNodeCard,
  type CanvasNodeData,
} from "../CanvasNodeCard";

describe("CanvasNodeCard", () => {
  const sampleNode: CanvasNodeData = {
    id: "node-101",
    x: 100,
    y: 150,
    title: "Typography Hierarchy",
    content: "Define display headlines, body serif, and monospace accents.",
    color: "purple",
  };

  it("renders node title and content", () => {
    render(<CanvasNodeCard node={sampleNode} zoom={1} />);

    expect(screen.getByText("Typography Hierarchy")).toBeDefined();
    expect(
      screen.getByText(
        "Define display headlines, body serif, and monospace accents."
      )
    ).toBeDefined();
  });

  it("calls onSelect when pointer down on node", () => {
    const handleSelect = vi.fn();
    render(
      <CanvasNodeCard
        node={sampleNode}
        zoom={1}
        onSelect={handleSelect}
      />
    );

    const card = screen.getByTestId("canvas-node-node-101");
    fireEvent.pointerDown(card, { clientX: 100, clientY: 150, button: 0 });

    expect(handleSelect).toHaveBeenCalledWith("node-101");
  });

  it("computes zoom-adjusted drag coordinates and calls onMove", () => {
    const handleMove = vi.fn();
    // At zoom = 2, moving pointer by 40px in screen space should move node by 20px in canvas space!
    render(
      <CanvasNodeCard
        node={sampleNode}
        zoom={2}
        onMove={handleMove}
      />
    );

    const card = screen.getByTestId("canvas-node-node-101");

    fireEvent.pointerDown(card, {
      clientX: 200,
      clientY: 300,
      button: 0,
    });

    fireEvent.pointerMove(card, {
      clientX: 240, // dx = 40 screen px / 2 = 20 canvas px -> 100 + 20 = 120
      clientY: 360, // dy = 60 screen px / 2 = 30 canvas px -> 150 + 30 = 180
    });

    expect(handleMove).toHaveBeenCalledWith("node-101", 120, 180);

    fireEvent.pointerUp(card);
  });

  it("triggers onDelete when delete button is clicked", () => {
    const handleDelete = vi.fn();
    render(
      <CanvasNodeCard
        node={sampleNode}
        zoom={1}
        onDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByTitle("Delete node");
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith("node-101");
  });

  it("allows renaming title on double click and blur", () => {
    const handleUpdate = vi.fn();
    render(
      <CanvasNodeCard
        node={sampleNode}
        zoom={1}
        onUpdate={handleUpdate}
      />
    );

    const titleEl = screen.getByText("Typography Hierarchy");
    fireEvent.doubleClick(titleEl);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated Typography Scale" } });
    fireEvent.blur(input);

    expect(handleUpdate).toHaveBeenCalledWith("node-101", {
      title: "Updated Typography Scale",
    });
  });
});
