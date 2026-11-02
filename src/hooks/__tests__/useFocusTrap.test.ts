import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useFocusTrap } from "../useFocusTrap";

describe("useFocusTrap Hook", () => {
  it("traps tab focus inside container elements", () => {
    // Set up mock DOM container with three buttons
    const container = document.createElement("div");
    const btn1 = document.createElement("button");
    btn1.textContent = "First";
    const btn2 = document.createElement("button");
    btn2.textContent = "Second";
    const btn3 = document.createElement("button");
    btn3.textContent = "Third";

    container.appendChild(btn1);
    container.appendChild(btn2);
    container.appendChild(btn3);
    document.body.appendChild(container);

    const ref = { current: container };
    const onEscape = vi.fn();

    renderHook(() => useFocusTrap(ref, { enabled: true, onEscape }));

    // Initial focus should land on first focusable element
    expect(document.activeElement).toBe(btn1);

    // Simulating Shift+Tab on first element should wrap around to last
    const shiftTabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(shiftTabEvent);
    expect(document.activeElement).toBe(btn3);

    // Simulating Tab on last element should wrap back to first
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: false,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(btn1);

    // Simulating Escape key triggers onEscape callback
    const escEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(escEvent);
    expect(onEscape).toHaveBeenCalledTimes(1);

    document.body.removeChild(container);
  });

  it("restores previous focus when trap is disabled/unmounted", () => {
    const triggerBtn = document.createElement("button");
    document.body.appendChild(triggerBtn);
    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    const container = document.createElement("div");
    const modalBtn = document.createElement("button");
    container.appendChild(modalBtn);
    document.body.appendChild(container);

    const ref = { current: container };
    const { unmount } = renderHook(() => useFocusTrap(ref, { enabled: true }));

    expect(document.activeElement).toBe(modalBtn);

    unmount();

    expect(document.activeElement).toBe(triggerBtn);

    document.body.removeChild(triggerBtn);
    document.body.removeChild(container);
  });
});
