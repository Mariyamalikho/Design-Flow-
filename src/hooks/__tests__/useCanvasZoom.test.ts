import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCanvasZoom } from "../useCanvasZoom";

describe("useCanvasZoom", () => {
  it("initializes with default zoom 1.0", () => {
    const mockSetPan = vi.fn();
    const viewportRef = { current: document.createElement("div") };

    const { result } = renderHook(() =>
      useCanvasZoom({
        pan: { x: 0, y: 0 },
        setPan: mockSetPan,
        viewportRef,
      })
    );

    expect(result.current.zoom).toBe(1.0);
  });

  it("increases zoom on zoomIn and clamps to maxZoom", () => {
    const mockSetPan = vi.fn();
    const viewportRef = { current: document.createElement("div") };

    const { result } = renderHook(() =>
      useCanvasZoom({
        maxZoom: 1.2,
        pan: { x: 0, y: 0 },
        setPan: mockSetPan,
        viewportRef,
      })
    );

    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(1.1);

    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(1.2);

    act(() => {
      result.current.zoomIn();
    });
    // Clamped to 1.2
    expect(result.current.zoom).toBe(1.2);
  });

  it("decreases zoom on zoomOut and clamps to minZoom", () => {
    const mockSetPan = vi.fn();
    const viewportRef = { current: document.createElement("div") };

    const { result } = renderHook(() =>
      useCanvasZoom({
        minZoom: 0.9,
        pan: { x: 0, y: 0 },
        setPan: mockSetPan,
        viewportRef,
      })
    );

    act(() => {
      result.current.zoomOut();
    });
    expect(result.current.zoom).toBe(0.9);

    act(() => {
      result.current.zoomOut();
    });
    // Clamped to 0.9
    expect(result.current.zoom).toBe(0.9);
  });

  it("resets zoom to 1.0 when resetZoom is called", () => {
    const mockSetPan = vi.fn();
    const viewportRef = { current: document.createElement("div") };

    const { result } = renderHook(() =>
      useCanvasZoom({
        pan: { x: 0, y: 0 },
        setPan: mockSetPan,
        viewportRef,
      })
    );

    act(() => {
      result.current.zoomIn();
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(1.2);

    act(() => {
      result.current.resetZoom();
    });
    expect(result.current.zoom).toBe(1.0);
  });

  it("handles wheel zoom and recalculates pan toward focal point", () => {
    const mockSetPan = vi.fn();
    const container = document.createElement("div");
    // Mock getBoundingClientRect
    container.getBoundingClientRect = () => ({
      left: 100,
      top: 100,
      width: 800,
      height: 600,
      right: 900,
      bottom: 700,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    const viewportRef = { current: container };

    const { result } = renderHook(() =>
      useCanvasZoom({
        pan: { x: 50, y: 50 },
        setPan: mockSetPan,
        viewportRef,
      })
    );

    // Dispatch wheel event zooming in (deltaY < 0)
    act(() => {
      const wheelEvent = new WheelEvent("wheel", {
        deltaY: -100,
        clientX: 200,
        clientY: 200,
        cancelable: true,
      });
      container.dispatchEvent(wheelEvent);
    });

    expect(result.current.zoom).toBeGreaterThan(1.0);
    expect(mockSetPan).toHaveBeenCalled();
  });
});
