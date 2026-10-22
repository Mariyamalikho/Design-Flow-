import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TaskListView } from "../TaskListView";
import type { Task } from "@/lib/db";

describe("TaskListView", () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      projectId: 101,
      title: "Design brand guidelines",
      description: "Outline typography and color palettes",
      status: "todo",
      priority: "high",
      createdAt: new Date("2026-10-18T10:00:00Z"),
      dueDate: new Date("2026-10-25T18:00:00Z"),
    },
    {
      id: 2,
      projectId: 101,
      title: "Draft logo iconography",
      status: "in-progress",
      priority: "medium",
      createdAt: new Date("2026-10-19T11:00:00Z"),
    },
    {
      id: 3,
      projectId: 102,
      title: "Export final vector assets",
      status: "done",
      priority: "low",
      createdAt: new Date("2026-10-17T09:00:00Z"),
    },
  ];

  const projectMap = {
    101: "Acme Rebrand",
    102: "Nebula App",
  };

  it("renders empty state placeholder when no tasks exist", () => {
    render(<TaskListView tasks={[]} />);

    expect(screen.getByTestId("task-list-empty")).toBeDefined();
    expect(screen.getByText("No tasks created yet")).toBeDefined();
  });

  it("renders summary bar with correct completed tasks and total count", () => {
    render(<TaskListView tasks={mockTasks} projectMap={projectMap} />);

    expect(screen.getByText(/1 of 3 tasks completed \(33%\)/i)).toBeDefined();
  });

  it("renders tasks distributed across To Do, In Progress, and Done groups", () => {
    render(<TaskListView tasks={mockTasks} projectMap={projectMap} />);

    expect(screen.getByTestId("task-list-item-1")).toBeDefined();
    expect(screen.getByTestId("task-list-item-2")).toBeDefined();
    expect(screen.getByTestId("task-list-item-3")).toBeDefined();

    expect(screen.getByText("Design brand guidelines")).toBeDefined();
    expect(screen.getByText("Draft logo iconography")).toBeDefined();
    expect(screen.getByText("Export final vector assets")).toBeDefined();
    expect(screen.getAllByText("Acme Rebrand").length).toBe(2);
    expect(screen.getByText("Nebula App")).toBeDefined();
  });

  it("calls onStatusChange with 'done' when unchecked task checkbox is clicked", () => {
    const handleStatusChange = vi.fn();
    render(
      <TaskListView
        tasks={mockTasks}
        projectMap={projectMap}
        onStatusChange={handleStatusChange}
      />
    );

    const todoItem = screen.getByTestId("task-list-item-1");
    const checkBtn = todoItem.querySelector("button[aria-label='Mark task as complete']");
    expect(checkBtn).toBeDefined();

    fireEvent.click(checkBtn!);
    expect(handleStatusChange).toHaveBeenCalledWith(1, "done");
  });

  it("calls onStatusChange with 'todo' when completed task checkbox is clicked", () => {
    const handleStatusChange = vi.fn();
    render(
      <TaskListView
        tasks={mockTasks}
        projectMap={projectMap}
        onStatusChange={handleStatusChange}
      />
    );

    const doneItem = screen.getByTestId("task-list-item-3");
    const uncheckBtn = doneItem.querySelector("button[aria-label='Mark task as incomplete']");
    expect(uncheckBtn).toBeDefined();

    fireEvent.click(uncheckBtn!);
    expect(handleStatusChange).toHaveBeenCalledWith(3, "todo");
  });

  it("calls onEditTask when title area or edit button is clicked", () => {
    const handleEdit = vi.fn();
    render(
      <TaskListView
        tasks={mockTasks}
        projectMap={projectMap}
        onEditTask={handleEdit}
      />
    );

    fireEvent.click(screen.getByText("Design brand guidelines"));
    expect(handleEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("renders clear completed button when completed tasks exist", () => {
    const handleClear = vi.fn();
    render(
      <TaskListView
        tasks={mockTasks}
        projectMap={projectMap}
        onClearCompleted={handleClear}
      />
    );

    const clearBtn = screen.getByRole("button", { name: "Clear all completed tasks" });
    expect(clearBtn).toBeDefined();

    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
