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
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface EditTaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects?: { id?: number; title: string }[];
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: number) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  open,
  onOpenChange,
  projects = [],
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [dueDateStr, setDueDateStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state whenever task or modal visibility changes
  useEffect(() => {
    if (open && task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setStatus(task.status || "todo");
      setSelectedProjectId(task.projectId);
      setShowDeleteConfirm(false);

      if (task.dueDate) {
        try {
          const d = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          setDueDateStr(`${yyyy}-${mm}-${dd}`);
        } catch {
          setDueDateStr("");
        }
      } else {
        setDueDateStr("");
      }
    }
  }, [open, task]);

  // Quick preset date helpers
  const handleSetPresetDate = (daysFromNow: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    setDueDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task?.id) return;

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedDueDate = dueDateStr ? new Date(`${dueDateStr}T12:00:00`) : undefined;

      const updatePayload: Partial<Task> = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: parsedDueDate,
        projectId: selectedProjectId ?? task.projectId,
      };

      await db.tasks.update(task.id, updatePayload);
      const updatedTask: Task = { ...task, ...updatePayload };

      toast.success("Task updated successfully");
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await db.tasks.delete(task.id);
      toast.success("Task deleted");
      if (onTaskDeleted) {
        onTaskDeleted(task.id);
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleUpdate}>
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Task</DialogTitle>
            <DialogDescription>
              Modify task details, priority, due date, and board column status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Task Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-task-title"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Task Title *
              </label>
              <Input
                id="edit-task-title"
                placeholder="e.g. Redesign mobile navigation bar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Task Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-task-desc"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between"
              >
                <span>Description / Notes</span>
                <span className="text-[11px] font-normal text-zinc-400">Optional</span>
              </label>
              <Textarea
                id="edit-task-desc"
                placeholder="Add subtasks, links, specifications, or key acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minRows={2}
                maxRows={5}
                className="text-xs"
              />
            </div>

            {/* Project Selection (if projects available) */}
            {projects.length > 0 && (
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-task-project"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Assigned Project</span>
                </label>
                <select
                  id="edit-task-project"
                  aria-label="Assigned Project"
                  value={selectedProjectId ?? task.projectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Due Date & Presets */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-task-due-date"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Due Date</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="edit-task-due-date"
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

            {/* Delete Confirmation Box (if active) */}
            {showDeleteConfirm && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 animate-in fade-in duration-150">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                    Are you sure you want to delete this task?
                  </h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                    This action cannot be undone. All data associated with this task card will be removed.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete Task"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-7 text-xs text-zinc-600 dark:text-zinc-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 text-xs h-9"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
