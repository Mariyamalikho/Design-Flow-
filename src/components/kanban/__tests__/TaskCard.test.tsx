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
    status: "todo",
    priority: "high",
    createdAt: new Date("2026-10-19T10:00:00Z"),
  };

  it("renders task title and priority badge", () => {
    render(<TaskCard task={sampleTask} />);
    expect(screen.getByText("Design brand styleguide")).toBeDefined();
    expect(screen.getByText("High")).toBeDefined();
    expect(screen.getByText("To Do")).toBeDefined();
  });

  it("displays project name badge when provided", () => {
    render(<TaskCard task={sampleTask} projectName="Fintech Dashboard" />);
    expect(screen.getByText("Fintech Dashboard")).toBeDefined();
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
