import { useState, useCallback, useEffect, useRef } from "react";
import { clampCoordinate } from "./useCanvasPanning";

export interface UseCanvasZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

export function useCanvasZoom({
  minZoom = 0.2,
  maxZoom = 3.0,
  initialZoom = 1.0,
  pan,
  setPan,
  viewportRef,
}: UseCanvasZoomOptions) {
  const [zoom, setZoom] = useState<number>(initialZoom);

  // Keep references to current pan and zoom for wheel events
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const clampZoom = useCallback(
    (val: number) => {
      if (!Number.isFinite(val)) return 1.0;
      const rounded = Math.round(val * 100) / 100;
      return Math.min(maxZoom, Math.max(minZoom, rounded));
    },
    [minZoom, maxZoom]
  );

  const zoomIn = useCallback(() => {
    setZoom((prev) => clampZoom(prev + 0.1));
  }, [clampZoom]);

  const zoomOut = useCallback(() => {
    setZoom((prev) => clampZoom(prev - 0.1));
  }, [clampZoom]);

  const resetZoom = useCallback(() => {
    setZoom(1.0);
  }, []);

  // Zoom toward cursor location on wheel
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const currentZoom = zoomRef.current || 1.0;
      const currentPan = panRef.current || { x: 0, y: 0 };

      // Trackpad pinch-to-zoom sets ctrlKey; normal mouse wheel uses deltaY
      const zoomFactor = e.ctrlKey ? 0.01 : 0.0015;
      const delta = -e.deltaY * zoomFactor;
      const nextZoom = clampZoom(currentZoom + delta);

      if (nextZoom === currentZoom) return;

      const viewportEl = viewportRef.current;
      const rect = viewportEl
        ? viewportEl.getBoundingClientRect()
        : { left: 0, top: 0 };

      const cursorX = Number.isFinite(e.clientX - rect.left)
        ? e.clientX - rect.left
        : 0;
      const cursorY = Number.isFinite(e.clientY - rect.top)
        ? e.clientY - rect.top
        : 0;

      // Adjust pan position so focal point remains steady under cursor
      const ratio = nextZoom / currentZoom;
      const rawPanX = cursorX - (cursorX - currentPan.x) * ratio;
      const rawPanY = cursorY - (cursorY - currentPan.y) * ratio;

      setPan({
        x: clampCoordinate(rawPanX),
        y: clampCoordinate(rawPanY),
      });
      setZoom(nextZoom);
    },
    [clampZoom, setPan, viewportRef]
  );

  // Attach non-passive wheel event listener to viewport
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel, viewportRef]);

  // Keyboard zoom shortcuts (+ / - / 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomIn, zoomOut, resetZoom]);

  return {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    clampZoom,
  };
}
