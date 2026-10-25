import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Note } from "@/lib/db";

export interface RenameNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onRename: (noteId: number, newTitle: string) => Promise<void>;
}

export const RenameNoteModal: React.FC<RenameNoteModalProps> = ({
  open,
  onOpenChange,
  note,
  onRename,
}) => {
  const [title, setTitle] = useState(note?.title || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note?.id || !title.trim()) return;

    try {
      setIsSubmitting(true);
      await onRename(note.id, title.trim());
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="rename-note-modal">
        <DialogHeader>
          <DialogTitle>Rename Note</DialogTitle>
          <DialogDescription>
            Enter a new title for this note.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label
              htmlFor="rename-note-title"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5"
            >
              Note Title
            </label>
            <Input
              id="rename-note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Tokens Checklist"
              autoFocus
              required
              className="text-xs"
            />
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
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim() || title === note?.title}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? "Renaming..." : "Save Name"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
