import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  StickyNote,
  Sparkles,
  FileText,
  Plus,
  Moon,
  Sun,
  X,
  ArrowRight,
  Folder,
  FileCode,
  Lightbulb,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAppStore } from "@/store/useAppStore";
import { db, type Project, type Note, type CanvasNodeItem } from "@/lib/db";
import { cn } from "@/lib/utils";

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: "Navigation" | "Actions" | "Projects" | "Notes" | "Ideas";
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

export interface CommandPaletteModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenCreateProject?: () => void;
  onOpenCreateNote?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  open: propOpen,
  onOpenChange: propOnOpenChange,
  onOpenCreateProject,
  onOpenCreateNote,
}) => {
  const storeOpen = useAppStore((state) => state.isCommandPaletteOpen);
  const storeSetOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const isOpen = propOpen !== undefined ? propOpen : storeOpen;
  const setOpen = propOnOpenChange !== undefined ? propOnOpenChange : storeSetOpen;

  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Dynamic search data from Dexie
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [dbNotes, setDbNotes] = useState<Note[]>([]);
  const [dbNodes, setDbNodes] = useState<CanvasNodeItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset query and selection whenever palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);

      // Fetch dynamic entities for live search
      const fetchEntities = async () => {
        try {
          const [projects, notes, nodes] = await Promise.all([
            db.projects.limit(20).toArray(),
            db.notes.limit(20).toArray(),
            db.canvasNodes.limit(20).toArray(),
          ]);
          setDbProjects(projects);
          setDbNotes(notes);
          setDbNodes(nodes);
        } catch (err) {
          console.error("Failed to fetch entities for command palette:", err);
        }
      };

      fetchEntities();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleNavigate = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate, setOpen]
  );

  // Core static navigation and action commands
  const staticCommands = useMemo<CommandItem[]>(() => {
    return [
      {
        id: "nav-dashboard",
        title: "Dashboard",
        description: "Overview metrics, active briefs, and recent deliverables",
        category: "Navigation",
        icon: LayoutDashboard,
        shortcut: "G D",
        action: () => handleNavigate("/"),
      },
      {
        id: "nav-projects",
        title: "Projects",
        description: "Browse brand projects, assets, and design moodboards",
        category: "Navigation",
        icon: FolderKanban,
        shortcut: "G P",
        action: () => handleNavigate("/projects"),
      },
      {
        id: "nav-tasks",
        title: "Tasks & Kanban",
        description: "Manage project task statuses, priorities, and timelines",
        category: "Navigation",
        icon: CheckSquare,
        shortcut: "G T",
        action: () => handleNavigate("/tasks"),
      },
      {
        id: "nav-notes",
        title: "Notes & Brainstorm",
        description: "Rich text editor, project briefs, and brainstorm memos",
        category: "Navigation",
        icon: StickyNote,
        shortcut: "G N",
        action: () => handleNavigate("/notes"),
      },
      {
        id: "nav-canvas",
        title: "Brainstorm Canvas",
        description: "Infinite visual workspace with freeform idea nodes & connections",
        category: "Navigation",
        icon: Sparkles,
        shortcut: "G C",
        action: () => handleNavigate("/canvas"),
      },
      {
        id: "nav-briefs",
        title: "Design Brief Wizard",
        description: "Create structured client questionnaires and creative guidelines",
        category: "Navigation",
        icon: FileText,
        shortcut: "G B",
        action: () => handleNavigate("/briefs"),
      },
      {
        id: "act-create-project",
        title: "Create New Project",
        description: "Initialize a new branding or graphic design workspace",
        category: "Actions",
        icon: Plus,
        shortcut: "N P",
        action: () => {
          setOpen(false);
          if (onOpenCreateProject) {
            onOpenCreateProject();
          } else {
            handleNavigate("/projects");
          }
        },
      },
      {
        id: "act-create-note",
        title: "Create New Note",
        description: "Draft a new brainstorm document or project brief",
        category: "Actions",
        icon: FileCode,
        shortcut: "N N",
        action: () => {
          setOpen(false);
          if (onOpenCreateNote) {
            onOpenCreateNote();
          } else {
            handleNavigate("/notes");
          }
        },
      },
      {
        id: "act-toggle-theme",
        title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        description: "Toggle app appearance color theme",
        category: "Actions",
        icon: theme === "dark" ? Sun : Moon,
        shortcut: "T T",
        action: () => {
          setTheme(theme === "dark" ? "light" : "dark");
          setOpen(false);
        },
      },
    ];
  }, [handleNavigate, onOpenCreateNote, onOpenCreateProject, setOpen, setTheme, theme]);

  // Combine static and dynamic matching commands based on search query
  const filteredCommands = useMemo<CommandItem[]>(() => {
    const q = query.toLowerCase().trim();

    const staticMatches = staticCommands.filter(
      (cmd) =>
        !q ||
        cmd.title.toLowerCase().includes(q) ||
        (cmd.description && cmd.description.toLowerCase().includes(q))
    );

    if (!q) {
      return staticMatches;
    }

    // Dynamic Project Matches
    const projectMatches: CommandItem[] = dbProjects
      .filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.client?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .map((p) => ({
        id: `project-${p.id}`,
        title: p.title,
        description: p.client ? `Client: ${p.client}` : "Project workspace",
        category: "Projects",
        icon: Folder,
        action: () => handleNavigate(`/projects/${p.id}`),
      }));

    // Dynamic Note Matches
    const noteMatches: CommandItem[] = dbNotes
      .filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q)) ||
          n.content?.toLowerCase().includes(q)
      )
      .map((n) => ({
        id: `note-${n.id}`,
        title: n.title,
        description: n.tags?.length ? `Tags: ${n.tags.join(", ")}` : "Project note",
        category: "Notes",
        icon: StickyNote,
        action: () => handleNavigate(`/notes/${n.id}`),
      }));

    // Dynamic Canvas Idea Node Matches
    const ideaMatches: CommandItem[] = dbNodes
      .filter(
        (node) =>
          node.title?.toLowerCase().includes(q) ||
          node.content?.toLowerCase().includes(q)
      )
      .map((node) => ({
        id: `canvas-node-${node.id}`,
        title: node.title,
        description: "Canvas idea node",
        category: "Ideas",
        icon: Lightbulb,
        action: () => handleNavigate("/canvas"),
      }));

    return [...staticMatches, ...projectMatches, ...noteMatches, ...ideaMatches];
  }, [dbNodes, dbNotes, dbProjects, handleNavigate, query, staticCommands]);

  // Keyboard navigation within command list
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev + 1 >= filteredCommands.length ? 0 : prev + 1
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev - 1 < 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const activeItem = filteredCommands[selectedIndex];
        if (activeItem) {
          activeItem.action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    },
    [filteredCommands, selectedIndex, setOpen]
  );

  // Scroll active item into view safely
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl && typeof activeEl.scrollIntoView === "function") {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Group commands by category for display
  const groupedCommands = useMemo(() => {
    const groups: Record<string, { items: CommandItem[]; startIndex: number }> = {};
    let currentIndex = 0;

    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = { items: [], startIndex: currentIndex };
      }
      groups[cmd.category].items.push(cmd);
      currentIndex++;
    });

    return groups;
  }, [filteredCommands]);

  if (!isOpen) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
          data-testid="command-palette-backdrop"
        />
        <DialogPrimitive.Content
          onKeyDown={handleKeyDown}
          className={cn(
            "fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl z-50",
            "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
            "rounded-2xl shadow-2xl overflow-hidden flex flex-col",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
          data-testid="command-palette-modal"
          aria-label="Command Palette"
        >
          {/* Header Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search projects, notes, and pages..."
              className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              data-testid="command-palette-input"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">
                ESC
              </kbd>
            )}
          </div>

          {/* Command List Body */}
          <div
            ref={listRef}
            className="max-h-[380px] overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/50"
            data-testid="command-palette-list"
          >
            {filteredCommands.length === 0 ? (
              <div
                className="py-12 text-center text-sm text-zinc-400"
                data-testid="command-palette-empty"
              >
                <p>No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Try searching for a project name, note title, or page shortcut.
                </p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, { items, startIndex }]) => (
                <div key={category} className="py-1.5 first:pt-0 last:pb-0">
                  <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((cmd, idx) => {
                      const itemIndex = startIndex + idx;
                      const isSelected = itemIndex === selectedIndex;
                      const IconComponent = cmd.icon;

                      return (
                        <div
                          key={cmd.id}
                          data-index={itemIndex}
                          data-testid={`command-item-${cmd.id}`}
                          onClick={() => cmd.action()}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={cn(
                            "group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors",
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                isSelected
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                              )}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-xs truncate block">
                                {cmd.title}
                              </span>
                              {cmd.description && (
                                <span
                                  className={cn(
                                    "text-[11px] truncate block",
                                    isSelected
                                      ? "text-indigo-600/80 dark:text-indigo-300/80"
                                      : "text-zinc-400 dark:text-zinc-500"
                                  )}
                                >
                                  {cmd.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {cmd.shortcut && (
                              <kbd
                                className={cn(
                                  "hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded border",
                                  isSelected
                                    ? "bg-indigo-100/70 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                                )}
                              >
                                {cmd.shortcut}
                              </kbd>
                            )}
                            <ArrowRight
                              className={cn(
                                "w-3 h-3 transition-transform",
                                isSelected
                                  ? "text-indigo-600 dark:text-indigo-400 translate-x-0.5 opacity-100"
                                  : "text-transparent opacity-0"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Keyboard Hints */}
          <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 flex items-center justify-between text-[11px] text-zinc-400 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-[9px]">
                  ↑
                </kbd>
                <kbd className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-[9px]">
                  ↓
                </kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-[9px]">
                  ↵
                </kbd>
                <span>select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-[9px]">
                  ESC
                </kbd>
                <span>close</span>
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 hidden sm:inline">
              DesignFlow Command Palette
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
