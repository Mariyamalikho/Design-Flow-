import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TaskTimelineView } from "../TaskTimelineView";
import type { Task } from "@/lib/db";

describe("TaskTimelineView", () => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 2); // 2 days ago
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);
  const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 * 3); // 3 days in future

  const mockTasks: Task[] = [
    {
      id: 1,
      projectId: 201,
      title: "Deliver design token specs",
      description: "Tokens for colors and typography",
      status: "todo",
      priority: "high",
      createdAt: new Date("2026-10-15T09:00:00Z"),
      dueDate: pastDate,
    },
    {
      id: 2,
      projectId: 201,
      title: "Review mobile mockups",
      status: "in-progress",
      priority: "medium",
      createdAt: new Date("2026-10-18T10:00:00Z"),
      dueDate: todayDate,
    },
    {
      id: 3,
      projectId: 202,
      title: "Design illustration pack",
      status: "todo",
      priority: "low",
      createdAt: new Date("2026-10-19T11:00:00Z"),
      dueDate: futureDate,
    },
    {
      id: 4,
      projectId: 201,
      title: "Initial moodboard ideation",
      status: "done",
      priority: "medium",
      createdAt: new Date("2026-10-14T08:00:00Z"),
    },
  ];

  const projectMap = {
    201: "Starlight Branding",
    202: "Aurora Website",
  };

  it("renders empty placeholder when task list is empty", () => {
    render(<TaskTimelineView tasks={[]} />);

    expect(screen.getByTestId("timeline-empty")).toBeDefined();
    expect(screen.getByText("Timeline is empty")).toBeDefined();
  });

  it("groups deliverables into Overdue, Today, Upcoming This Week, and Completed milestones", () => {
    render(<TaskTimelineView tasks={mockTasks} projectMap={projectMap} />);

    expect(screen.getByTestId("timeline-group-overdue")).toBeDefined();
    expect(screen.getByTestId("timeline-group-today")).toBeDefined();
    expect(screen.getByTestId("timeline-group-this-week")).toBeDefined();
    expect(screen.getByTestId("timeline-group-completed")).toBeDefined();

    expect(screen.getByText("Deliver design token specs")).toBeDefined();
    expect(screen.getByText("Review mobile mockups")).toBeDefined();
    expect(screen.getByText("Design illustration pack")).toBeDefined();
    expect(screen.getByText("Initial moodboard ideation")).toBeDefined();
  });

  it("renders project names and priority badges alongside timeline items", () => {
    render(<TaskTimelineView tasks={mockTasks} projectMap={projectMap} />);

    expect(screen.getAllByText("Starlight Branding").length).toBeGreaterThan(0);
    expect(screen.getByText("Aurora Website")).toBeDefined();
  });

  it("triggers onEditTask when deliverable title is clicked", () => {
    const handleEdit = vi.fn();
    render(
      <TaskTimelineView
        tasks={mockTasks}
        projectMap={projectMap}
        onEditTask={handleEdit}
      />
    );

    fireEvent.click(screen.getByText("Deliver design token specs"));
    expect(handleEdit).toHaveBeenCalledWith(mockTasks[0]);
  });
});
