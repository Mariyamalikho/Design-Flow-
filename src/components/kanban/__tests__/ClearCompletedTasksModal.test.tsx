import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ClearCompletedTasksModal } from "../ClearCompletedTasksModal";

describe("ClearCompletedTasksModal", () => {
  it("renders confirmation details with completed count when open", () => {
    const handleConfirm = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <ClearCompletedTasksModal
        open={true}
        onOpenChange={handleOpenChange}
        completedCount={5}
        onConfirm={handleConfirm}
      />
    );

    expect(screen.getByRole("heading", { name: "Clear Completed Deliverables?" })).toBeDefined();
    expect(screen.getByText(/5 completed tasks/i)).toBeDefined();
  });

  it("calls onConfirm when Clear Completed button is clicked", () => {
    const handleConfirm = vi.fn();

    render(
      <ClearCompletedTasksModal
        open={true}
        onOpenChange={vi.fn()}
        completedCount={2}
        onConfirm={handleConfirm}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /Clear Completed/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when Cancel button is clicked", () => {
    const handleOpenChange = vi.fn();

    render(
      <ClearCompletedTasksModal
        open={true}
        onOpenChange={handleOpenChange}
        completedCount={2}
        onConfirm={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
