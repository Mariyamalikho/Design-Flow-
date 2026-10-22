import React, { useState, useEffect } from "react";
import { db, type Task } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Calendar,
  FolderKanban,
  AlertCircle,
  Clock,
  ArrowDown,
  Minus,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { triggerTaskCompletedConfetti } from "@/lib/confettiUtils";
import { cn } from "@/lib/utils";

export interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: "todo" | "in-progress" | "done";
  projectId?: number;
  projects?: { id?: number; title: string }[];
  onTaskCreated?: (task: Task) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onOpenChange,
  defaultStatus = "todo",
  projectId,
  projects = [],
  onTaskCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(defaultStatus);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    projectId ?? (projects.length > 0 ? projects[0].id : undefined)
  );
  const [dueDateStr, setDueDateStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default status and project on open
  useEffect(() => {
    if (open) {
      setStatus(defaultStatus);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDateStr("");
      if (projectId !== undefined) {
        setSelectedProjectId(projectId);
      } else if (projects.length > 0 && selectedProjectId === undefined) {
        setSelectedProjectId(projects[0].id);
      }
    }
  }, [open, defaultStatus, projectId, projects, selectedProjectId]);

  // Quick Due Date Helpers
  const handleSetPresetDate = (daysFromNow: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    setDueDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const assignedProjectId = projectId ?? selectedProjectId;
    if (!assignedProjectId) {
      toast.error("Please select a project for this task");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedDueDate = dueDateStr ? new Date(`${dueDateStr}T12:00:00`) : undefined;

      const newTaskData: Task = {
        projectId: assignedProjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: parsedDueDate,
        createdAt: new Date(),
      };

      const taskId = await db.tasks.add(newTaskData);
      const createdTask: Task = { ...newTaskData, id: taskId };

      if (status === "done") {
        triggerTaskCompletedConfetti();
      }

      toast.success("Task created and added to board");
      if (onTaskCreated) {
        onTaskCreated(createdTask);
      }

      onOpenChange(false);
      setTitle("");
      setDescription("");
      setDueDateStr("");
    } catch {
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Task</DialogTitle>
            <DialogDescription>
              Add a new actionable task card to your workflow board.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Task Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="modal-task-title"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Task Title *
              </label>
              <Input
                id="modal-task-title"
                placeholder="e.g. Export responsive logo assets"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Task Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="modal-task-desc"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between"
              >
                <span>Description / Notes</span>
                <span className="text-[11px] font-normal text-zinc-400">Optional</span>
              </label>
              <Textarea
                id="modal-task-desc"
                placeholder="Add subtasks, links, specifications, or key acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minRows={2}
                maxRows={5}
                className="text-xs"
              />
            </div>

            {/* Project Selection (if global) */}
            {projectId === undefined && (
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-task-project"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Assign to Project *</span>
                </label>
                {projects.length > 0 ? (
                  <select
                    id="modal-task-project"
                    aria-label="Assign to Project"
                    value={selectedProjectId ?? projects[0]?.id}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  >
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    No active projects found. Please create a project first.
                  </p>
                )}
              </div>
            )}

            {/* Due Date & Presets */}
            <div className="space-y-1.5">
              <label
                htmlFor="modal-task-due-date"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Due Date</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="modal-task-due-date"
                  type="date"
                  value={dueDateStr}
                  onChange={(e) => setDueDateStr(e.target.value)}
                  className="h-9 text-xs sm:w-48"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPresetDate(0)}
                    className="h-8 text-[11px] px-2.5 text-zinc-600 dark:text-zinc-400"
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPresetDate(1)}
                    className="h-8 text-[11px] px-2.5 text-zinc-600 dark:text-zinc-400"
                  >
                    Tomorrow
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPresetDate(7)}
                    className="h-8 text-[11px] px-2.5 text-zinc-600 dark:text-zinc-400"
                  >
                    Next Week
                  </Button>
                  {dueDateStr && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDueDateStr("")}
                      className="h-8 text-[11px] px-2 text-rose-600 dark:text-rose-400"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Priority Selector with Color Coding */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>Priority Level</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      id: "low",
                      label: "Low",
                      icon: ArrowDown,
                      selectedClass:
                        "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20 font-semibold",
                    },
                    {
                      id: "medium",
                      label: "Medium",
                      icon: Minus,
                      selectedClass:
                        "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 ring-2 ring-amber-500/20 font-semibold",
                    },
                    {
                      id: "high",
                      label: "High",
                      icon: Flame,
                      selectedClass:
                        "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20 font-semibold",
                    },
                  ] as const
                ).map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                        priority === p.id
                          ? p.selectedClass
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Column Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Column Status</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "todo", label: "To Do" },
                    { id: "in-progress", label: "In Progress" },
                    { id: "done", label: "Done" },
                  ] as const
                ).map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setStatus(col.id)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center",
                      status === col.id
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20 font-semibold"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
