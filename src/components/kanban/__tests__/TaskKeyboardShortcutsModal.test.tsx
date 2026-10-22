import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TaskKeyboardShortcutsModal } from "../TaskKeyboardShortcutsModal";

describe("TaskKeyboardShortcutsModal", () => {
  it("renders keyboard shortcuts dialog when open", () => {
    const handleOpenChange = vi.fn();
    render(<TaskKeyboardShortcutsModal open={true} onOpenChange={handleOpenChange} />);

    expect(screen.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeDefined();
    expect(screen.getByText("Global Navigation")).toBeDefined();
    expect(screen.getByText("Focused Task Card (Tab or Click to Focus)")).toBeDefined();
    expect(screen.getByText("Create new task")).toBeDefined();
    expect(screen.getByText("Quick search tasks")).toBeDefined();
  });

  it("does not render dialog content when closed", () => {
    render(<TaskKeyboardShortcutsModal open={false} onOpenChange={vi.fn()} />);

    expect(screen.queryByRole("heading", { name: "Keyboard Shortcuts" })).toBeNull();
  });
});
