import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MarkdownShortcutsModal } from "../MarkdownShortcutsModal";

describe("MarkdownShortcutsModal", () => {
  it("renders modal content when open", () => {
    const handleOpenChange = vi.fn();
    render(
      <MarkdownShortcutsModal open={true} onOpenChange={handleOpenChange} />
    );

    expect(
      screen.getByText("Markdown & Editor Shortcuts")
    ).toBeDefined();
    expect(
      screen.getByText("Headings & Structure")
    ).toBeDefined();
    expect(
      screen.getByText("Inline Formatting")
    ).toBeDefined();
    expect(
      screen.getByText("Lists & Quotations")
    ).toBeDefined();

    // Verify key shortcut syntax items are displayed
    expect(screen.getByText("# Space")).toBeDefined();
    expect(screen.getByText("## Space")).toBeDefined();
    expect(screen.getByText("**text**")).toBeDefined();
    expect(screen.getByText("- Space")).toBeDefined();
    expect(screen.getByText("> Space")).toBeDefined();
  });

  it("does not render modal contents when closed", () => {
    render(
      <MarkdownShortcutsModal open={false} onOpenChange={vi.fn()} />
    );

    expect(screen.queryByText("Markdown & Editor Shortcuts")).toBeNull();
  });
});
