import { useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

export interface KeyboardShortcut {
  key: string;
  metaOrCtrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  allowInInput?: boolean;
  action: (e: KeyboardEvent) => void;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts?: KeyboardShortcut[];
  enabled?: boolean;
  enableGlobalCmdK?: boolean;
}

export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") return true;
  const contentEditableAttr = target.getAttribute("contenteditable");
  if (
    target.isContentEditable ||
    contentEditableAttr === "true" ||
    contentEditableAttr === "" ||
    target.contentEditable === "true"
  ) {
    return true;
  }
  if (target.closest?.(".ProseMirror") || target.closest?.("[contenteditable='true']")) {
    return true;
  }
  return false;
}

export function useKeyboardShortcuts({
  shortcuts = [],
  enabled = true,
  enableGlobalCmdK = true,
}: UseKeyboardShortcutsOptions = {}) {
  const toggleCommandPalette = useAppStore((state) => state.toggleCommandPalette);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const isEditable = isEditableElement(e.target);
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Handle global Cmd+K / Ctrl+K for command palette
      if (enableGlobalCmdK && isCmdOrCtrl && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Check registered custom shortcuts
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const metaMatch = shortcut.metaOrCtrl ? isCmdOrCtrl : !isCmdOrCtrl;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (keyMatch && metaMatch && shiftMatch && altMatch) {
          // If in an editable element, only allow if explicitly permitted or modifier key is used
          if (isEditable && !shortcut.allowInInput && !shortcut.metaOrCtrl) {
            continue;
          }

          if (shortcut.preventDefault ?? (shortcut.metaOrCtrl || shortcut.key === "Escape")) {
            e.preventDefault();
          }

          shortcut.action(e);
          break;
        }
      }
    },
    [enabled, enableGlobalCmdK, shortcuts, toggleCommandPalette]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

export function useCommandPaletteShortcut(onToggle?: () => void) {
  const toggleFromStore = useAppStore((state) => state.toggleCommandPalette);
  const toggle = onToggle ?? toggleFromStore;

  useKeyboardShortcuts({
    enableGlobalCmdK: false,
    shortcuts: [
      {
        key: "k",
        metaOrCtrl: true,
        preventDefault: true,
        allowInInput: true,
        action: () => toggle(),
      },
    ],
  });
}
