import { describe, it, expect } from "vitest";
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
});
