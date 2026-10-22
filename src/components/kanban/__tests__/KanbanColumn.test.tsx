import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { KanbanColumn } from "../KanbanColumn";
import type { Task } from "@/lib/db";

describe("KanbanColumn", () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      projectId: 1,
      title: "Create initial wireframes",
      status: "todo",
      priority: "medium",
      createdAt: new Date("2026-10-19T09:00:00Z"),
    },
    {
      id: 2,
      projectId: 1,
      title: "Review moodboard palette",
      status: "todo",
      priority: "low",
      createdAt: new Date("2026-10-19T10:00:00Z"),
    },
  ];

  it("renders column title and task count badge", () => {
    render(
      <KanbanColumn
        status="todo"
        title="To Do"
        tasks={mockTasks}
      />
    );

    expect(screen.getByRole("heading", { name: "To Do" })).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("Create initial wireframes")).toBeDefined();
    expect(screen.getByText("Review moodboard palette")).toBeDefined();
  });

  it("renders empty state placeholder when column has no tasks", () => {
    render(
      <KanbanColumn
        status="done"
        title="Done"
        tasks={[]}
      />
    );

    expect(screen.getByText("Done")).toBeDefined();
    expect(screen.getByText("0")).toBeDefined();
    expect(screen.getByText("No completed tasks yet")).toBeDefined();
  });

  it("calls onQuickAddTask when add button is clicked", () => {
    const handleQuickAdd = vi.fn();
    render(
      <KanbanColumn
        status="in-progress"
        title="In Progress"
        tasks={[]}
        onQuickAddTask={handleQuickAdd}
      />
    );

    const addBtn = screen.getByLabelText("Add task to In Progress");
    fireEvent.click(addBtn);
    expect(handleQuickAdd).toHaveBeenCalledTimes(1);
  });

  it("passes projectMap names through to cards", () => {
    render(
      <KanbanColumn
        status="todo"
        title="To Do"
        tasks={mockTasks}
        projectMap={{ 1: "Client Rebrand" }}
      />
    );

    const projectBadges = screen.getAllByText("Client Rebrand");
    expect(projectBadges.length).toBe(2);
  });

  it("applies polished custom scrollbar styling to the dropzone container", () => {
    render(
      <KanbanColumn
        status="todo"
        title="To Do"
        tasks={mockTasks}
      />
    );

    const dropzone = screen.getByTestId("kanban-dropzone-todo");
    expect(dropzone.className).toContain("kanban-column-scroll");
  });

  it("supports onStatusChange and onDeleteTask callbacks for card actions", () => {
    const handleStatus = vi.fn();
    const handleDelete = vi.fn();
    render(
      <KanbanColumn
        status="todo"
        title="To Do"
        tasks={[mockTasks[0]]}
        onStatusChange={handleStatus}
        onDeleteTask={handleDelete}
      />
    );

    expect(screen.getByText("Create initial wireframes")).toBeDefined();
  });

  it("renders empty column with full-height drop zone and min-height placeholder", () => {
    render(
      <KanbanColumn
        status="done"
        title="Done"
        tasks={[]}
      />
    );

    const dropzone = screen.getByTestId("kanban-dropzone-done");
    expect(dropzone.className).toContain("min-h-[350px]");
    expect(dropzone.className).toContain("h-full");

    const emptyPlaceholder = screen.getByTestId("kanban-empty-done");
    expect(emptyPlaceholder.className).toContain("min-h-[300px]");
    expect(emptyPlaceholder.className).toContain("flex-1");
  });

  it("renders clear completed button on Done column when tasks exist", () => {
    const handleClear = vi.fn();
    render(
      <KanbanColumn
        status="done"
        title="Done"
        tasks={[mockTasks[0]]}
        onClearCompleted={handleClear}
      />
    );

    const clearBtn = screen.getByRole("button", { name: "Clear all completed tasks" });
    expect(clearBtn).toBeDefined();

    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
