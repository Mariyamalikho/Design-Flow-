import { useEffect, type RefObject } from "react";

export interface UseFocusTrapOptions {
  enabled?: boolean;
  onEscape?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  { enabled = true, onEscape, initialFocusRef }: UseFocusTrapOptions = {}
) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // Selector for all standard keyboard focusable elements
    const FOCUSABLE_SELECTOR =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = (): HTMLElement[] => {
      if (!container) return [];
      return Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => {
        if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") {
          return false;
        }
        if (el.style.display === "none" || el.style.visibility === "hidden") {
          return false;
        }
        return true;
      });
    };

    // Set initial focus
    const focusables = getFocusableElements();
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (focusables.length > 0) {
      focusables[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key === "Tab") {
        const elements = getFocusableElements();
        if (elements.length === 0) {
          e.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !container.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !container.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement && typeof previousActiveElement.focus === "function") {
        previousActiveElement.focus();
      }
    };
  }, [enabled, containerRef, onEscape, initialFocusRef]);
}

export default useFocusTrap;
