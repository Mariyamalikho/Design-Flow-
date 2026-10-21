import { useReducer, useMemo } from "react";
import type { Task } from "@/lib/db";
import type { TaskViewMode } from "./TaskViewToggle";

export interface TaskBoardState {
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  selectedProjectId: string;
  viewMode: TaskViewMode;
  isCreateModalOpen: boolean;
  createModalInitialStatus: "todo" | "in-progress" | "done";
  isEditModalOpen: boolean;
  editingTask: Task | null;
  activeTask: Task | null;
}

export type TaskBoardAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: string }
  | { type: "SET_PRIORITY_FILTER"; payload: string }
  | { type: "SET_PROJECT_FILTER"; payload: string }
  | { type: "RESET_FILTERS" }
  | { type: "SET_VIEW_MODE"; payload: TaskViewMode }
  | { type: "OPEN_CREATE_MODAL"; payload?: "todo" | "in-progress" | "done" }
  | { type: "CLOSE_CREATE_MODAL" }
  | { type: "OPEN_EDIT_MODAL"; payload: Task }
  | { type: "CLOSE_EDIT_MODAL" }
  | { type: "DRAG_START"; payload: Task }
  | { type: "DRAG_END" };

export function createInitialTaskBoardState(initialProjectId?: number, initialViewMode: TaskViewMode = "kanban"): TaskBoardState {
  return {
    searchQuery: "",
    statusFilter: "all",
    priorityFilter: "all",
    selectedProjectId: initialProjectId !== undefined ? String(initialProjectId) : "all",
    viewMode: initialViewMode,
    isCreateModalOpen: false,
    createModalInitialStatus: "todo",
    isEditModalOpen: false,
    editingTask: null,
    activeTask: null,
  };
}

export function taskBoardReducer(
  state: TaskBoardState,
  action: TaskBoardAction
): TaskBoardState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload };

    case "SET_PRIORITY_FILTER":
      return { ...state, priorityFilter: action.payload };

    case "SET_PROJECT_FILTER":
      return { ...state, selectedProjectId: action.payload };

    case "RESET_FILTERS":
      return {
        ...state,
        searchQuery: "",
        statusFilter: "all",
        priorityFilter: "all",
        selectedProjectId: "all",
      };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "OPEN_CREATE_MODAL":
      return {
        ...state,
        isCreateModalOpen: true,
        createModalInitialStatus: action.payload || "todo",
      };

    case "CLOSE_CREATE_MODAL":
      return {
        ...state,
        isCreateModalOpen: false,
      };

    case "OPEN_EDIT_MODAL":
      return {
        ...state,
        isEditModalOpen: true,
        editingTask: action.payload,
      };

    case "CLOSE_EDIT_MODAL":
      return {
        ...state,
        isEditModalOpen: false,
        editingTask: null,
      };

    case "DRAG_START":
      return {
        ...state,
        activeTask: action.payload,
      };

    case "DRAG_END":
      return {
        ...state,
        activeTask: null,
      };

    default:
      return state;
  }
}

export function useTaskBoard(initialProjectId?: number, initialViewMode: TaskViewMode = "kanban") {
  const [state, dispatch] = useReducer(
    taskBoardReducer,
    undefined,
    () => createInitialTaskBoardState(initialProjectId, initialViewMode)
  );

  const actions = useMemo(
    () => ({
      setSearchQuery: (query: string) => dispatch({ type: "SET_SEARCH_QUERY", payload: query }),
      setStatusFilter: (status: string) => dispatch({ type: "SET_STATUS_FILTER", payload: status }),
      setPriorityFilter: (priority: string) => dispatch({ type: "SET_PRIORITY_FILTER", payload: priority }),
      setSelectedProjectId: (projectId: string) => dispatch({ type: "SET_PROJECT_FILTER", payload: projectId }),
      resetFilters: () => dispatch({ type: "RESET_FILTERS" }),
      setViewMode: (mode: TaskViewMode) => dispatch({ type: "SET_VIEW_MODE", payload: mode }),
      openCreateModal: (status: "todo" | "in-progress" | "done" = "todo") =>
        dispatch({ type: "OPEN_CREATE_MODAL", payload: status }),
      closeCreateModal: () => dispatch({ type: "CLOSE_CREATE_MODAL" }),
      openEditModal: (task: Task) => dispatch({ type: "OPEN_EDIT_MODAL", payload: task }),
      closeEditModal: () => dispatch({ type: "CLOSE_EDIT_MODAL" }),
      dragStart: (task: Task) => dispatch({ type: "DRAG_START", payload: task }),
      dragEnd: () => dispatch({ type: "DRAG_END" }),
    }),
    []
  );

  return { state, dispatch, actions };
}
