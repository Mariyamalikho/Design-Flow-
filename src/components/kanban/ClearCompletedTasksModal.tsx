import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Trash2, AlertTriangle } from "lucide-react";

export interface ClearCompletedTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completedCount: number;
  onConfirm: () => void;
  isClearing?: boolean;
}

export const ClearCompletedTasksModal: React.FC<ClearCompletedTasksModalProps> = ({
  open,
  onOpenChange,
  completedCount,
  onConfirm,
  isClearing = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Clear Completed Deliverables?
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                This action permanently removes completed tasks from your workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50/60 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
          You are about to delete{" "}
          <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
            {completedCount} completed {completedCount === 1 ? "task" : "tasks"}
          </strong>
          . This action cannot be undone. Are you sure you want to proceed?
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isClearing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isClearing}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isClearing ? "Clearing..." : "Clear Completed"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
