import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, HelpCircle } from "lucide-react";

export interface MarkdownShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  syntax: string;
  action: string;
  example: string;
}

const SHORTCUTS: { category: string; items: ShortcutItem[] }[] = [
  {
    category: "Headings & Structure",
    items: [
      { syntax: "# Space", action: "Heading 1", example: "# Project Overview" },
      { syntax: "## Space", action: "Heading 2", example: "## Target Audience" },
      { syntax: "### Space", action: "Heading 3", example: "### Design Tokens" },
      { syntax: "---", action: "Divider Rule", example: "---" },
    ],
  },
  {
    category: "Inline Formatting",
    items: [
      { syntax: "**text**", action: "Bold Text", example: "**Key Insight**" },
      { syntax: "*text*", action: "Italic Text", example: "*User emphasis*" },
      { syntax: "~~text~~", action: "Strikethrough", example: "~~Deprecated~~" },
      { syntax: "`code`", action: "Inline Code", example: "`const brand = 'flow'`" },
    ],
  },
  {
    category: "Lists & Quotations",
    items: [
      { syntax: "- Space", action: "Bullet List", example: "- User research item" },
      { syntax: "* Space", action: "Bullet List", example: "* Design sprint goal" },
      { syntax: "1. Space", action: "Numbered List", example: "1. Ideation phase" },
      { syntax: "> Space", action: "Blockquote", example: "> Good design is obvious." },
      { syntax: "``` Space", action: "Code Block", example: "```css ... ```" },
    ],
  },
];

export const MarkdownShortcutsModal: React.FC<MarkdownShortcutsModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl max-h-[85vh] overflow-y-auto"
        data-testid="markdown-shortcuts-modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Markdown & Editor Shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Type standard Markdown syntax to format rich notes instantly without taking your hands off the keyboard.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {SHORTCUTS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {group.category}
              </h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden">
                {group.items.map((item) => (
                  <div
                    key={item.syntax}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <code className="px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                        {item.syntax}
                      </code>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {item.action}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                      {item.example}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>Tip:</strong> Press <Badge variant="outline" className="text-[10px] py-0 px-1 mx-1 font-mono">Ctrl + S</Badge> at any time to immediately save changes to your browser&apos;s IndexedDB.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
