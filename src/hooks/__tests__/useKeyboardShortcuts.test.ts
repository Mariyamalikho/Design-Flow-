import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useKeyboardShortcuts,
  useCommandPaletteShortcut,
  isEditableElement,
} from "../useKeyboardShortcuts";
import { useAppStore } from "@/store/useAppStore";

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    useAppStore.setState({ isCommandPaletteOpen: false });
    vi.clearAllMocks();
  });

  describe("isEditableElement", () => {
    it("identifies input, textarea, and contenteditable elements", () => {
      const input = document.createElement("input");
      const textarea = document.createElement("textarea");
      const divEditable = document.createElement("div");
      divEditable.contentEditable = "true";
      const regularDiv = document.createElement("div");

      expect(isEditableElement(input)).toBe(true);
      expect(isEditableElement(textarea)).toBe(true);
      expect(isEditableElement(divEditable)).toBe(true);
      expect(isEditableElement(regularDiv)).toBe(false);
      expect(isEditableElement(null)).toBe(false);
    });
  });

  it("toggles command palette when Cmd+K or Ctrl+K is pressed", () => {
    renderHook(() => useKeyboardShortcuts());

    expect(useAppStore.getState().isCommandPaletteOpen).toBe(false);

    // Simulate Cmd+K (Mac)
    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(useAppStore.getState().isCommandPaletteOpen).toBe(true);

    // Simulate Ctrl+K (Windows/Linux)
    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(useAppStore.getState().isCommandPaletteOpen).toBe(false);
  });

  it("invokes custom shortcut actions when matched", () => {
    const handleAction = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: "p",
            metaOrCtrl: true,
            shift: true,
            action: handleAction,
          },
        ],
      })
    );

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "p",
        metaKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("ignores single-key shortcuts when user is typing in an input element", () => {
    const handleAction = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          {
            key: "/",
            action: handleAction,
          },
        ],
      })
    );

    const input = document.createElement("input");
    document.body.appendChild(input);

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "/",
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(event);
    });

    expect(handleAction).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("allows modifier shortcuts (like Cmd+K) even inside input elements", () => {
    renderHook(() => useKeyboardShortcuts());

    const input = document.createElement("input");
    document.body.appendChild(input);

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(event);
    });

    expect(useAppStore.getState().isCommandPaletteOpen).toBe(true);
    document.body.removeChild(input);
  });

  it("does not fire shortcuts when enabled is false", () => {
    const handleAction = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        enabled: false,
        shortcuts: [
          {
            key: "k",
            metaOrCtrl: true,
            action: handleAction,
          },
        ],
      })
    );

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(handleAction).not.toHaveBeenCalled();
    expect(useAppStore.getState().isCommandPaletteOpen).toBe(false);
  });

  it("works with useCommandPaletteShortcut helper callback", () => {
    const customToggle = vi.fn();
    renderHook(() => useCommandPaletteShortcut(customToggle));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(customToggle).toHaveBeenCalledTimes(1);
  });
});
