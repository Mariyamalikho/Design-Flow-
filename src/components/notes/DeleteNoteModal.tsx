import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
import type { Note } from "@/lib/db";

export interface DeleteNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onConfirmDelete: (noteId: number) => Promise<void>;
}

export const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({
  open,
  onOpenChange,
  note,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!note?.id) return;
    try {
      setIsDeleting(true);
      await onConfirmDelete(note.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="delete-note-modal">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Delete Note</DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Are you sure you want to permanently delete this note?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-xs text-zinc-600 dark:text-zinc-400">
          <p className="mb-2">
            You are about to delete &quot;<strong className="text-zinc-900 dark:text-zinc-100">{note?.title || "Untitled Note"}</strong>&quot;.
          </p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400">
            This action cannot be undone and will remove the note from your local database.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
