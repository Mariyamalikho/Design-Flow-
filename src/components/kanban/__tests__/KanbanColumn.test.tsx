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
});
