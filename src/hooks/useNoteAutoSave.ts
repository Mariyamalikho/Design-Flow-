import { useState, useEffect, useRef, useCallback } from "react";
import { db, type Note } from "@/lib/db";
import { toast } from "sonner";

export type SaveStatus = "idle" | "saving" | "saved" | "unsaved";

export interface UseNoteAutoSaveOptions {
  noteId: number | null | undefined;
  debounceMs?: number;
  onSaved?: (updatedAt: Date) => void;
}

export function useNoteAutoSave({
  noteId,
  debounceMs = 600,
  onSaved,
}: UseNoteAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const pendingUpdatesRef = useRef<Partial<Omit<Note, "id" | "createdAt">> | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeNoteIdRef = useRef<number | null | undefined>(noteId);

  // Keep noteId ref updated
  useEffect(() => {
    activeNoteIdRef.current = noteId;
  }, [noteId]);

  // Execute the database write
  const flushSave = useCallback(async () => {
    const currentNoteId = activeNoteIdRef.current;
    if (!currentNoteId || !pendingUpdatesRef.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const updates = { ...pendingUpdatesRef.current };
    pendingUpdatesRef.current = null;

    try {
      setSaveStatus("saving");
      const now = new Date();
      await db.notes.update(currentNoteId, {
        ...updates,
        updatedAt: now,
      });
      setLastSaved(now);
      setSaveStatus("saved");
      onSaved?.(now);
    } catch (err) {
      console.error("Auto-save failed:", err);
      setSaveStatus("unsaved");
      // Put updates back into pending ref
      pendingUpdatesRef.current = { ...(updates as Record<string, unknown>), ...(pendingUpdatesRef.current || {}) };
      toast.error("Auto-save failed");
    }
  }, [onSaved]);

  // Queue updates with debounce
  const queueUpdate = useCallback(
    (updates: Partial<Omit<Note, "id" | "createdAt">>) => {
      if (!activeNoteIdRef.current) return;

      pendingUpdatesRef.current = {
        ...(pendingUpdatesRef.current || {}),
        ...updates,
      };

      setSaveStatus("unsaved");

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        flushSave();
      }, debounceMs);
    },
    [debounceMs, flushSave]
  );

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (pendingUpdatesRef.current) {
          flushSave().then(() => {
            toast.success("Note saved");
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flushSave]);

  // Flush pending updates when unmounting or switching notes
  useEffect(() => {
    return () => {
      if (pendingUpdatesRef.current) {
        flushSave();
      }
    };
  }, [noteId, flushSave]);

  // Flush on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingUpdatesRef.current && activeNoteIdRef.current) {
        // synchronously attempt or trigger
        flushSave();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [flushSave]);

  return {
    saveStatus,
    lastSaved,
    queueUpdate,
    flushSave,
  };
}
