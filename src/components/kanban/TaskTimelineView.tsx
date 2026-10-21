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
  CalendarDays,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  FolderKanban,
  Flame,
  Minus,
  ArrowDown,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskTimelineViewProps {
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

interface TimelineGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badgeClass: string;
  tasks: Task[];
}

export const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({
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
  // Categorize tasks into chronological timeline buckets
  const timelineGroups = React.useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(startOfToday.getDate() + 7);

    const overdue: Task[] = [];
    const today: Task[] = [];
    const thisWeek: Task[] = [];
    const later: Task[] = [];
    const noDueDate: Task[] = [];
    const completed: Task[] = [];

    // Sort tasks primarily by dueDate ascending, then createdAt
    const sorted = [...tasks].sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (aTime !== bTime) return aTime - bTime;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    sorted.forEach((task) => {
      if (task.status === "done") {
        completed.push(task);
        return;
      }

      if (!task.dueDate) {
        noDueDate.push(task);
        return;
      }

      const due = new Date(task.dueDate);
      if (due < startOfToday) {
        overdue.push(task);
      } else if (due <= endOfToday) {
        today.push(task);
      } else if (due <= endOfWeek) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    });

    const groups: TimelineGroup[] = [];

    if (overdue.length > 0) {
      groups.push({
        id: "overdue",
        title: "Overdue Deliverables",
        subtitle: "Tasks that missed their scheduled deadline",
        icon: AlertCircle,
        badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800",
        tasks: overdue,
      });
    }

    if (today.length > 0) {
      groups.push({
        id: "today",
        title: "Due Today",
        subtitle: "Key deliverables scheduled for completion today",
        icon: Clock,
        badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800",
        tasks: today,
      });
    }

    if (thisWeek.length > 0) {
      groups.push({
        id: "this-week",
        title: "Upcoming This Week",
        subtitle: "Planned deadlines over the next 7 days",
        icon: CalendarDays,
        badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800",
        tasks: thisWeek,
      });
    }

    if (later.length > 0) {
      groups.push({
        id: "later",
        title: "Future Milestones",
        subtitle: "Scheduled beyond this week",
        icon: Calendar,
        badgeClass: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
        tasks: later,
      });
    }

    if (noDueDate.length > 0) {
      groups.push({
        id: "unscheduled",
        title: "Unscheduled Deliverables",
        subtitle: "Backlog tasks without a target due date",
        icon: Circle,
        badgeClass: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
        tasks: noDueDate,
      });
    }

    if (completed.length > 0) {
      groups.push({
        id: "completed",
        title: "Completed Milestones",
        subtitle: "Tasks successfully wrapped up",
        icon: CheckCircle2,
        badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
        tasks: completed,
      });
    }

    return groups;
  }, [tasks]);

  const formatDueDate = (date?: Date) => {
    if (!date) return "No date";
    try {
      const d = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div
      data-testid="task-timeline-view"
      className={cn("flex flex-col space-y-8 w-full pb-12", className)}
    >
      {/* Timeline Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Deliverable Timeline
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chronological schedule across {timelineGroups.length} timeline milestones
            </p>
          </div>
        </div>

        {onQuickAddTask && (
          <Button
            size="sm"
            onClick={onQuickAddTask}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Deliverable
          </Button>
        )}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div
          data-testid="timeline-empty"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-12 text-center bg-white/40 dark:bg-zinc-900/20"
        >
          <CalendarDays className="w-10 h-10 mb-3 opacity-30 text-zinc-400 dark:text-zinc-500" />
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            {isFiltered ? "No matching timeline deliverables" : "Timeline is empty"}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            {isFiltered
              ? "No tasks match your current active filters and search criteria."
              : "Set target due dates on tasks to visualize your project roadmap chronologically."}
          </p>
          {isFiltered && onResetFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset filters
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

      {/* Timeline Groups */}
      {timelineGroups.map((group) => {
        const GroupIcon = group.icon;

        return (
          <div
            key={group.id}
            data-testid={`timeline-group-${group.id}`}
            className="space-y-4"
          >
            {/* Group Header Badge */}
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs",
                  group.badgeClass
                )}
              >
                <GroupIcon className="w-3.5 h-3.5" />
                <span>{group.title}</span>
                <span className="opacity-75">({group.tasks.length})</span>
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                {group.subtitle}
              </span>
            </div>

            {/* Vertical Timeline Track */}
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {group.tasks.map((task) => {
                const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const PriorityIcon = priority.icon;
                const projectName = projectMap[task.projectId];
                const isDone = task.status === "done";
                const isOverdue = group.id === "overdue";

                return (
                  <div
                    key={task.id}
                    data-testid={`timeline-item-${task.id}`}
                    className="relative group"
                  >
                    {/* Node Dot on Timeline Track */}
                    <div
                      className={cn(
                        "absolute -left-6 sm:-left-8 top-3.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 transition-transform group-hover:scale-125 z-10",
                        isDone
                          ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                          : isOverdue
                          ? "bg-rose-500 ring-2 ring-rose-500/30 animate-pulse"
                          : group.id === "today"
                          ? "bg-amber-500 ring-2 ring-amber-500/20"
                          : "bg-indigo-500 ring-2 ring-indigo-500/20"
                      )}
                    />

                    {/* Timeline Item Card */}
                    <div
                      className={cn(
                        "p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:shadow-sm transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                        isDone && "opacity-75 bg-zinc-50/50 dark:bg-zinc-900/30"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <button
                            type="button"
                            onClick={() => onEditTask?.(task)}
                            className={cn(
                              "text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left",
                              isDone && "line-through text-zinc-400 dark:text-zinc-500"
                            )}
                          >
                            <HighlightMatch text={task.title} query={searchQuery} />
                          </button>

                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border",
                              priority.badgeClass
                            )}
                          >
                            <PriorityIcon className="w-2.5 h-2.5" />
                            <span>{priority.label}</span>
                          </span>

                          {task.status === "in-progress" && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 font-medium"
                            >
                              In Progress
                            </Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">
                            <HighlightMatch text={task.description} query={searchQuery} />
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500 flex-wrap">
                          {projectName && (
                            <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                              <FolderKanban className="w-3 h-3 text-zinc-400" />
                              <span className="font-medium truncate max-w-[140px]">
                                {projectName}
                              </span>
                            </span>
                          )}

                          {task.dueDate && (
                            <span
                              className={cn(
                                "flex items-center gap-1 font-medium",
                                isOverdue
                                  ? "text-rose-600 dark:text-rose-400 font-semibold"
                                  : "text-zinc-500 dark:text-zinc-400"
                              )}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{formatDueDate(task.dueDate)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action Menu */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {onEditTask && (
                          <button
                            type="button"
                            aria-label="Edit deliverable"
                            onClick={() => onEditTask(task)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Timeline task actions"
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs">Update Status</DropdownMenuLabel>
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
                              Mark Completed
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
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
