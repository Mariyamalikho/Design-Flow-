import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TaskCard } from "../TaskCard";
import type { Task } from "@/lib/db";

describe("TaskCard", () => {
  const sampleTask: Task = {
    id: 1,
    projectId: 101,
    title: "Design brand styleguide",
    description: "Export primary vector assets and responsive variants",
    status: "todo",
    priority: "high",
    dueDate: new Date("2026-10-25T12:00:00Z"),
    createdAt: new Date("2026-10-19T10:00:00Z"),
  };

  it("renders task title, description, and priority badge", () => {
    render(<TaskCard task={sampleTask} />);
    expect(screen.getByText("Design brand styleguide")).toBeDefined();
    expect(
      screen.getByText("Export primary vector assets and responsive variants")
    ).toBeDefined();
    expect(screen.getByText("High")).toBeDefined();
    expect(screen.getByText("To Do")).toBeDefined();
  });

  it("displays project name badge when provided", () => {
    render(<TaskCard task={sampleTask} projectName="Fintech Dashboard" />);
    expect(screen.getByText("Fintech Dashboard")).toBeDefined();
  });

  it("renders due date indicator correctly", () => {
    render(<TaskCard task={sampleTask} />);
    expect(screen.getByText(/Due Oct 25/i)).toBeDefined();
  });

  it("renders overdue indicator when due date is in the past and task is not done", () => {
    const overdueTask: Task = {
      ...sampleTask,
      dueDate: new Date("2026-10-01T12:00:00Z"),
      status: "in-progress",
    };
    render(<TaskCard task={overdueTask} />);
    expect(screen.getByText(/Overdue/i)).toBeDefined();
  });

  it("handles onClick callback when card is clicked", () => {
    const handleClick = vi.fn();
    render(<TaskCard task={sampleTask} onClick={handleClick} />);
    const card = screen.getByRole("article");
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders done status styling when task is completed", () => {
    const doneTask: Task = {
      ...sampleTask,
      status: "done",
    };
    render(<TaskCard task={doneTask} />);
    expect(screen.getByText("Done")).toBeDefined();
    const title = screen.getByText("Design brand styleguide");
    expect(title.className).toContain("line-through");
  });

  it("renders elevated drag overlay styling when isOverlay is true", () => {
    render(<TaskCard task={sampleTask} isOverlay />);
    const card = screen.getByRole("article");
    expect(card.className).toContain("z-[999]");
    expect(card.className).toContain("shadow-2xl");
  });
});
