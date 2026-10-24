import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { EditorToolbar } from "../EditorToolbar";
import type { Editor } from "@tiptap/react";

const createMockEditor = (activeMarks: string[] = []): Editor => {
  const chainMock = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleCode: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    toggleBlockquote: vi.fn().mockReturnThis(),
    toggleCodeBlock: vi.fn().mockReturnThis(),
    setHorizontalRule: vi.fn().mockReturnThis(),
    undo: vi.fn().mockReturnThis(),
    redo: vi.fn().mockReturnThis(),
    unsetAllMarks: vi.fn().mockReturnThis(),
    clearNodes: vi.fn().mockReturnThis(),
    run: vi.fn().mockReturnValue(true),
  };

  const editor = {
    chain: vi.fn().mockReturnValue(chainMock),
    can: vi.fn().mockReturnValue({
      undo: vi.fn().mockReturnValue(true),
      redo: vi.fn().mockReturnValue(true),
    }),
    isActive: vi.fn().mockImplementation((name: string, attrs?: any) => {
      if (attrs?.level) {
        return activeMarks.includes(`${name}-${attrs.level}`);
      }
      return activeMarks.includes(name);
    }),
  } as unknown as Editor;

  return editor;
};

describe("EditorToolbar", () => {
  it("renders loading placeholder if editor is null", () => {
    render(<EditorToolbar editor={null} />);
    expect(screen.getByText("Loading toolbar...")).toBeDefined();
  });

  it("renders all rich text formatting buttons", () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor} />);

    expect(screen.getByLabelText("Bold")).toBeDefined();
    expect(screen.getByLabelText("Italic")).toBeDefined();
    expect(screen.getByLabelText("Heading 1")).toBeDefined();
    expect(screen.getByLabelText("Heading 2")).toBeDefined();
    expect(screen.getByLabelText("Heading 3")).toBeDefined();
    expect(screen.getByLabelText("Bullet List")).toBeDefined();
    expect(screen.getByLabelText("Numbered List")).toBeDefined();
    expect(screen.getByLabelText("Blockquote")).toBeDefined();
    expect(screen.getByLabelText("Code Block")).toBeDefined();
    expect(screen.getByLabelText("Undo")).toBeDefined();
    expect(screen.getByLabelText("Redo")).toBeDefined();
  });

  it("triggers toggleBold command on Bold button click", () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor} />);

    fireEvent.click(screen.getByLabelText("Bold"));
    const chain = mockEditor.chain();
    expect(chain.toggleBold).toHaveBeenCalledTimes(1);
    expect(chain.run).toHaveBeenCalled();
  });

  it("triggers toggleItalic command on Italic button click", () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor} />);

    fireEvent.click(screen.getByLabelText("Italic"));
    const chain = mockEditor.chain();
    expect(chain.toggleItalic).toHaveBeenCalledTimes(1);
    expect(chain.run).toHaveBeenCalled();
  });

  it("triggers toggleHeading level 1 on Heading 1 click", () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor} />);

    fireEvent.click(screen.getByLabelText("Heading 1"));
    const chain = mockEditor.chain();
    expect(chain.toggleHeading).toHaveBeenCalledWith({ level: 1 });
  });

  it("triggers toggleBulletList and toggleOrderedList on list button clicks", () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor} />);

    fireEvent.click(screen.getByLabelText("Bullet List"));
    expect(mockEditor.chain().toggleBulletList).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText("Numbered List"));
    expect(mockEditor.chain().toggleOrderedList).toHaveBeenCalledTimes(1);
  });

  it("triggers toggleBlockquote on Blockquote click", () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor} />);

    fireEvent.click(screen.getByLabelText("Blockquote"));
    expect(mockEditor.chain().toggleBlockquote).toHaveBeenCalledTimes(1);
  });

  it("triggers undo and redo on respective button clicks", () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor} />);

    fireEvent.click(screen.getByLabelText("Undo"));
    expect(mockEditor.chain().undo).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText("Redo"));
    expect(mockEditor.chain().redo).toHaveBeenCalledTimes(1);
  });

  it("indicates active state with aria-pressed on active buttons", () => {
    const mockEditor = createMockEditor(["bold", "bulletList"]);
    render(<EditorToolbar editor={mockEditor} />);

    const boldBtn = screen.getByLabelText("Bold");
    expect(boldBtn.getAttribute("aria-pressed")).toBe("true");

    const italicBtn = screen.getByLabelText("Italic");
    expect(italicBtn.getAttribute("aria-pressed")).toBe("false");

    const bulletBtn = screen.getByLabelText("Bullet List");
    expect(bulletBtn.getAttribute("aria-pressed")).toBe("true");
  });
});
