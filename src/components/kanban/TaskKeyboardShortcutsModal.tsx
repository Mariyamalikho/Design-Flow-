import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Keyboard } from "lucide-react";

export interface TaskKeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

const GLOBAL_SHORTCUTS: ShortcutItem[] = [
  { keys: ["N", "C"], description: "Create new task" },
  { keys: ["/"], description: "Quick search tasks" },
  { keys: ["B"], description: "Switch to Board (Kanban) view" },
  { keys: ["L"], description: "Switch to List view" },
  { keys: ["T"], description: "Switch to Timeline view" },
  { keys: ["?"], description: "Open keyboard shortcuts help" },
  { keys: ["Esc"], description: "Clear search / Close modal" },
];

const CARD_SHORTCUTS: ShortcutItem[] = [
  { keys: ["Enter", "Space"], description: "Edit focused task" },
  { keys: ["1"], description: "Move task to 'To Do'" },
  { keys: ["2"], description: "Move task to 'In Progress'" },
  { keys: ["3"], description: "Move task to 'Done'" },
  { keys: ["→", "L"], description: "Shift task to next column" },
  { keys: ["←", "H"], description: "Shift task to previous column" },
  { keys: ["Del", "Backspace"], description: "Delete focused task" },
];

export const TaskKeyboardShortcutsModal: React.FC<TaskKeyboardShortcutsModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Speed up your task management with keyboard controls
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Global Shortcuts Section */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
              Global Navigation
            </h4>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden bg-zinc-50/40 dark:bg-zinc-900/30">
              {GLOBAL_SHORTCUTS.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2 text-xs"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        {kIdx > 0 && (
                          <span className="text-[10px] text-zinc-400">or</span>
                        )}
                        <kbd className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                          {k}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Focused Task Card Section */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
              Focused Task Card (Tab or Click to Focus)
            </h4>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden bg-zinc-50/40 dark:bg-zinc-900/30">
              {CARD_SHORTCUTS.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2 text-xs"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        {kIdx > 0 && (
                          <span className="text-[10px] text-zinc-400">or</span>
                        )}
                        <kbd className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                          {k}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
