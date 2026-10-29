import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  CanvasConnectionLine,
  computeConnectionPath,
  type CanvasConnectionLineProps,
} from "../CanvasConnectionLine";
import type { CanvasConnectionItem } from "@/lib/db";

describe("CanvasConnectionLine", () => {
  const sampleConnection: CanvasConnectionItem = {
    id: 42,
    fromNodeId: 1,
    toNodeId: 2,
    label: "Dependencies",
    color: "#6366f1",
    style: "dashed",
    createdAt: new Date(),
  };

  describe("computeConnectionPath", () => {
    it("computes horizontal right docking when target is to the right", () => {
      const from = { x: 100, y: 100, width: 288, height: 120 };
      const to = { x: 500, y: 100, width: 288, height: 120 };

      const result = computeConnectionPath(from, to);

      // start should be right edge of 'from': 100 + 288 = 388, y = 100 + 60 = 160
      expect(result.startX).toBe(388);
      expect(result.startY).toBe(160);
      // end should be left edge of 'to': 500, y = 100 + 60 = 160
      expect(result.endX).toBe(500);
      expect(result.endY).toBe(160);
      expect(result.midX).toBe((388 + 500) / 2);
      expect(result.midY).toBe(160);
      expect(result.pathData).toContain("M 388 160 C");
    });

    it("computes horizontal left docking when target is to the left", () => {
      const from = { x: 500, y: 100, width: 288, height: 120 };
      const to = { x: 100, y: 100, width: 288, height: 120 };

      const result = computeConnectionPath(from, to);

      // start should be left edge of 'from': 500, y = 160
      expect(result.startX).toBe(500);
      expect(result.startY).toBe(160);
      // end should be right edge of 'to': 100 + 288 = 388, y = 160
      expect(result.endX).toBe(388);
      expect(result.endY).toBe(160);
    });

    it("computes vertical docking when horizontally overlapping", () => {
      const from = { x: 100, y: 100, width: 288, height: 120 };
      const to = { x: 150, y: 400, width: 288, height: 120 };

      const result = computeConnectionPath(from, to);

      // start should be bottom center of 'from': 100 + 144 = 244, y = 100 + 120 = 220
      expect(result.startX).toBe(244);
      expect(result.startY).toBe(220);
      // end should be top center of 'to': 150 + 144 = 294, y = 400
      expect(result.endX).toBe(294);
      expect(result.endY).toBe(400);
    });
  });

  describe("CanvasConnectionLine component", () => {
    it("returns null if fromNode or toNode is missing", () => {
      const { container } = render(
        <svg>
          <CanvasConnectionLine
            connection={sampleConnection}
            fromNode={undefined}
            toNode={{ x: 200, y: 200 }}
          />
        </svg>
      );
      expect(container.querySelector("g")).toBeNull();
    });

    it("renders SVG paths, connection label, and delete action", () => {
      const handleDelete = vi.fn();
      render(
        <svg>
          <CanvasConnectionLine
            connection={sampleConnection}
            fromNode={{ x: 100, y: 100 }}
            toNode={{ x: 500, y: 100 }}
            onDelete={handleDelete}
          />
        </svg>
      );

      const group = screen.getByTestId("canvas-connection-42");
      expect(group).toBeDefined();

      // Check label
      expect(screen.getByText("Dependencies")).toBeDefined();

      // Check delete button
      const deleteBtn = screen.getByTestId("delete-connection-42");
      expect(deleteBtn).toBeDefined();

      fireEvent.click(deleteBtn);
      expect(handleDelete).toHaveBeenCalledWith(42);
    });

    it("applies dashed stroke style when style is dashed", () => {
      render(
        <svg>
          <CanvasConnectionLine
            connection={sampleConnection}
            fromNode={{ x: 100, y: 100 }}
            toNode={{ x: 500, y: 100 }}
          />
        </svg>
      );

      const group = screen.getByTestId("canvas-connection-42");
      const connectorPath = group.querySelector("path[stroke-dasharray='6 5']");
      expect(connectorPath).not.toBeNull();
    });
  });
});
