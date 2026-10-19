import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Tasks from "../Tasks";
import type { Task, Project } from "@/lib/db";

const { mockProjects, mockTasks } = vi.hoisted(() => {
  const mockProjects: Project[] = [
    {
      id: 1,
      title: "Mobile App Redesign",
      description: "New UX/UI design",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: "Brand Guidelines",
      description: "Typography & colors",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTasks: Task[] = [
    {
      id: 10,
      projectId: 1,
      title: "Wireframe onboarding flow",
      status: "todo",
      priority: "high",
      createdAt: new Date("2026-10-19T08:00:00Z"),
    },
    {
      id: 11,
      projectId: 1,
      title: "Design token audit",
      status: "in-progress",
      priority: "medium",
      createdAt: new Date("2026-10-19T09:00:00Z"),
    },
    {
      id: 12,
      projectId: 2,
      title: "Export brand typography assets",
      status: "done",
      priority: "low",
      createdAt: new Date("2026-10-19T10:00:00Z"),
    },
  ];

  return { mockProjects, mockTasks };
});

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (fn: () => unknown) => {
    const queryStr = fn.toString();
    if (queryStr.includes("db.projects")) {
      return mockProjects;
    }
    return mockTasks;
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    projects: {
      toArray: vi.fn().mockResolvedValue(mockProjects),
    },
    tasks: {
      toArray: vi.fn().mockResolvedValue(mockTasks),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockTasks),
        }),
      }),
      add: vi.fn().mockResolvedValue(1),
      update: vi.fn().mockResolvedValue(1),
      delete: vi.fn().mockResolvedValue(1),
    },
  },
}));

describe("Tasks Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders global Task Board header with 3 columns", () => {
    render(<Tasks />);

    expect(screen.getByRole("heading", { name: "Task Board" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "To Do" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "In Progress" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Done" })).toBeDefined();
  });

  it("distributes tasks into their respective columns", () => {
    render(<Tasks />);

    expect(screen.getByText("Wireframe onboarding flow")).toBeDefined();
    expect(screen.getByText("Design token audit")).toBeDefined();
    expect(screen.getByText("Export brand typography assets")).toBeDefined();

    // Check count in stats bar
    expect(screen.getByText("To Do: 1")).toBeDefined();
    expect(screen.getByText("In Progress: 1")).toBeDefined();
    expect(screen.getByText("Done: 1")).toBeDefined();
  });

  it("filters tasks when typing in search input", () => {
    render(<Tasks />);

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "Wireframe" } });

    expect(screen.getByText("Wireframe onboarding flow")).toBeDefined();
    expect(screen.queryByText("Design token audit")).toBeNull();
    expect(screen.queryByText("Export brand typography assets")).toBeNull();
  });

  it("renders in embedded mode for ProjectDetail without global page title", () => {
    render(<Tasks embedded projectId={1} />);

    expect(screen.queryByRole("heading", { name: "Task Board" })).toBeNull();
    expect(screen.getByText("Project Tasks")).toBeDefined();
    expect(screen.getByRole("heading", { name: "To Do" })).toBeDefined();
  });
});
