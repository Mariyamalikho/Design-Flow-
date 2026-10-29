import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCanvasPanning } from "../useCanvasPanning";

describe("useCanvasPanning", () => {
  it("initializes with default pan (0,0) and idle panning state", () => {
    const { result } = renderHook(() =>
      useCanvasPanning({
        activeTool: "select",
        isSpacePressed: false,
      })
    );

    expect(result.current.pan).toEqual({ x: 0, y: 0 });
    expect(result.current.isPanning).toBe(false);
    expect(result.current.canPan).toBe(false);
  });

  it("enables canPan when pan tool is active or space is pressed", () => {
    const { result, rerender } = renderHook(
      (props) => useCanvasPanning(props),
      {
        initialProps: {
          activeTool: "pan" as const,
          isSpacePressed: false,
        },
      }
    );

    expect(result.current.canPan).toBe(true);

    rerender({
      activeTool: "select" as const,
      isSpacePressed: true,
    });

    expect(result.current.canPan).toBe(true);
  });

  it("updates pan coordinates on pointer drag when panning", () => {
    const { result } = renderHook(() =>
      useCanvasPanning({
        activeTool: "pan",
        isSpacePressed: false,
      })
    );

    const mockElement = document.createElement("div");

    // Pointer down at (100, 100)
    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        currentTarget: mockElement,
        target: mockElement,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isPanning).toBe(true);

    // Pointer move to (150, 180) -> dx = 50, dy = 80
    act(() => {
      result.current.handlePointerMove({
        clientX: 150,
        clientY: 180,
      } as unknown as React.PointerEvent);
    });

    expect(result.current.pan).toEqual({ x: 50, y: 80 });

    // Pointer up ends panning
    act(() => {
      result.current.handlePointerUp({
        currentTarget: mockElement,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isPanning).toBe(false);
    expect(result.current.pan).toEqual({ x: 50, y: 80 });
  });

  it("batches high-frequency pointer moves using requestAnimationFrame when throttleWithRaf is enabled", () => {
    let queuedCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      queuedCallback = cb;
      return 123;
    });

    const { result } = renderHook(() =>
      useCanvasPanning({
        activeTool: "pan",
        isSpacePressed: false,
        throttleWithRaf: true,
      })
    );

    const mockElement = document.createElement("div");

    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 0,
        clientY: 0,
        currentTarget: mockElement,
        target: mockElement,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    // Move pointer
    act(() => {
      result.current.handlePointerMove({
        clientX: 100,
        clientY: 150,
      } as unknown as React.PointerEvent);
    });

    expect(window.requestAnimationFrame).toHaveBeenCalled();
    // Before RAF executes, state has not flushed yet
    expect(result.current.pan).toEqual({ x: 0, y: 0 });

    // Now execute RAF frame
    act(() => {
      if (queuedCallback) {
        queuedCallback(16.6);
      }
    });

    expect(result.current.pan).toEqual({ x: 100, y: 150 });
    vi.restoreAllMocks();
  });

  it("resets pan coordinates when resetPan is called", () => {
    const { result } = renderHook(() =>
      useCanvasPanning({
        activeTool: "select",
        isSpacePressed: false,
        initialPan: { x: 200, y: 350 },
      })
    );

    expect(result.current.pan).toEqual({ x: 200, y: 350 });

    act(() => {
      result.current.resetPan();
    });

    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });

  it("clamps pan coordinates to boundaries to prevent drift into the void", () => {
    const { result } = renderHook(() =>
      useCanvasPanning({
        activeTool: "pan",
        isSpacePressed: false,
        bounds: { minX: -200, maxX: 200, minY: -200, maxY: 200 },
      })
    );

    const mockElement = document.createElement("div");

    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 0,
        clientY: 0,
        currentTarget: mockElement,
        target: mockElement,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    // Move by 5000px
    act(() => {
      result.current.handlePointerMove({
        clientX: 5000,
        clientY: -5000,
      } as unknown as React.PointerEvent);
    });

    // Clamped strictly to max bounds
    expect(result.current.pan.x).toBe(200);
    expect(result.current.pan.y).toBe(-200);
  });

  it("releases active panning on window blur event", () => {
    const { result } = renderHook(() =>
      useCanvasPanning({
        activeTool: "pan",
        isSpacePressed: false,
      })
    );

    const mockElement = document.createElement("div");

    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 50,
        clientY: 50,
        currentTarget: mockElement,
        target: mockElement,
        pointerId: 1,
      } as unknown as React.PointerEvent);
    });

    expect(result.current.isPanning).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("blur"));
    });

    expect(result.current.isPanning).toBe(false);
  });
});
