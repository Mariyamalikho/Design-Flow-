import React, { useState, useMemo } from "react";
import type { Note } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Plus,
  Pin,
  Trash2,
  FolderKanban,
  Clock,
  Filter,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Copy,
  Edit2,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

export type NoteSortOption = "updated" | "created" | "title";
export type NoteFilterTab = "all" | "pinned";

export interface NoteListSidebarProps {
  notes: Note[];
  activeNoteId: number | null;
  onSelectNote: (id: number) => void;
  onCreateNote: () => void;
  onTogglePin: (e: React.MouseEvent, note: Note) => void;
  onDeleteNote: (e: React.MouseEvent, noteId: number) => void;
  onDuplicateNote?: (note: Note) => void;
  onRenameNote?: (note: Note) => void;
  projects?: { id?: number; title: string }[];
  selectedProjectId: number | "all";
  onProjectChange: (projId: number | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const NoteListSidebar: React.FC<NoteListSidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onTogglePin,
  onDeleteNote,
  onDuplicateNote,
  onRenameNote,
  projects,
  selectedProjectId,
  onProjectChange,
  searchQuery,
  onSearchChange,
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  const [filterTab, setFilterTab] = useState<NoteFilterTab>("all");
  const [sortBy, setSortBy] = useState<NoteSortOption>("updated");

  // Project map for quick lookup
  const projectMap = useMemo(() => {
    const map = new Map<number, string>();
    projects?.forEach((p) => {
      if (p.id) map.set(p.id, p.title);
    });
    return map;
  }, [projects]);

  // Strip HTML tags for clean excerpt
  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text.length > 90 ? text.slice(0, 90) + "..." : text || "Empty note";
  };

  // Filter and sort notes
  const processedNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesProject =
          selectedProjectId === "all"
            ? true
            : note.projectId === selectedProjectId;

        const matchesSearch =
          searchQuery.trim() === "" ||
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = filterTab === "all" ? true : Boolean(note.isPinned);

        return matchesProject && matchesSearch && matchesTab;
      })
      .sort((a, b) => {
        // Pinned notes always surface to top unless sorting by title
        if (sortBy !== "title") {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
        }

        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }

        if (sortBy === "created") {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        }

        // Default 'updated'
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [notes, selectedProjectId, searchQuery, filterTab, sortBy]);

  if (isCollapsed) {
    return (
      <aside
        className={cn(
          "w-12 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-4 bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0 transition-all duration-200 select-none",
          className
        )}
        data-testid="notes-sidebar-collapsed"
        aria-label="Notes sidebar collapsed"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand notes list"
          aria-label="Expand notes list"
          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onCreateNote}
          title="New Note"
          aria-label="New Note"
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors mb-4"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto w-full px-1">
          {processedNotes.slice(0, 8).map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => note.id && onSelectNote(note.id)}
              title={note.title}
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold transition-colors",
                note.id === activeNoteId
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700"
              )}
            >
              <FileText className="w-4 h-4" />
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "w-80 md:w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0 overflow-hidden transition-all duration-200",
        className
      )}
      data-testid="notes-sidebar"
      aria-label="Notes List"
    >
      {/* Header controls: Search & Quick Filters */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-7 text-xs h-8 bg-white dark:bg-zinc-950"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Project Selector & Sort Filter Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <select
              aria-label="Filter notes by project"
              value={selectedProjectId}
              onChange={(e) =>
                onProjectChange(
                  e.target.value === "all"
                    ? "all"
                    : parseInt(e.target.value, 10)
                )
              }
              className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-7 pr-2 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Projects</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center">
            <select
              aria-label="Sort notes"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as NoteSortOption)}
              className="text-[11px] rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills (All / Pinned) */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
              filterTab === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-200/60 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400 hover:bg-zinc-200"
            )}
          >
            All Notes ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("pinned")}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1",
              filterTab === "pinned"
                ? "bg-amber-500 text-white"
                : "bg-zinc-200/60 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400 hover:bg-zinc-200"
            )}
          >
            <Pin className="w-3 h-3" />
            Pinned ({notes.filter((n) => n.isPinned).length})
          </button>
        </div>
      </div>

      {/* Notes Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2 space-y-1">
        {processedNotes.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">No notes found</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              {searchQuery
                ? "Try adjusting your search query"
                : filterTab === "pinned"
                ? "No pinned notes yet"
                : "Create a note to start jotting down ideas"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateNote}
              className="mt-3 text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Note
            </Button>
          </div>
        ) : (
          processedNotes.map((note) => {
            const isSelected = note.id === activeNoteId;
            const projectName = note.projectId
              ? projectMap.get(note.projectId)
              : null;

            return (
              <div
                key={note.id}
                onClick={() => {
                  if (note.id) {
                    onSelectNote(note.id);
                  }
                }}
                className={cn(
                  "group p-3 rounded-lg cursor-pointer transition-all border text-left relative",
                  isSelected
                    ? "bg-white dark:bg-zinc-800/90 border-indigo-200 dark:border-indigo-800/60 shadow-xs"
                    : "border-transparent hover:bg-white/60 dark:hover:bg-zinc-800/40"
                )}
                data-testid={`note-item-${note.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3
                    className={cn(
                      "text-xs font-semibold line-clamp-1 break-words",
                      isSelected
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-900 dark:text-zinc-100"
                    )}
                  >
                    {note.title || "Untitled Note"}
                  </h3>

                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => onTogglePin(e, note)}
                      title={note.isPinned ? "Unpin note" : "Pin note to top"}
                      aria-label={note.isPinned ? "Unpin note" : "Pin note to top"}
                      className={cn(
                        "p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
                        note.isPinned
                          ? "text-amber-500 fill-amber-500"
                          : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      )}
                    >
                      <Pin className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (note.id) onDeleteNote(e, note.id);
                      }}
                      title="Delete note"
                      aria-label="Delete note"
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Context dropdown menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          title="Note options"
                          aria-label="Note options"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-xs">
                        {onRenameNote && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onRenameNote(note);
                            }}
                            className="gap-2 text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                            Rename
                          </DropdownMenuItem>
                        )}
                        {onDuplicateNote && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateNote(note);
                            }}
                            className="gap-2 text-xs"
                          >
                            <Copy className="w-3.5 h-3.5 text-zinc-500" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            onTogglePin(e, note);
                          }}
                          className="gap-2 text-xs"
                        >
                          <Pin className="w-3.5 h-3.5 text-amber-500" />
                          {note.isPinned ? "Unpin from top" : "Pin to top"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            if (note.id) onDeleteNote(e, note.id);
                          }}
                          className="gap-2 text-xs text-rose-600 dark:text-rose-400 focus:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-2 break-words">
                  {getExcerpt(note.content)}
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 pt-1">
                  {projectName ? (
                    <span className="inline-flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      <FolderKanban className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[100px]">
                        {projectName}
                      </span>
                    </span>
                  ) : (
                    <span className="text-zinc-400">General</span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(note.updatedAt || note.createdAt))}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
