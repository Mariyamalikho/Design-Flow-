import React from "react";
import type { Task } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  CheckCircle2,
  Circle,
  Clock,
  FolderKanban,
  MoreHorizontal,
  Trash2,
  Flame,
  Minus,
  ArrowDown,
  Calendar,
  Pencil,
  Plus,
  RotateCcw,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskListViewProps {
  tasks: Task[];
  projectMap?: Record<number, string>;
  searchQuery?: string;
  onStatusChange?: (taskId: number, nextStatus: "todo" | "in-progress" | "done") => void;
  onDeleteTask?: (taskId: number) => void;
  onEditTask?: (task: Task) => void;
  onQuickAddTask?: () => void;
  isFiltered?: boolean;
  onResetFilters?: () => void;
  className?: string;
}

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/60 font-semibold",
    icon: Flame,
  },
  medium: {
    label: "Medium",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/60 font-medium",
    icon: Minus,
  },
  low: {
    label: "Low",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/60",
    icon: ArrowDown,
  },
};

const STATUS_GROUPS: {
  status: "todo" | "in-progress" | "done";
  label: string;
  icon: React.ElementType;
  colorClass: string;
}[] = [
  {
    status: "todo",
    label: "To Do",
    icon: Circle,
    colorClass: "text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700",
  },
  {
    status: "in-progress",
    label: "In Progress",
    icon: Clock,
    colorClass: "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  },
  {
    status: "done",
    label: "Done",
    icon: CheckCircle2,
    colorClass: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
];

function HighlightMatch({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim() || !text) {
    return <>{text}</>;
  }

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-200/90 dark:bg-amber-900/60 text-zinc-900 dark:text-amber-100 rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  projectMap = {},
  searchQuery = "",
  onStatusChange,
  onDeleteTask,
  onEditTask,
  onQuickAddTask,
  isFiltered = false,
  onResetFilters,
  className,
}) => {
  // Compute group counts
  const completedCount = React.useMemo(
    () => tasks.filter((t) => t.status === "done").length,
    [tasks]
  );
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Due Date calculation helper
  const getDueDateInfo = (dueDate?: Date) => {
    if (!dueDate) return null;
    try {
      const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

      const diffDays = Math.round(
        (dueDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
      );

      const formatted = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(due);

      if (diffDays < 0) {
        return {
          text: `Overdue (${Math.abs(diffDays)}d)`,
          formatted,
          isOverdue: true,
          badgeClass:
            "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50",
        };
      }
      if (diffDays === 0) {
        return {
          text: "Due Today",
          formatted,
          isOverdue: false,
          badgeClass:
            "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 font-medium",
        };
      }
      if (diffDays === 1) {
        return {
          text: "Due Tomorrow",
          formatted,
          isOverdue: false,
          badgeClass:
            "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50",
        };
      }
      return {
        text: formatted,
        formatted,
        isOverdue: false,
        badgeClass:
          "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
      };
    } catch {
      return null;
    }
  };

  const handleToggleDone = (task: Task) => {
    if (!onStatusChange || !task.id) return;
    const nextStatus = task.status === "done" ? "todo" : "done";
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div
      data-testid="task-list-view"
      className={cn("flex flex-col space-y-6 w-full pb-8", className)}
    >
      {/* Progress & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              List Overview
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {completedCount} of {totalCount} tasks completed ({progressPercent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 min-w-[200px] flex-1 sm:flex-initial">
          <div className="w-full sm:w-48 bg-zinc-200/70 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {onQuickAddTask && (
            <Button
              size="sm"
              onClick={onQuickAddTask}
              className="gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div
          data-testid="task-list-empty"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-12 text-center bg-white/40 dark:bg-zinc-900/20"
        >
          <ListTodo className="w-10 h-10 mb-3 opacity-30 text-zinc-400 dark:text-zinc-500" />
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            {isFiltered ? "No matching tasks found" : "No tasks created yet"}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            {isFiltered
              ? "Try adjusting your search query, priority filters, or status selection."
              : "Organize your project workflow by adding your first task to the list."}
          </p>
          {isFiltered && onResetFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear filters
            </Button>
          ) : (
            onQuickAddTask && (
              <Button size="sm" onClick={onQuickAddTask} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add your first task
              </Button>
            )
          )}
        </div>
      )}

      {/* Grouped Status Sections */}
      {tasks.length > 0 &&
        STATUS_GROUPS.map((group) => {
          const groupTasks = tasks.filter((t) => t.status === group.status);
          const GroupIcon = group.icon;

          return (
            <div
              key={group.status}
              data-testid={`task-list-group-${group.status}`}
              className="space-y-3"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <GroupIcon className={cn("w-4 h-4", group.colorClass)} />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    {group.label}
                  </h4>
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700/60">
                    {groupTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Items */}
              {groupTasks.length === 0 ? (
                <div className="py-4 px-4 rounded-xl border border-dashed border-zinc-200/70 dark:border-zinc-800/60 text-xs text-zinc-400 dark:text-zinc-500 text-center bg-zinc-50/30 dark:bg-zinc-900/10">
                  No tasks in {group.label}
                </div>
              ) : (
                <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs overflow-hidden">
                  {groupTasks.map((task) => {
                    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    const PriorityIcon = priority.icon;
                    const projectName = projectMap[task.projectId];
                    const dueDate = getDueDateInfo(task.dueDate);
                    const isDone = task.status === "done";

                    return (
                      <div
                        key={task.id}
                        data-testid={`task-list-item-${task.id}`}
                        className={cn(
                          "group flex items-center justify-between p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors gap-3",
                          isDone && "bg-zinc-50/40 dark:bg-zinc-900/20"
                        )}
                      >
                        {/* Left: Checkbox & Title */}
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            aria-label={`Mark task as ${isDone ? "incomplete" : "complete"}`}
                            onClick={() => handleToggleDone(task)}
                            className={cn(
                              "mt-0.5 sm:mt-0 w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                              isDone
                                ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500"
                                : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-400 bg-white dark:bg-zinc-800"
                            )}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <div
                            onClick={() => onEditTask?.(task)}
                            className="min-w-0 flex-1 cursor-pointer"
                          >
                            <p
                              className={cn(
                                "text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors",
                                isDone && "line-through text-zinc-400 dark:text-zinc-500"
                              )}
                            >
                              <HighlightMatch text={task.title} query={searchQuery} />
                            </p>
                            {task.description && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                <HighlightMatch text={task.description} query={searchQuery} />
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Middle: Badges (Project, Priority, Due Date) */}
                        <div className="hidden md:flex items-center gap-2 shrink-0">
                          {projectName && (
                            <Badge
                              variant="outline"
                              className="text-[11px] font-normal text-zinc-600 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/60 gap-1"
                            >
                              <FolderKanban className="w-3 h-3 text-zinc-400" />
                              <span className="max-w-[120px] truncate">{projectName}</span>
                            </Badge>
                          )}

                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border",
                              priority.badgeClass
                            )}
                          >
                            <PriorityIcon className="w-3 h-3" />
                            <span>{priority.label}</span>
                          </span>

                          {dueDate && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border",
                                dueDate.badgeClass
                              )}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{dueDate.text}</span>
                            </span>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {onEditTask && (
                            <button
                              type="button"
                              aria-label="Edit task"
                              onClick={() => onEditTask(task)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Status Dropdown Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Task options"
                                className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel className="text-xs">Change Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(task.id!, "todo")}
                                disabled={task.status === "todo"}
                                className="gap-2 text-xs"
                              >
                                <Circle className="w-3.5 h-3.5 text-zinc-400" />
                                To Do
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(task.id!, "in-progress")}
                                disabled={task.status === "in-progress"}
                                className="gap-2 text-xs"
                              >
                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(task.id!, "done")}
                                disabled={task.status === "done"}
                                className="gap-2 text-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Done
                              </DropdownMenuItem>

                              {onDeleteTask && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDeleteTask(task.id!)}
                                    className="gap-2 text-xs text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Task
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
