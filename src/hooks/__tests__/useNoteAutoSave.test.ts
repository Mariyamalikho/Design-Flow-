import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNoteAutoSave } from "../useNoteAutoSave";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    notes: {
      update: vi.fn().mockResolvedValue(1),
    },
  },
}));

describe("useNoteAutoSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with idle status", () => {
    const { result } = renderHook(() =>
      useNoteAutoSave({ noteId: 1, debounceMs: 500 })
    );

    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.lastSaved).toBeNull();
  });

  it("sets status to unsaved and debounces save to IndexedDB", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(() =>
      useNoteAutoSave({ noteId: 1, debounceMs: 500, onSaved })
    );

    act(() => {
      result.current.queueUpdate({ title: "Debounced Title" });
    });

    expect(result.current.saveStatus).toBe("unsaved");
    expect(db.notes.update).not.toHaveBeenCalled();

    // Fast-forward 200ms (not yet debounced)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(db.notes.update).not.toHaveBeenCalled();

    // Fast-forward remaining 300ms
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(db.notes.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        title: "Debounced Title",
      })
    );
    expect(result.current.saveStatus).toBe("saved");
    expect(onSaved).toHaveBeenCalled();
  });

  it("immediately saves on flushSave without waiting for debounce timer", async () => {
    const { result } = renderHook(() =>
      useNoteAutoSave({ noteId: 2, debounceMs: 1000 })
    );

    act(() => {
      result.current.queueUpdate({ content: "<p>Important notes</p>" });
    });

    expect(db.notes.update).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.flushSave();
    });

    expect(db.notes.update).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        content: "<p>Important notes</p>",
      })
    );
    expect(result.current.saveStatus).toBe("saved");
  });

  it("flushes save on Ctrl+S keyboard shortcut", async () => {
    const { result } = renderHook(() =>
      useNoteAutoSave({ noteId: 3, debounceMs: 1000 })
    );

    act(() => {
      result.current.queueUpdate({ title: "Quick Save" });
    });

    // Simulate Ctrl+S
    await act(async () => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(db.notes.update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        title: "Quick Save",
      })
    );
  });
});
