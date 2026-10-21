import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "@/lib/db";
import { SortableTaskCard } from "./SortableTaskCard";
import { Button } from "@/components/ui/Button";
import { Plus, CheckCircle2, Clock, ListPlus, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KanbanColumnProps {
  status: "todo" | "in-progress" | "done";
  title: string;
  tasks: Task[];
  projectMap?: Record<number, string>;
  searchQuery?: string;
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onStatusChange?: (taskId: number, newStatus: "todo" | "in-progress" | "done") => void;
  onDeleteTask?: (taskId: number) => void;
  onQuickAddTask?: () => void;
  isFiltered?: boolean;
  onResetFilters?: () => void;
  className?: string;
}

const COLUMN_THEMES = {
  todo: {
    accentDot: "bg-indigo-500",
    badgeBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
    emptyIcon: ListPlus,
    emptyMessage: "No tasks to do",
    emptyHint: "Add a task or drag one here",
  },
  "in-progress": {
    accentDot: "bg-amber-500",
    badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    emptyIcon: Clock,
    emptyMessage: "Nothing in progress",
    emptyHint: "Drag tasks here when you begin working",
  },
  done: {
    accentDot: "bg-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    emptyIcon: CheckCircle2,
    emptyMessage: "No completed tasks yet",
    emptyHint: "Drag completed tasks here",
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  projectMap = {},
  searchQuery,
  onTaskClick,
  onEditTask,
  onStatusChange,
  onDeleteTask,
  onQuickAddTask,
  isFiltered = false,
  onResetFilters,
  className,
}) => {
  const theme = COLUMN_THEMES[status] || COLUMN_THEMES.todo;
  const EmptyIcon = isFiltered ? FilterX : theme.emptyIcon;

  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "Column",
      status,
    },
  });

  const taskIds = React.useMemo(() => {
    return tasks.map((t) => t.id!).filter(Boolean);
  }, [tasks]);

  return (
    <div
      data-testid={`kanban-column-${status}`}
      className={cn(
        "flex flex-col h-full rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-3 min-w-[280px] w-full flex-1 transition-all duration-200 ease-out",
        isOver && "border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-md scale-[1.005]",
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 mb-1">
        <div className="flex items-center gap-2.5">
          <span className={cn("w-2.5 h-2.5 rounded-full", theme.accentDot)} />
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium tabular-nums",
              theme.badgeBg
            )}
            aria-label={`${tasks.length} tasks in ${title}`}
          >
            {tasks.length}
          </span>
        </div>

        {onQuickAddTask && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onQuickAddTask}
            className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title={`Add task to ${title}`}
            aria-label={`Add task to ${title}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cards Scroll Container & Drop Zone with full height support */}
      <div
        ref={setNodeRef}
        data-testid={`kanban-dropzone-${status}`}
        className={cn(
          "flex-1 flex flex-col space-y-3 overflow-y-auto pr-1 kanban-column-scroll min-h-[350px] h-full rounded-xl transition-all duration-150",
          isOver && "bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500/15"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id ?? `${task.title}-${task.createdAt.getTime()}`}
                id={task.id!}
                task={task}
                projectName={projectMap[task.projectId]}
                searchQuery={searchQuery}
                onClick={onTaskClick ? () => onTaskClick(task) : undefined}
                onEdit={onEditTask ? () => onEditTask(task) : undefined}
                onStatusChange={
                  onStatusChange && task.id
                    ? (newStatus) => onStatusChange(task.id!, newStatus)
                    : undefined
                }
                onDelete={
                  onDeleteTask && task.id ? () => onDeleteTask(task.id!) : undefined
                }
              />
            ))
          ) : (
            <div
              data-testid={`kanban-empty-${status}`}
              className={cn(
                "flex-1 w-full h-full min-h-[300px] flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-all duration-200",
                isOver
                  ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                  : "border-zinc-200 dark:border-zinc-800/80 text-zinc-400 dark:text-zinc-600 bg-white/40 dark:bg-zinc-900/20"
              )}
            >
              <EmptyIcon
                className={cn(
                  "w-8 h-8 mb-2 transition-all duration-200",
                  isOver
                    ? "text-indigo-600 dark:text-indigo-400 scale-110 opacity-100"
                    : "opacity-40 text-zinc-400 dark:text-zinc-500"
                )}
              />
              <p
                className={cn(
                  "text-xs font-medium mb-0.5 transition-colors",
                  isOver
                    ? "text-indigo-700 dark:text-indigo-300 font-semibold"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {isOver
                  ? "Drop task here"
                  : isFiltered
                  ? "No matching tasks"
                  : theme.emptyMessage}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-[200px]">
                {isOver
                  ? `Release to move to ${title}`
                  : isFiltered
                  ? `No tasks in ${title} match your active filters or search.`
                  : theme.emptyHint}
              </p>
              {isFiltered && onResetFilters && !isOver && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetFilters}
                  className="mt-3 text-xs h-7 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  Clear filters
                </Button>
              )}
              {!isFiltered && onQuickAddTask && !isOver && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onQuickAddTask}
                  className="mt-3 text-xs h-7 gap-1 text-zinc-600 dark:text-zinc-400 border-dashed"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Task</span>
                </Button>
              )}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
