import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CreateTaskModal } from "../CreateTaskModal";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    tasks: {
      add: vi.fn().mockResolvedValue(42),
    },
  },
}));

describe("CreateTaskModal", () => {
  const mockProjects = [
    { id: 101, title: "Fintech App" },
    { id: 102, title: "Brand Identity" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal form fields when open", () => {
    render(
      <CreateTaskModal
        open={true}
        onOpenChange={vi.fn()}
        projects={mockProjects}
      />
    );

    expect(screen.getByRole("heading", { name: "Create New Task" })).toBeDefined();
    expect(screen.getByPlaceholderText(/Export responsive logo assets/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Add subtasks, links/i)).toBeDefined();
    expect(screen.getByText("Priority Level")).toBeDefined();
    expect(screen.getByRole("button", { name: "High" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Medium" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Low" })).toBeDefined();
  });

  it("populates due date input when quick preset buttons are clicked", () => {
    render(
      <CreateTaskModal
        open={true}
        onOpenChange={vi.fn()}
        projects={mockProjects}
      />
    );

    const todayBtn = screen.getByRole("button", { name: "Today" });
    fireEvent.click(todayBtn);

    const dateInput = screen.getByLabelText("Due Date") as HTMLInputElement;
    expect(dateInput.value).not.toBe("");
  });

  it("submits new task and adds to IndexedDB", async () => {
    const handleOpenChange = vi.fn();
    const handleTaskCreated = vi.fn();

    render(
      <CreateTaskModal
        open={true}
        onOpenChange={handleOpenChange}
        projects={mockProjects}
        onTaskCreated={handleTaskCreated}
      />
    );

    // Enter title
    const titleInput = screen.getByPlaceholderText(/Export responsive logo assets/i);
    fireEvent.change(titleInput, { target: { value: "Audit typography tokens" } });

    // Select high priority
    const highBtn = screen.getByRole("button", { name: "High" });
    fireEvent.click(highBtn);

    // Submit
    const submitBtn = screen.getByRole("button", { name: "Create Task" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(db.tasks.add).toHaveBeenCalledTimes(1);
    });

    expect(db.tasks.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Audit typography tokens",
        projectId: 101,
        priority: "high",
        status: "todo",
      })
    );

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
