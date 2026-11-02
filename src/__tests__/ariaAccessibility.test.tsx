import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { TopNav } from "@/components/TopNav";
import { TagsInput } from "@/components/TagsInput";
import { CanvasConnectionLine } from "@/components/canvas/CanvasConnectionLine";
import { CanvasNodeCard } from "@/components/canvas/CanvasNodeCard";

vi.mock("@/store/useAppStore", () => ({
  useAppStore: () => ({
    theme: "light",
    setTheme: vi.fn(),
    setCommandPaletteOpen: vi.fn(),
  }),
}));

describe("ARIA Accessibility Attributes Verification", () => {
  it("renders accessible names on TopNav action buttons", () => {
    render(<TopNav />);

    const themeButton = screen.getByRole("button", { name: "Toggle light and dark theme" });
    expect(themeButton).toBeDefined();

    const notificationsButton = screen.getByRole("button", { name: "Notifications" });
    expect(notificationsButton).toBeDefined();

    const searchButton = screen.getByRole("button", { name: "Open command palette" });
    expect(searchButton).toBeDefined();
  });

  it("renders accessible tag removal buttons and input in TagsInput", () => {
    render(<TagsInput tags={["Branding", "UI"]} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Remove tag Branding" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Remove tag UI" })).toBeDefined();
    expect(screen.getByRole("textbox", { name: "Add new tag" })).toBeDefined();
  });

  it("renders accessible action buttons in CanvasNodeCard", () => {
    const node = {
      id: "node-1",
      x: 100,
      y: 100,
      title: "Design System",
      content: "Color tokens and typography scales",
    };

    render(<CanvasNodeCard node={node} zoom={1} />);

    expect(screen.getByRole("button", { name: "Connect to another node" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Change color theme" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete node" })).toBeDefined();
  });

  it("renders accessible delete action on CanvasConnectionLine", () => {
    const conn = {
      id: 1,
      fromNodeId: "node-1",
      toNodeId: "node-2",
    };
    const fromNode = { id: "node-1", x: 10, y: 10, title: "From", content: "" };
    const toNode = { id: "node-2", x: 200, y: 200, title: "To", content: "" };

    const { container } = render(
      <svg>
        <CanvasConnectionLine connection={conn} fromNode={fromNode} toNode={toNode} />
      </svg>
    );

    const deleteBtn = container.querySelector('button[aria-label="Delete connection line"]');
    expect(deleteBtn).toBeDefined();
  });
});
