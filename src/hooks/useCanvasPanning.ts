import { useState, useRef, useCallback } from "react";

export type CanvasTool = "select" | "pan";

export interface UseCanvasPanningOptions {
  activeTool: CanvasTool;
  isSpacePressed: boolean;
  initialPan?: { x: number; y: number };
}

export function useCanvasPanning({
  activeTool,
  isSpacePressed,
  initialPan = { x: 0, y: 0 },
}: UseCanvasPanningOptions) {
  const [pan, setPan] = useState<{ x: number; y: number }>(initialPan);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const startDragRef = useRef<{
    clientX: number;
    clientY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const canPan = activeTool === "pan" || isSpacePressed;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Allow panning if:
      // 1. Pan tool is active
      // 2. Spacebar is held
      // 3. Middle mouse button (button 1) is clicked
      // 4. Primary click directly on the canvas background
      const isMiddleClick = e.button === 1;
      const isTargetCanvasBackground =
        e.target === e.currentTarget ||
        (e.target as HTMLElement).dataset.testid === "canvas-viewport" ||
        (e.target as HTMLElement).dataset.testid === "canvas-plane";

      if ((e.button === 0 && (canPan || isTargetCanvasBackground)) || isMiddleClick) {
        setIsPanning(true);
        startDragRef.current = {
          clientX: e.clientX,
          clientY: e.clientY,
          panX: pan.x,
          panY: pan.y,
        };

        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // Fallback if pointer capture is unavailable
        }
      }
    },
    [canPan, pan.x, pan.y]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!startDragRef.current) return;
    const dx = e.clientX - startDragRef.current.clientX;
    const dy = e.clientY - startDragRef.current.clientY;

    setPan({
      x: Math.round(startDragRef.current.panX + dx),
      y: Math.round(startDragRef.current.panY + dy),
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (startDragRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
      startDragRef.current = null;
      setIsPanning(false);
    }
  }, []);

  const resetPan = useCallback(() => {
    setPan({ x: 0, y: 0 });
    startDragRef.current = null;
    setIsPanning(false);
  }, []);

  return {
    pan,
    setPan,
    isPanning,
    canPan,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetPan,
  };
}
