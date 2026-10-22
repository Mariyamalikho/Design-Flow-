import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { db, type Task } from "@/lib/db";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { TaskCard } from "@/components/kanban/TaskCard";
import { CreateTaskModal } from "@/components/kanban/CreateTaskModal";
import { EditTaskModal } from "@/components/kanban/EditTaskModal";
import { TaskViewToggle } from "@/components/kanban/TaskViewToggle";
import { TaskListView } from "@/components/kanban/TaskListView";
import { TaskTimelineView } from "@/components/kanban/TaskTimelineView";
import { TaskKeyboardShortcutsModal } from "@/components/kanban/TaskKeyboardShortcutsModal";
import { ClearCompletedTasksModal } from "@/components/kanban/ClearCompletedTasksModal";
import { useTaskBoard } from "@/components/kanban/taskBoardReducer";
import { triggerTaskCompletedConfetti } from "@/lib/confettiUtils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Search,
  Filter,
  Kanban,
  CheckCircle2,
  Clock,
  Circle,
  FolderKanban,
  Layers,
  X,
  RotateCcw,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface TasksProps {
  embedded?: boolean;
  projectId?: number;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.35",
      },
    },
  }),
  duration: 240,
  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
};

export default function Tasks({ embedded = false, projectId }: TasksProps) {
  // Query projects and tasks from Dexie
  const projects = useLiveQuery(() => db.projects.toArray());
  const tasks = useLiveQuery(() => {
    if (projectId !== undefined) {
      return db.tasks.where("projectId").equals(projectId).toArray();
    }
    return db.tasks.toArray();
  }, [projectId]);

  // Complex state managed via task board reducer
  const { state, actions } = useTaskBoard(projectId);
  const {
    searchQuery,
    statusFilter,
    priorityFilter,
    selectedProjectId,
    viewMode,
    isCreateModalOpen,
    createModalInitialStatus,
    isEditModalOpen,
    editingTask,
    activeTask,
  } = state;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isClearCompletedModalOpen, setIsClearCompletedModalOpen] = useState(false);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);

  // Clear all completed tasks handler
  const handleClearCompleted = async () => {
    try {
      setIsClearingCompleted(true);
      const completedTasks =
        tasks?.filter(
          (t) => t.status === "done" && (projectId === undefined || t.projectId === projectId)
        ) ?? [];
      const ids = completedTasks.map((t) => t.id).filter(Boolean) as number[];

      if (ids.length > 0) {
        await db.tasks.bulkDelete(ids);
        toast.success(
          `Cleared ${ids.length} completed ${ids.length === 1 ? "deliverable" : "deliverables"}`
        );
      }
      setIsClearCompletedModalOpen(false);
    } catch {
      toast.error("Failed to clear completed tasks");
    } finally {
      setIsClearingCompleted(false);
    }
  };

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInput) return;

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "n" || e.key === "c" || e.key === "N" || e.key === "C") {
        e.preventDefault();
        actions.openCreateModal("todo");
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        actions.setViewMode("kanban");
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        actions.setViewMode("list");
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        actions.setViewMode("timeline");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions]);

  // DnD Sensors: 5px distance constraint allows clicks and dropdown actions without dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Map project ID to Project Title
  const projectMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (projects) {
      projects.forEach((p) => {
        if (p.id) map[p.id] = p.title;
      });
    }
    return map;
  }, [projects]);

  // Open create modal with specific initial column status
  const handleOpenCreateModal = (
    initialStatus: "todo" | "in-progress" | "done" = "todo"
  ) => {
    actions.openCreateModal(initialStatus);
  };

  // Open edit modal for specific task
  const handleOpenEditModal = (task: Task) => {
    actions.openEditModal(task);
  };

  // Status transition
  const handleStatusChange = async (
    taskId: number,
    nextStatus: "todo" | "in-progress" | "done"
  ) => {
    try {
      await db.tasks.update(taskId, { status: nextStatus });
      const statusLabels = {
        todo: "To Do",
        "in-progress": "In Progress",
        done: "Done",
      };

      if (nextStatus === "done") {
        triggerTaskCompletedConfetti();
        toast.success("Task completed! 🎉", {
          description: "Great job completing this deliverable.",
        });
      } else {
        toast.success(`Task moved to ${statusLabels[nextStatus]}`);
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: number) => {
    try {
      await db.tasks.delete(taskId);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks?.find((t) => t.id === Number(active.id));
    if (task) {
      actions.dragStart(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    actions.dragEnd();

    if (!over) return;

    const activeId = Number(active.id);
    const draggedTask = tasks?.find((t) => t.id === activeId);
    if (!draggedTask) return;

    // Detect target column directly or from target task
    let targetStatus: "todo" | "in-progress" | "done" | null = null;
    if (over.id === "todo" || over.id === "in-progress" || over.id === "done") {
      targetStatus = over.id as "todo" | "in-progress" | "done";
    } else {
      const overTask = tasks?.find((t) => t.id === Number(over.id));
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus && targetStatus !== draggedTask.status) {
      await handleStatusChange(activeId, targetStatus);
    }
  };

  // Compute total task counts per priority and status across all unfiltered tasks
  const priorityCounts = useMemo(() => {
    const list = tasks ?? [];
    return {
      all: list.length,
      high: list.filter((t) => t.priority === "high").length,
      medium: list.filter((t) => t.priority === "medium").length,
      low: list.filter((t) => t.priority === "low").length,
    };
  }, [tasks]);

  const statusCounts = useMemo(() => {
    const list = tasks ?? [];
    return {
      all: list.length,
      todo: list.filter((t) => t.status === "todo").length,
      "in-progress": list.filter((t) => t.status === "in-progress").length,
      done: list.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      statusFilter !== "all" ||
      priorityFilter !== "all" ||
      (projectId === undefined && selectedProjectId !== "all") ||
      searchQuery.trim() !== ""
    );
  }, [statusFilter, priorityFilter, selectedProjectId, projectId, searchQuery]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (priorityFilter !== "all") count++;
    if (projectId === undefined && selectedProjectId !== "all") count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [statusFilter, priorityFilter, selectedProjectId, projectId, searchQuery]);

  // Reset all filters to default
  const handleResetFilters = () => {
    actions.resetFilters();
  };

  // Filter tasks based on search, project selector, status, and priority
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Text search matching title or description or project name
      let matchesSearch = true;
      if (query) {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = Boolean(task.description && task.description.toLowerCase().includes(query));
        const projName = projectMap[task.projectId]?.toLowerCase();
        const projMatch = Boolean(projName && projName.includes(query));
        matchesSearch = titleMatch || descMatch || projMatch;
      }

      // Status filter
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      // Project filter (if not embedded)
      const matchesProject =
        projectId !== undefined ||
        selectedProjectId === "all" ||
        String(task.projectId) === selectedProjectId;

      // Priority filter
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesProject && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, selectedProjectId, priorityFilter, projectId, projectMap]);

  // Group into columns
  const todoTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "todo"),
    [filteredTasks]
  );
  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "in-progress"),
    [filteredTasks]
  );
  const doneTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "done"),
    [filteredTasks]
  );

  return (
    <div className={cn("flex flex-col h-full", !embedded && "p-6 md:p-8 space-y-6")}>
      {/* Page Header (if not embedded) */}
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Kanban className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Task Board
              </h1>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Organize, prioritize, and track project tasks across your creative workflow.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <TaskViewToggle mode={viewMode} onChange={actions.setViewMode} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="h-9 px-2.5 text-xs gap-1.5 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800"
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <kbd className="hidden sm:inline-block text-[10px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1 font-mono">
                ?
              </kbd>
            </Button>
            <Button
              onClick={() => handleOpenCreateModal("todo")}
              className="gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
              <kbd className="hidden sm:inline-block ml-0.5 text-[10px] bg-indigo-700/60 text-white border border-indigo-500/50 rounded px-1 font-mono">
                N
              </kbd>
            </Button>
          </div>
        </div>
      )}

      {/* Embedded Action Bar (if embedded inside ProjectDetail) */}
      {embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Project Tasks
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
              {filteredTasks.length} total
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <TaskViewToggle mode={viewMode} onChange={actions.setViewMode} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="h-8 px-2 text-xs text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800"
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenCreateModal("todo")}
              className="gap-1.5 h-8 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
            {/* Search Input with Clear Button and ESC handler */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search tasks by title, notes, or project... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => actions.setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    actions.setSearchQuery("");
                  }
                }}
                className="pl-9 pr-8 h-9 text-sm rounded-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => actions.setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md transition-colors"
                  aria-label="Clear search"
                  title="Clear search (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => actions.setStatusFilter(e.target.value)}
                className={cn(
                  "h-9 px-3 rounded-lg border text-xs focus:outline-none focus:ring-2 font-medium transition-colors",
                  statusFilter !== "all"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 focus:ring-indigo-500"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 focus:ring-indigo-500"
                )}
              >
                <option value="all">All Statuses ({statusCounts.all})</option>
                <option value="todo">To Do ({statusCounts.todo})</option>
                <option value="in-progress">In Progress ({statusCounts["in-progress"]})</option>
                <option value="done">Done ({statusCounts.done})</option>
              </select>
            </div>

            {/* Priority Filter with Color Coding */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) => actions.setPriorityFilter(e.target.value)}
                className={cn(
                  "h-9 px-3 rounded-lg border text-xs focus:outline-none focus:ring-2 font-medium transition-colors",
                  priorityFilter === "high" &&
                    "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 focus:ring-rose-500",
                  priorityFilter === "medium" &&
                    "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 focus:ring-amber-500",
                  priorityFilter === "low" &&
                    "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 focus:ring-emerald-500",
                  priorityFilter === "all" &&
                    "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 focus:ring-indigo-500"
                )}
              >
                <option value="all">All Priorities ({priorityCounts.all})</option>
                <option value="high">High ({priorityCounts.high})</option>
                <option value="medium">Medium ({priorityCounts.medium})</option>
                <option value="low">Low ({priorityCounts.low})</option>
              </select>
            </div>

            {/* Project Selector (only when global board) */}
            {!embedded && projects && projects.length > 0 && (
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
                <select
                  aria-label="Filter by project"
                  value={selectedProjectId}
                  onChange={(e) => actions.setSelectedProjectId(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="all">All Projects</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Filters Action */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-xs gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
                <Badge
                  variant="secondary"
                  className="ml-0.5 px-1.5 py-0 h-4 text-[10px] rounded-full"
                >
                  {activeFilterCount}
                </Badge>
              </Button>
            )}
          </div>

          {/* Quick Metric Badges */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 self-end md:self-auto shrink-0 pt-1 md:pt-0">
            <div className="flex items-center gap-1.5">
              <Circle className="w-3 h-3 text-indigo-500" />
              <span>To Do: {todoTasks.length}</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>In Progress: {inProgressTasks.length}</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Done: {doneTasks.length}</span>
            </div>
          </div>
        </div>

        {/* Search Results Feedback Bar */}
        {searchQuery.trim() !== "" && (
          <div
            data-testid="search-results-feedback"
            className="flex items-center justify-between px-3.5 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-xl text-xs text-indigo-950 dark:text-indigo-200"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                Found <strong>{filteredTasks.length}</strong> {filteredTasks.length === 1 ? "task" : "tasks"} matching &ldquo;
                <span className="font-semibold">{searchQuery}</span>&rdquo;
              </span>
            </div>
            <button
              type="button"
              onClick={() => actions.setSearchQuery("")}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium underline underline-offset-2 cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Active Filter Pills Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs">
            <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium">
              Active filters:
            </span>

            {statusFilter !== "all" && (
              <Badge
                variant="outline"
                className="gap-1 pl-2 pr-1 py-0.5 text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-md"
              >
                <span>
                  Status: {statusFilter === "in-progress" ? "In Progress" : statusFilter === "todo" ? "To Do" : "Done"}
                </span>
                <button
                  type="button"
                  onClick={() => actions.setStatusFilter("all")}
                  className="hover:bg-indigo-200/50 dark:hover:bg-indigo-900 rounded p-0.5"
                  aria-label="Remove status filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {priorityFilter !== "all" && (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 pl-2 pr-1 py-0.5 text-[11px] rounded-md capitalize",
                  priorityFilter === "high" &&
                    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
                  priorityFilter === "medium" &&
                    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
                  priorityFilter === "low" &&
                    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                )}
              >
                <span>Priority: {priorityFilter}</span>
                <button
                  type="button"
                  onClick={() => actions.setPriorityFilter("all")}
                  className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                  aria-label="Remove priority filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {projectId === undefined && selectedProjectId !== "all" && (
              <Badge
                variant="outline"
                className="gap-1 pl-2 pr-1 py-0.5 text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 rounded-md"
              >
                <span>Project: {projectMap[Number(selectedProjectId)] || selectedProjectId}</span>
                <button
                  type="button"
                  onClick={() => actions.setSelectedProjectId("all")}
                  className="hover:bg-zinc-200/50 dark:hover:bg-zinc-700 rounded p-0.5"
                  aria-label="Remove project filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {searchQuery.trim() !== "" && (
              <Badge
                variant="outline"
                className="gap-1 pl-2 pr-1 py-0.5 text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 rounded-md"
              >
                <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => actions.setSearchQuery("")}
                  className="hover:bg-zinc-200/50 dark:hover:bg-zinc-700 rounded p-0.5"
                  aria-label="Remove search query"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => actions.dragEnd()}
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch overflow-x-auto min-h-[500px] h-full pt-2">
            <KanbanColumn
              status="todo"
              title="To Do"
              tasks={todoTasks}
              projectMap={projectMap}
              searchQuery={searchQuery}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleOpenEditModal}
              onQuickAddTask={() => handleOpenCreateModal("todo")}
              isFiltered={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
            <KanbanColumn
              status="in-progress"
              title="In Progress"
              tasks={inProgressTasks}
              projectMap={projectMap}
              searchQuery={searchQuery}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleOpenEditModal}
              onQuickAddTask={() => handleOpenCreateModal("in-progress")}
              isFiltered={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
            <KanbanColumn
              status="done"
              title="Done"
              tasks={doneTasks}
              projectMap={projectMap}
              searchQuery={searchQuery}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleOpenEditModal}
              onQuickAddTask={() => handleOpenCreateModal("done")}
              onClearCompleted={() => setIsClearCompletedModalOpen(true)}
              isFiltered={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
          </div>

          <DragOverlay
            zIndex={999}
            className="z-[999] pointer-events-none select-none drop-shadow-2xl"
            dropAnimation={dropAnimationConfig}
          >
            {activeTask ? (
              <div className="w-[300px] pointer-events-none">
                <TaskCard
                  task={activeTask}
                  projectName={projectMap[activeTask.projectId]}
                  searchQuery={searchQuery}
                  isOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <TaskListView
          tasks={filteredTasks}
          projectMap={projectMap}
          searchQuery={searchQuery}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleOpenEditModal}
          onQuickAddTask={() => handleOpenCreateModal("todo")}
          onClearCompleted={() => setIsClearCompletedModalOpen(true)}
          isFiltered={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <TaskTimelineView
          tasks={filteredTasks}
          projectMap={projectMap}
          searchQuery={searchQuery}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleOpenEditModal}
          onQuickAddTask={() => handleOpenCreateModal("todo")}
          isFiltered={hasActiveFilters}
          onResetFilters={handleResetFilters}
          className="pt-2"
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!open) actions.closeCreateModal();
        }}
        defaultStatus={createModalInitialStatus}
        projectId={projectId}
        projects={projects ?? []}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) actions.closeEditModal();
        }}
        projects={projects ?? []}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <TaskKeyboardShortcutsModal
        open={isShortcutsModalOpen}
        onOpenChange={setIsShortcutsModalOpen}
      />

      {/* Clear Completed Tasks Confirmation Modal */}
      <ClearCompletedTasksModal
        open={isClearCompletedModalOpen}
        onOpenChange={setIsClearCompletedModalOpen}
        completedCount={doneTasks.length}
        onConfirm={handleClearCompleted}
        isClearing={isClearingCompleted}
      />
    </div>
  );
}
