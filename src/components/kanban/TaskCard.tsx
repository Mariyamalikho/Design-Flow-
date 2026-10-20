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
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FolderKanban,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskCardProps {
  task: Task;
  projectName?: string;
  onClick?: () => void;
  onStatusChange?: (newStatus: "todo" | "in-progress" | "done") => void;
  onDelete?: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
  className?: string;
}

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60",
    dotClass: "bg-rose-500",
  },
  medium: {
    label: "Medium",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
    dotClass: "bg-amber-500",
  },
  low: {
    label: "Low",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
    dotClass: "bg-emerald-500",
  },
};

const STATUS_ICONS = {
  todo: Circle,
  "in-progress": Clock,
  done: CheckCircle2,
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  projectName,
  onClick,
  onStatusChange,
  onDelete,
  isDragging = false,
  isOverlay = false,
  className,
}) => {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = STATUS_ICONS[task.status] || Circle;

  const formattedDate = React.useMemo(() => {
    try {
      const d = task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return "";
    }
  }, [task.createdAt]);

  const isDone = task.status === "done";

  return (
    <div
      role="article"
      aria-label={`Task: ${task.title}`}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-4 bg-white dark:bg-zinc-900/90 shadow-xs transition-all duration-200",
        "border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm cursor-grab active:cursor-grabbing",
        isDone && "bg-zinc-50/70 dark:bg-zinc-900/40 opacity-80",
        isDragging && "opacity-25 border-dashed border-indigo-400 dark:border-indigo-600 bg-zinc-50/50 dark:bg-zinc-900/30",
        isOverlay && "shadow-2xl ring-2 ring-indigo-500/40 rotate-1 cursor-grabbing bg-white dark:bg-zinc-900 border-indigo-400 dark:border-indigo-600 scale-[1.03] z-[999] pointer-events-none",
        onClick && "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950",
        className
      )}
    >
      {/* Top row: Priority, Project Badge & Actions Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 text-[11px] font-medium tracking-tight rounded-md flex items-center gap-1.5 shadow-none",
              priority.badgeClass
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", priority.dotClass)} />
            {priority.label}
          </Badge>

          {projectName && (
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[11px] font-normal tracking-tight text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/60 rounded-md flex items-center gap-1 max-w-[130px] truncate"
              title={projectName}
            >
              <FolderKanban className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">{projectName}</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <GripVertical className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />

          {(onStatusChange || onDelete) && (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-60 group-hover:opacity-100 transition-opacity"
                    aria-label="Task options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {onStatusChange && (
                    <>
                      <DropdownMenuLabel className="text-xs text-zinc-400 font-normal">
                        Move task to
                      </DropdownMenuLabel>
                      {task.status !== "todo" && (
                        <DropdownMenuItem onClick={() => onStatusChange("todo")}>
                          <ArrowRight className="mr-2 h-3.5 w-3.5 text-zinc-500" />
                          <span>To Do</span>
                        </DropdownMenuItem>
                      )}
                      {task.status !== "in-progress" && (
                        <DropdownMenuItem onClick={() => onStatusChange("in-progress")}>
                          <ArrowRight className="mr-2 h-3.5 w-3.5 text-amber-500" />
                          <span>In Progress</span>
                        </DropdownMenuItem>
                      )}
                      {task.status !== "done" && (
                        <DropdownMenuItem onClick={() => onStatusChange("done")}>
                          <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                          <span>Done</span>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4
        className={cn(
          "text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-3 mb-3 break-words",
          isDone && "line-through text-zinc-400 dark:text-zinc-500"
        )}
      >
        {task.title}
      </h4>

      {/* Footer Info: Status indicator & Creation Date */}
      <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-auto">
        <div className="flex items-center gap-1.5 capitalize">
          <StatusIcon
            className={cn(
              "w-3.5 h-3.5",
              task.status === "todo" && "text-zinc-400 dark:text-zinc-500",
              task.status === "in-progress" && "text-amber-500 animate-pulse",
              task.status === "done" && "text-emerald-500"
            )}
          />
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {task.status === "in-progress" ? "In Progress" : task.status === "todo" ? "To Do" : "Done"}
          </span>
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3 h-3 text-zinc-400" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};
