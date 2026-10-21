import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TaskViewToggle } from "../TaskViewToggle";

describe("TaskViewToggle", () => {
  it("renders all three view mode options (Board, List, Timeline)", () => {
    const handleChange = vi.fn();
    render(<TaskViewToggle mode="kanban" onChange={handleChange} />);

    expect(screen.getByRole("radio", { name: "Board view" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "List view" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "Timeline view" })).toBeDefined();
  });

  it("indicates which option is currently active with aria-checked", () => {
    const handleChange = vi.fn();
    const { rerender } = render(<TaskViewToggle mode="kanban" onChange={handleChange} />);

    expect(screen.getByRole("radio", { name: "Board view" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "List view" }).getAttribute("aria-checked")).toBe("false");

    rerender(<TaskViewToggle mode="list" onChange={handleChange} />);
    expect(screen.getByRole("radio", { name: "List view" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Board view" }).getAttribute("aria-checked")).toBe("false");
  });

  it("calls onChange when an inactive view mode is clicked", () => {
    const handleChange = vi.fn();
    render(<TaskViewToggle mode="kanban" onChange={handleChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "List view" }));
    expect(handleChange).toHaveBeenCalledWith("list");

    fireEvent.click(screen.getByRole("radio", { name: "Timeline view" }));
    expect(handleChange).toHaveBeenCalledWith("timeline");
  });
});
