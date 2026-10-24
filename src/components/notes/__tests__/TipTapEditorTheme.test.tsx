import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { TipTapEditor } from "../TipTapEditor";

describe("TipTapEditor Theme & Typography Styling", () => {
  it("renders with theme container class and attributes", () => {
    const { container } = render(
      <TipTapEditor
        content="<h1>Brand Styleguide</h1><p>Notes on theme</p><blockquote>Inspiring quote</blockquote>"
        placeholder="Custom placeholder..."
      />
    );

    const wrapper = screen.getByTestId("tiptap-editor");
    expect(wrapper).toBeDefined();
    expect(wrapper.className).toContain("tiptap-editor-wrapper");

    // Check ProseMirror element
    const prosemirror = container.querySelector(".ProseMirror");
    expect(prosemirror).not.toBeNull();
    expect(prosemirror?.className).toContain("focus:outline-none");
    expect(prosemirror?.className).toContain("prose");
    expect(prosemirror?.className).toContain("dark:prose-invert");
  });

  it("renders headings, paragraphs, and blockquote styled elements correctly", () => {
    const { container } = render(
      <TipTapEditor
        content="<h1>Heading One</h1><h2>Heading Two</h2><p>Body paragraph</p><blockquote>Theme quote</blockquote>"
      />
    );

    expect(screen.getByText("Heading One")).toBeDefined();
    expect(screen.getByText("Heading Two")).toBeDefined();
    expect(screen.getByText("Body paragraph")).toBeDefined();
    expect(screen.getByText("Theme quote")).toBeDefined();

    const h1 = container.querySelector("h1");
    expect(h1).not.toBeNull();
    const blockquote = container.querySelector("blockquote");
    expect(blockquote).not.toBeNull();
  });
});
