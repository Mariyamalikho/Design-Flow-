import { describe, it, expect } from "vitest";
import {
  taskBoardReducer,
  createInitialTaskBoardState,
  type TaskBoardState,
} from "../taskBoardReducer";
import type { Task } from "@/lib/db";

describe("taskBoardReducer", () => {
  const initialState: TaskBoardState = createInitialTaskBoardState();

  const mockTask: Task[] = [
    {
      id: 99,
      projectId: 1,
      title: "Sample Task",
      status: "todo",
      priority: "medium",
      createdAt: new Date(),
    },
  ];

  it("creates initial state with default values", () => {
    expect(initialState.searchQuery).toBe("");
    expect(initialState.statusFilter).toBe("all");
    expect(initialState.priorityFilter).toBe("all");
    expect(initialState.selectedProjectId).toBe("all");
    expect(initialState.viewMode).toBe("kanban");
    expect(initialState.isCreateModalOpen).toBe(false);
    expect(initialState.isEditModalOpen).toBe(false);
    expect(initialState.editingTask).toBeNull();
    expect(initialState.activeTask).toBeNull();
  });

  it("creates initial state with specified initialProjectId and viewMode", () => {
    const customState = createInitialTaskBoardState(42, "list");
    expect(customState.selectedProjectId).toBe("42");
    expect(customState.viewMode).toBe("list");
  });

  it("handles SET_SEARCH_QUERY", () => {
    const next = taskBoardReducer(initialState, {
      type: "SET_SEARCH_QUERY",
      payload: "wireframe",
    });
    expect(next.searchQuery).toBe("wireframe");
  });

  it("handles SET_STATUS_FILTER and SET_PRIORITY_FILTER", () => {
    let next = taskBoardReducer(initialState, {
      type: "SET_STATUS_FILTER",
      payload: "in-progress",
    });
    expect(next.statusFilter).toBe("in-progress");

    next = taskBoardReducer(next, {
      type: "SET_PRIORITY_FILTER",
      payload: "high",
    });
    expect(next.priorityFilter).toBe("high");
  });

  it("handles SET_PROJECT_FILTER", () => {
    const next = taskBoardReducer(initialState, {
      type: "SET_PROJECT_FILTER",
      payload: "5",
    });
    expect(next.selectedProjectId).toBe("5");
  });

  it("handles RESET_FILTERS", () => {
    const modified: TaskBoardState = {
      ...initialState,
      searchQuery: "brand",
      statusFilter: "done",
      priorityFilter: "high",
      selectedProjectId: "3",
    };

    const next = taskBoardReducer(modified, { type: "RESET_FILTERS" });
    expect(next.searchQuery).toBe("");
    expect(next.statusFilter).toBe("all");
    expect(next.priorityFilter).toBe("all");
    expect(next.selectedProjectId).toBe("all");
  });

  it("handles SET_VIEW_MODE", () => {
    let next = taskBoardReducer(initialState, {
      type: "SET_VIEW_MODE",
      payload: "timeline",
    });
    expect(next.viewMode).toBe("timeline");

    next = taskBoardReducer(next, {
      type: "SET_VIEW_MODE",
      payload: "list",
    });
    expect(next.viewMode).toBe("list");
  });

  it("handles OPEN_CREATE_MODAL and CLOSE_CREATE_MODAL", () => {
    const openNext = taskBoardReducer(initialState, {
      type: "OPEN_CREATE_MODAL",
      payload: "in-progress",
    });
    expect(openNext.isCreateModalOpen).toBe(true);
    expect(openNext.createModalInitialStatus).toBe("in-progress");

    const closeNext = taskBoardReducer(openNext, { type: "CLOSE_CREATE_MODAL" });
    expect(closeNext.isCreateModalOpen).toBe(false);
  });

  it("handles OPEN_EDIT_MODAL and CLOSE_EDIT_MODAL", () => {
    const openNext = taskBoardReducer(initialState, {
      type: "OPEN_EDIT_MODAL",
      payload: mockTask[0],
    });
    expect(openNext.isEditModalOpen).toBe(true);
    expect(openNext.editingTask).toEqual(mockTask[0]);

    const closeNext = taskBoardReducer(openNext, { type: "CLOSE_EDIT_MODAL" });
    expect(closeNext.isEditModalOpen).toBe(false);
    expect(closeNext.editingTask).toBeNull();
  });

  it("handles DRAG_START and DRAG_END", () => {
    const startNext = taskBoardReducer(initialState, {
      type: "DRAG_START",
      payload: mockTask[0],
    });
    expect(startNext.activeTask).toEqual(mockTask[0]);

    const endNext = taskBoardReducer(startNext, { type: "DRAG_END" });
    expect(endNext.activeTask).toBeNull();
  });
});
