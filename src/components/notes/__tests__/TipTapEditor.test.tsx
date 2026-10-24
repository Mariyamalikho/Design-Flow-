import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { TipTapEditor } from "../TipTapEditor";
import type { Editor } from "@tiptap/react";

describe("TipTapEditor", () => {
  it("renders editor container with initial content", () => {
    const initialContent = "<p>Initial design system brainstorm</p>";
    render(<TipTapEditor content={initialContent} />);

    expect(screen.getByTestId("tiptap-editor")).toBeDefined();
    expect(
      screen.getByText("Initial design system brainstorm")
    ).toBeDefined();
  });

  it("calls onEditorReady with the editor instance", () => {
    const onReady = vi.fn();
    render(
      <TipTapEditor
        content="<p>Test ready</p>"
        onEditorReady={onReady}
      />
    );

    expect(onReady).toHaveBeenCalled();
    const editor = onReady.mock.calls[0][0] as Editor;
    expect(editor).toBeDefined();
    expect(editor.getText()).toContain("Test ready");
  });

  it("handles updates and triggers onChange callback", () => {
    const handleChange = vi.fn();
    let editorInstance: Editor | null = null;

    render(
      <TipTapEditor
        content="<p>Hello world</p>"
        onChange={handleChange}
        onEditorReady={(ed) => {
          editorInstance = ed;
        }}
      />
    );

    expect(editorInstance).not.toBeNull();

    act(() => {
      editorInstance?.commands.setContent("<p>Updated note content</p>");
    });

    expect(handleChange).toHaveBeenCalledWith(
      expect.stringContaining("Updated note content")
    );
  });

  it("updates editable mode when prop changes", () => {
    let editorInstance: Editor | null = null;
    const { rerender } = render(
      <TipTapEditor
        content="<p>Editable test</p>"
        editable={true}
        onEditorReady={(ed) => {
          editorInstance = ed;
        }}
      />
    );

    expect(editorInstance?.isEditable).toBe(true);

    rerender(
      <TipTapEditor
        content="<p>Editable test</p>"
        editable={false}
        onEditorReady={(ed) => {
          editorInstance = ed;
        }}
      />
    );

    expect(editorInstance?.isEditable).toBe(false);
  });
});
