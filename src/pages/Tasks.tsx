import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { db, type Task } from "@/lib/db";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { TaskCard } from "@/components/kanban/TaskCard";
import { CreateTaskModal } from "@/components/kanban/CreateTaskModal";
import { EditTaskModal } from "@/components/kanban/EditTaskModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Plus,
  Search,
  Filter,
  Kanban,
  CheckCircle2,
  Clock,
  Circle,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface TasksProps {
  embedded?: boolean;
  projectId?: number;
}

export default function Tasks({ embedded = false, projectId }: TasksProps) {
  // Query projects and tasks from Dexie
  const projects = useLiveQuery(() => db.projects.toArray());
  const tasks = useLiveQuery(() => {
    if (projectId !== undefined) {
      return db.tasks.where("projectId").equals(projectId).toArray();
    }
    return db.tasks.toArray();
  }, [projectId]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectId !== undefined ? String(projectId) : "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialStatus, setCreateModalInitialStatus] = useState<
    "todo" | "in-progress" | "done"
  >("todo");

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Active dragged task for drag overlay
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
    setCreateModalInitialStatus(initialStatus);
    setIsCreateModalOpen(true);
  };

  // Open edit modal for specific task
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
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
      toast.success(`Task moved to ${statusLabels[nextStatus]}`);
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
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

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

  // Filter tasks based on search, project selector, and priority
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      // Text search
      const matchesSearch =
        searchQuery.trim() === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Project filter (if not embedded)
      const matchesProject =
        projectId !== undefined ||
        selectedProjectId === "all" ||
        String(task.projectId) === selectedProjectId;

      // Priority filter
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesProject && matchesPriority;
    });
  }, [tasks, searchQuery, selectedProjectId, priorityFilter, projectId]);

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

          <Button
            onClick={() => handleOpenCreateModal("todo")}
            className="self-start sm:self-auto gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </Button>
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

          <Button
            size="sm"
            onClick={() => handleOpenCreateModal("todo")}
            className="self-start sm:self-auto gap-1.5 h-8 text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg"
            />
          </div>

          {/* Project Selector (only when global board) */}
          {!embedded && projects && projects.length > 0 && (
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
              <select
                aria-label="Filter by project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
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

          {/* Priority Filter with Color Coding */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
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
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
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

      {/* 3-Column Kanban Board Shell with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-start overflow-x-auto min-h-[420px] pt-2">
          <KanbanColumn
            status="todo"
            title="To Do"
            tasks={todoTasks}
            projectMap={projectMap}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleOpenEditModal}
            onQuickAddTask={() => handleOpenCreateModal("todo")}
          />
          <KanbanColumn
            status="in-progress"
            title="In Progress"
            tasks={inProgressTasks}
            projectMap={projectMap}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleOpenEditModal}
            onQuickAddTask={() => handleOpenCreateModal("in-progress")}
          />
          <KanbanColumn
            status="done"
            title="Done"
            tasks={doneTasks}
            projectMap={projectMap}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleOpenEditModal}
            onQuickAddTask={() => handleOpenCreateModal("done")}
          />
        </div>

        <DragOverlay
          zIndex={999}
          className="z-[999] pointer-events-none select-none drop-shadow-2xl"
          dropAnimation={{
            duration: 220,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeTask ? (
            <div className="w-[300px] pointer-events-none">
              <TaskCard
                task={activeTask}
                projectName={projectMap[activeTask.projectId]}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultStatus={createModalInitialStatus}
        projectId={projectId}
        projects={projects ?? []}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        projects={projects ?? []}
      />
    </div>
  );
}
