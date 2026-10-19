import React from "react";
import type { Task } from "@/lib/db";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/Button";
import { Plus, CheckCircle2, Clock, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KanbanColumnProps {
  status: "todo" | "in-progress" | "done";
  title: string;
  tasks: Task[];
  projectMap?: Record<number, string>;
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: number, newStatus: "todo" | "in-progress" | "done") => void;
  onDeleteTask?: (taskId: number) => void;
  onQuickAddTask?: () => void;
  className?: string;
}

const COLUMN_THEMES = {
  todo: {
    accentDot: "bg-indigo-500",
    badgeBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
    emptyIcon: ListPlus,
    emptyMessage: "No tasks to do",
    emptyHint: "Add a task to get started",
  },
  "in-progress": {
    accentDot: "bg-amber-500",
    badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    emptyIcon: Clock,
    emptyMessage: "Nothing in progress",
    emptyHint: "Move tasks here when you begin working",
  },
  done: {
    accentDot: "bg-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    emptyIcon: CheckCircle2,
    emptyMessage: "No completed tasks yet",
    emptyHint: "Completed tasks will appear here",
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  projectMap = {},
  onTaskClick,
  onStatusChange,
  onDeleteTask,
  onQuickAddTask,
  className,
}) => {
  const theme = COLUMN_THEMES[status] || COLUMN_THEMES.todo;
  const EmptyIcon = theme.emptyIcon;

  return (
    <div
      data-testid={`kanban-column-${status}`}
      className={cn(
        "flex flex-col rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-3 min-w-[280px] w-full flex-1 max-h-full",
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

      {/* Cards Scroll Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 min-h-[180px]">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id ?? `${task.title}-${task.createdAt.getTime()}`}
              task={task}
              projectName={projectMap[task.projectId]}
              onClick={onTaskClick ? () => onTaskClick(task) : undefined}
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
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-6 text-center text-zinc-400 dark:text-zinc-600 bg-white/40 dark:bg-zinc-900/20">
            <EmptyIcon className="w-8 h-8 mb-2 opacity-40 text-zinc-400 dark:text-zinc-500" />
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">
              {theme.emptyMessage}
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-[200px]">
              {theme.emptyHint}
            </p>
            {onQuickAddTask && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onQuickAddTask}
                className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 h-7 px-2.5"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Task
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
