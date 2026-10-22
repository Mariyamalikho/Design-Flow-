import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Tasks from "../Tasks";
import { db, type Task, type Project } from "@/lib/db";

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
      description: "Sketch initial mobile wireframes",
      status: "todo",
      priority: "high",
      createdAt: new Date("2026-10-19T08:00:00Z"),
    },
    {
      id: 11,
      projectId: 1,
      title: "Design token audit",
      description: "Audit spacing and color primitives",
      status: "in-progress",
      priority: "medium",
      createdAt: new Date("2026-10-19T09:00:00Z"),
    },
    {
      id: 12,
      projectId: 2,
      title: "Export brand typography assets",
      description: "Generate woff2 fonts for release",
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

  it("filters tasks when typing in search input by title", () => {
    render(<Tasks />);

    const searchInput = screen.getByPlaceholderText(/Search tasks by title/i);
    fireEvent.change(searchInput, { target: { value: "Wireframe" } });

    expect(
      screen.getByRole("article", { name: /Task: Wireframe onboarding flow/i })
    ).toBeDefined();
    expect(screen.queryByText("Design token audit")).toBeNull();
    expect(screen.queryByText("Export brand typography assets")).toBeNull();

    const feedback = screen.getByTestId("search-results-feedback");
    expect(feedback).toHaveTextContent(/Found 1 task matching/i);
    expect(feedback).toHaveTextContent(/Wireframe/i);
  });

  it("filters tasks when searching by task description", () => {
    render(<Tasks />);

    const searchInput = screen.getByPlaceholderText(/Search tasks by title/i);
    fireEvent.change(searchInput, { target: { value: "primitives" } });

    expect(screen.getByText("Design token audit")).toBeDefined();
    expect(screen.queryByText("Wireframe onboarding flow")).toBeNull();
    expect(screen.queryByText("Export brand typography assets")).toBeNull();
  });

  it("clears search query and restores tasks when clear button is clicked", () => {
    render(<Tasks />);

    const searchInput = screen.getByPlaceholderText(/Search tasks by title/i);
    fireEvent.change(searchInput, { target: { value: "Wireframe" } });
    expect(screen.queryByText("Design token audit")).toBeNull();

    const clearBtns = screen.getAllByRole("button", { name: /Clear search/i });
    fireEvent.click(clearBtns[0]);

    expect(screen.getByText("Wireframe onboarding flow")).toBeDefined();
    expect(screen.getByText("Design token audit")).toBeDefined();
    expect(screen.getByText("Export brand typography assets")).toBeDefined();
  });

  it("clears search query on Escape key press", () => {
    render(<Tasks />);

    const searchInput = screen.getByPlaceholderText(/Search tasks by title/i);
    fireEvent.change(searchInput, { target: { value: "woff2" } });
    expect(screen.getByText("Export brand typography assets")).toBeDefined();
    expect(screen.queryByText("Wireframe onboarding flow")).toBeNull();

    fireEvent.keyDown(searchInput, { key: "Escape" });
    expect(screen.getByText("Wireframe onboarding flow")).toBeDefined();
    expect(screen.getByText("Design token audit")).toBeDefined();
  });

  it("shows empty search feedback when query matches no tasks", () => {
    render(<Tasks />);

    const searchInput = screen.getByPlaceholderText(/Search tasks by title/i);
    fireEvent.change(searchInput, { target: { value: "completely-nonexistent-query" } });

    const feedback = screen.getByTestId("search-results-feedback");
    expect(feedback).toHaveTextContent(/Found 0 tasks matching/i);
    expect(screen.queryByText("Wireframe onboarding flow")).toBeNull();
    expect(screen.queryByText("Design token audit")).toBeNull();
    expect(screen.queryByText("Export brand typography assets")).toBeNull();
  });

  it("filters tasks by status dropdown", () => {
    render(<Tasks />);

    const statusSelect = screen.getByLabelText("Filter by status");
    fireEvent.change(statusSelect, { target: { value: "in-progress" } });

    expect(screen.queryByText("Wireframe onboarding flow")).toBeNull();
    expect(screen.getByText("Design token audit")).toBeDefined();
    expect(screen.queryByText("Export brand typography assets")).toBeNull();
  });

  it("filters tasks by priority dropdown", () => {
    render(<Tasks />);

    const prioritySelect = screen.getByLabelText("Filter by priority");
    fireEvent.change(prioritySelect, { target: { value: "high" } });

    expect(screen.getByText("Wireframe onboarding flow")).toBeDefined();
    expect(screen.queryByText("Design token audit")).toBeNull();
    expect(screen.queryByText("Export brand typography assets")).toBeNull();
  });

  it("resets active filters when Reset button is clicked", () => {
    render(<Tasks />);

    const prioritySelect = screen.getByLabelText("Filter by priority");
    fireEvent.change(prioritySelect, { target: { value: "high" } });
    expect(screen.queryByText("Design token audit")).toBeNull();

    // Reset button should now be visible
    const resetBtn = screen.getByRole("button", { name: /Reset/i });
    fireEvent.click(resetBtn);

    // All tasks should be restored
    expect(screen.getByText("Wireframe onboarding flow")).toBeDefined();
    expect(screen.getByText("Design token audit")).toBeDefined();
    expect(screen.getByText("Export brand typography assets")).toBeDefined();
  });

  it("opens edit task modal when a task card is clicked", async () => {
    render(<Tasks />);

    const taskCard = screen.getByRole("article", { name: /Task: Wireframe onboarding flow/i });
    fireEvent.click(taskCard);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Edit Task" })).toBeDefined();
      const input = screen.getByLabelText(/Task Title/i) as HTMLInputElement;
      expect(input.value).toBe("Wireframe onboarding flow");
    });
  });

  it("renders in embedded mode for ProjectDetail without global page title", () => {
    render(<Tasks embedded projectId={1} />);

    expect(screen.queryByRole("heading", { name: "Task Board" })).toBeNull();
    expect(screen.getByText("Project Tasks")).toBeDefined();
    expect(screen.getByRole("heading", { name: "To Do" })).toBeDefined();
  });

  it("creates a new task and syncs it to IndexedDB", async () => {
    render(<Tasks />);

    const newTaskBtn = screen.getByRole("button", { name: /New Task/i });
    fireEvent.click(newTaskBtn);

    const titleInput = screen.getByPlaceholderText(/Export responsive logo assets/i);
    fireEvent.change(titleInput, { target: { value: "Build interactive prototypes" } });

    const submitBtn = screen.getByRole("button", { name: "Create Task" });
    fireEvent.click(submitBtn);

    expect(db.tasks.add).toHaveBeenCalledTimes(1);
    expect(db.tasks.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Build interactive prototypes",
        projectId: 1,
        status: "todo",
        priority: "medium",
      })
    );
  });

  it("switches to list view when List toggle option is clicked", () => {
    render(<Tasks />);

    const listToggle = screen.getByRole("radio", { name: "List view" });
    fireEvent.click(listToggle);

    expect(screen.getByTestId("task-list-view")).toBeDefined();
    expect(screen.getByText("List Overview")).toBeDefined();
  });

  it("switches to timeline view when Timeline toggle option is clicked", () => {
    render(<Tasks />);

    const timelineToggle = screen.getByRole("radio", { name: "Timeline view" });
    fireEvent.click(timelineToggle);

    expect(screen.getByTestId("task-timeline-view")).toBeDefined();
    expect(screen.getByText("Deliverable Timeline")).toBeDefined();
  });

  it("opens keyboard shortcuts dialog when '?' key is pressed", () => {
    render(<Tasks />);

    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeDefined();
  });

  it("opens create task modal when 'n' key is pressed", () => {
    render(<Tasks />);

    fireEvent.keyDown(window, { key: "n" });
    expect(screen.getByRole("heading", { name: "Create New Task" })).toBeDefined();
  });
});
