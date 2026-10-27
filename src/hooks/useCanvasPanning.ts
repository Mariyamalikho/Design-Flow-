import { useState, useRef, useCallback, useEffect } from "react";

export type CanvasTool = "select" | "pan";

export interface CanvasPanningBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface UseCanvasPanningOptions {
  activeTool: CanvasTool;
  isSpacePressed: boolean;
  initialPan?: { x: number; y: number };
  bounds?: CanvasPanningBounds;
  throttleWithRaf?: boolean;
}

const DEFAULT_BOUNDS: Required<CanvasPanningBounds> = {
  minX: -6000,
  maxX: 6000,
  minY: -6000,
  maxY: 6000,
};

export function clampCoordinate(
  val: number,
  min: number = -6000,
  max: number = 6000
): number {
  if (!Number.isFinite(val)) return 0;
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function useCanvasPanning({
  activeTool,
  isSpacePressed,
  initialPan = { x: 0, y: 0 },
  bounds = DEFAULT_BOUNDS,
  throttleWithRaf,
}: UseCanvasPanningOptions) {
  const minX = bounds.minX ?? DEFAULT_BOUNDS.minX;
  const maxX = bounds.maxX ?? DEFAULT_BOUNDS.maxX;
  const minY = bounds.minY ?? DEFAULT_BOUNDS.minY;
  const maxY = bounds.maxY ?? DEFAULT_BOUNDS.maxY;

  const shouldThrottle =
    throttleWithRaf ??
    (typeof process !== "undefined" && process.env?.NODE_ENV !== "test");

  const [pan, setPanState] = useState<{ x: number; y: number }>(() => ({
    x: clampCoordinate(initialPan.x, minX, maxX),
    y: clampCoordinate(initialPan.y, minY, maxY),
  }));

  const [isPanning, setIsPanning] = useState<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const startDragRef = useRef<{
    clientX: number;
    clientY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const setPan = useCallback(
    (newPan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
      setPanState((prev) => {
        const next = typeof newPan === "function" ? newPan(prev) : newPan;
        return {
          x: clampCoordinate(next.x, minX, maxX),
          y: clampCoordinate(next.y, minY, maxY),
        };
      });
    },
    [minX, maxX, minY, maxY]
  );

  const canPan = activeTool === "pan" || isSpacePressed;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const isMiddleClick = e.button === 1;
      const targetEl = e.target as HTMLElement | undefined;
      const isTargetCanvasBackground =
        e.target === e.currentTarget ||
        targetEl?.dataset?.testid === "canvas-viewport" ||
        targetEl?.dataset?.testid === "canvas-plane";

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

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startDragRef.current) return;
      const dx = e.clientX - startDragRef.current.clientX;
      const dy = e.clientY - startDragRef.current.clientY;

      const rawX = startDragRef.current.panX + dx;
      const rawY = startDragRef.current.panY + dy;

      const nextX = clampCoordinate(rawX, minX, maxX);
      const nextY = clampCoordinate(rawY, minY, maxY);

      // Render cycle optimization: debounce/coalesce multiple pointer movements per animation frame
      if (
        shouldThrottle &&
        typeof window !== "undefined" &&
        typeof window.requestAnimationFrame === "function"
      ) {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
          setPanState({ x: nextX, y: nextY });
          rafIdRef.current = null;
        });
      } else {
        setPanState({ x: nextX, y: nextY });
      }
    },
    [minX, maxX, minY, maxY, shouldThrottle]
  );

  const handlePointerUp = useCallback((e?: React.PointerEvent) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (startDragRef.current) {
      if (e?.currentTarget) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // Fallback
        }
      }
      startDragRef.current = null;
      setIsPanning(false);
    }
  }, []);

  // Global blur and pointer release listener to fix stuck panning state
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (startDragRef.current) {
        startDragRef.current = null;
        setIsPanning(false);
      }
    };

    window.addEventListener("pointerup", handleGlobalRelease);
    window.addEventListener("blur", handleGlobalRelease);
    return () => {
      window.removeEventListener("pointerup", handleGlobalRelease);
      window.removeEventListener("blur", handleGlobalRelease);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const resetPan = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setPanState({ x: 0, y: 0 });
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
    bounds: { minX, maxX, minY, maxY },
  };
}
