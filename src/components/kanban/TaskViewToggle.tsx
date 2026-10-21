import React from "react";
import { Kanban, ListTodo, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskViewMode = "kanban" | "list" | "timeline";

export interface TaskViewToggleProps {
  mode: TaskViewMode;
  onChange: (mode: TaskViewMode) => void;
  className?: string;
}

export const TaskViewToggle: React.FC<TaskViewToggleProps> = ({
  mode,
  onChange,
  className,
}) => {
  const options: { id: TaskViewMode; label: string; icon: React.ElementType }[] = [
    { id: "kanban", label: "Board", icon: Kanban },
    { id: "list", label: "List", icon: ListTodo },
    { id: "timeline", label: "Timeline", icon: CalendarDays },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Task view mode"
      className={cn(
        "inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 shadow-inner",
        className
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.id;

        return (
          <button
            key={option.id}
            role="radio"
            aria-checked={isActive}
            aria-label={`${option.label} view`}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              isActive
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
            )}
          >
            <Icon
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
