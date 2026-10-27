import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Canvas from "../Canvas";
import { db, type CanvasNodeItem, type CanvasConnectionItem } from "@/lib/db";

const { mockCanvasNodes, mockCanvasConnections } = vi.hoisted(() => {
  const mockCanvasNodes: CanvasNodeItem[] = [
    {
      id: 1,
      x: 120,
      y: 100,
      title: "🎨 Design System Architecture",
      content: "Establish primary design tokens, typography scales, and zinc/indigo dark mode palettes.",
      color: "indigo",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      x: 480,
      y: 160,
      title: "⚡ Interactive Flowchart",
      content: "Connect user onboarding journey to the visual brief wizard and live dashboard metrics.",
      color: "amber",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      x: 240,
      y: 380,
      title: "💡 Brainstorming Prompts",
      content: "Freeform visual node layout for rapid sketching, moodboard curation, and wireframes.",
      color: "purple",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockCanvasConnections: CanvasConnectionItem[] = [
    {
      id: 10,
      fromNodeId: 1,
      toNodeId: 2,
      label: "Architecture Flow",
      createdAt: new Date(),
    },
  ];

  return { mockCanvasNodes, mockCanvasConnections };
});

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (querier: () => unknown) => {
    const fnStr = querier.toString();
    if (fnStr.includes("canvasConnections")) {
      return mockCanvasConnections;
    }
    return mockCanvasNodes;
  },
}));

vi.mock("@/lib/db", () => {
  const mockWhereClause = {
    equals: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue([]),
  };

  return {
    db: {
      canvasNodes: {
        toArray: vi.fn().mockResolvedValue(mockCanvasNodes),
        count: vi.fn().mockResolvedValue(mockCanvasNodes.length),
        bulkAdd: vi.fn().mockResolvedValue([1, 2, 3]),
        add: vi.fn().mockResolvedValue(4),
        update: vi.fn().mockResolvedValue(1),
        delete: vi.fn().mockResolvedValue(1),
      },
      canvasConnections: {
        toArray: vi.fn().mockResolvedValue(mockCanvasConnections),
        count: vi.fn().mockResolvedValue(mockCanvasConnections.length),
        bulkAdd: vi.fn().mockResolvedValue([10]),
        add: vi.fn().mockResolvedValue(11),
        update: vi.fn().mockResolvedValue(1),
        delete: vi.fn().mockResolvedValue(1),
        where: vi.fn().mockReturnValue(mockWhereClause),
      },
    },
  };
});

describe("Canvas Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("renders SVG connection lines layer between nodes", () => {
    renderCanvas();

    expect(screen.getByTestId("canvas-connections-svg")).toBeDefined();
    expect(screen.getByTestId("canvas-connection-10")).toBeDefined();
    expect(screen.getByText("Architecture Flow")).toBeDefined();
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

  it("adds new idea nodes to database when clicking Add Idea button", async () => {
    renderCanvas();

    const addBtn = screen.getByRole("button", { name: /add idea/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(db.canvasNodes.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("Idea Node #"),
          color: expect.any(String),
        })
      );
    });
  });

  it("deletes idea node and cleans up related connections from database", async () => {
    renderCanvas();

    const nodeCard = screen.getByTestId("canvas-node-1");
    expect(nodeCard).toBeDefined();

    const deleteBtns = screen.getAllByTitle("Delete node");
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(db.canvasNodes.delete).toHaveBeenCalledWith(1);
      expect(db.canvasConnections.where).toHaveBeenCalledWith("fromNodeId");
    });
  });

  it("deletes a connection when delete connection button is clicked", async () => {
    renderCanvas();

    const deleteConnBtn = screen.getByTestId("delete-connection-10");
    fireEvent.click(deleteConnBtn);

    await waitFor(() => {
      expect(db.canvasConnections.delete).toHaveBeenCalledWith(10);
    });
  });

  it("connects two nodes when clicking connect icon and selecting target node", async () => {
    renderCanvas();

    const connectBtns = screen.getAllByTitle("Connect to another node");
    // Click connect on node 1
    fireEvent.click(connectBtns[0]);

    // Click on node 3
    const targetNode = screen.getByTestId("canvas-node-3");
    fireEvent.pointerDown(targetNode);

    await waitFor(() => {
      expect(db.canvasConnections.add).toHaveBeenCalledWith(
        expect.objectContaining({
          fromNodeId: 1,
          toNodeId: 3,
        })
      );
    });
  });

  it("syncs node position to database when node drag ends", async () => {
    renderCanvas();

    const nodeCard = screen.getByTestId("canvas-node-1");

    fireEvent.pointerDown(nodeCard, {
      clientX: 120,
      clientY: 100,
      button: 0,
    });

    fireEvent.pointerMove(nodeCard, {
      clientX: 200,
      clientY: 180,
    });

    fireEvent.pointerUp(nodeCard);

    await waitFor(() => {
      expect(db.canvasNodes.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          x: 200,
          y: 180,
        })
      );
    });
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

  it("updates canvas plane transform and coordinates during panning drag", () => {
    renderCanvas();

    const panBtn = screen.getByRole("button", { name: /pan/i });
    fireEvent.click(panBtn);

    const viewport = screen.getByTestId("canvas-viewport");
    const plane = screen.getByTestId("canvas-plane");

    fireEvent.pointerDown(viewport, {
      button: 0,
      clientX: 200,
      clientY: 200,
    });

    fireEvent.pointerMove(viewport, {
      clientX: 260,
      clientY: 310,
    });

    expect(screen.getByTestId("canvas-pan-coordinates").textContent).toBe("X: 60 Y: 110");
    expect(plane.style.transform).toContain("translate3d(60px, 110px, 0px)");

    fireEvent.pointerUp(viewport);
  });

  it("zooms on wheel event and updates scale in plane transform", () => {
    renderCanvas();

    const viewport = screen.getByTestId("canvas-viewport");
    const plane = screen.getByTestId("canvas-plane");

    fireEvent.wheel(viewport, {
      deltaY: -100,
      clientX: 300,
      clientY: 300,
    });

    expect(plane.style.transform).toMatch(/scale\(1\.\d+\)/);
  });

  it("renders dot grid background and origin indicator on canvas plane", () => {
    renderCanvas();

    const viewport = screen.getByTestId("canvas-viewport");
    expect(viewport.style.backgroundImage).toContain("radial-gradient");
    expect(screen.getByTestId("canvas-origin-indicator")).toBeDefined();
  });

  it("cycles grid mode between dots, lines, and none when grid toggle is clicked", () => {
    renderCanvas();

    const viewport = screen.getByTestId("canvas-viewport");
    const gridToggle = screen.getByTestId("canvas-grid-toggle");

    expect(viewport.style.backgroundImage).toContain("radial-gradient");

    // Click to cycle to lines
    fireEvent.click(gridToggle);
    expect(viewport.style.backgroundImage).toContain("linear-gradient");

    // Click to cycle to none
    fireEvent.click(gridToggle);
    expect(viewport.style.backgroundImage).toBe("");

    // Click to cycle back to dots
    fireEvent.click(gridToggle);
    expect(viewport.style.backgroundImage).toContain("radial-gradient");
  });
});
