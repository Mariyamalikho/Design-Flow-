import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { EditTaskModal } from "../EditTaskModal";
import { db, type Task } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    tasks: {
      update: vi.fn().mockResolvedValue(1),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

describe("EditTaskModal", () => {
  const mockTask: Task = {
    id: 42,
    projectId: 101,
    title: "Refactor Navigation",
    description: "Update the header component with breadcrumbs",
    status: "in-progress",
    priority: "high",
    dueDate: new Date("2026-11-15T12:00:00"),
    createdAt: new Date("2026-10-01T10:00:00"),
  };

  const mockProjects = [
    { id: 101, title: "Fintech App" },
    { id: 102, title: "Brand Identity" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pre-filled task details in the modal form", () => {
    render(
      <EditTaskModal
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
        projects={mockProjects}
      />
    );

    expect(screen.getByRole("heading", { name: "Edit Task" })).toBeDefined();
    const titleInput = screen.getByLabelText(/Task Title/i) as HTMLInputElement;
    expect(titleInput.value).toBe("Refactor Navigation");

    const descInput = screen.getByLabelText(/Description \/ Notes/i) as HTMLTextAreaElement;
    expect(descInput.value).toBe("Update the header component with breadcrumbs");

    const dateInput = screen.getByLabelText(/Due Date/i) as HTMLInputElement;
    expect(dateInput.value).toBe("2026-11-15");
  });

  it("submits updated task data to IndexedDB", async () => {
    const handleOpenChange = vi.fn();
    const handleTaskUpdated = vi.fn();

    render(
      <EditTaskModal
        task={mockTask}
        open={true}
        onOpenChange={handleOpenChange}
        projects={mockProjects}
        onTaskUpdated={handleTaskUpdated}
      />
    );

    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: "Refactor Top Navigation" } });

    // Change priority to Medium
    const mediumBtn = screen.getByRole("button", { name: "Medium" });
    fireEvent.click(mediumBtn);

    // Click Save Changes
    const submitBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(db.tasks.update).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          title: "Refactor Top Navigation",
          priority: "medium",
          status: "in-progress",
        })
      );
      expect(handleOpenChange).toHaveBeenCalledWith(false);
      expect(handleTaskUpdated).toHaveBeenCalled();
    });
  });

  it("prompts for confirmation before deleting task", async () => {
    const handleOpenChange = vi.fn();
    const handleTaskDeleted = vi.fn();

    render(
      <EditTaskModal
        task={mockTask}
        open={true}
        onOpenChange={handleOpenChange}
        projects={mockProjects}
        onTaskDeleted={handleTaskDeleted}
      />
    );

    // Initial Delete Task button
    const deleteBtn = screen.getByRole("button", { name: /Delete Task/i });
    fireEvent.click(deleteBtn);

    // Confirmation banner should now appear
    expect(
      screen.getByText(/Are you sure you want to delete this task\?/i)
    ).toBeDefined();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole("button", { name: /Yes, Delete Task/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(db.tasks.delete).toHaveBeenCalledWith(42);
      expect(handleTaskDeleted).toHaveBeenCalledWith(42);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
