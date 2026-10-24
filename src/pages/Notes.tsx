import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Note } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  Trash2,
  FolderKanban,
  Clock,
  Check,
  FileText,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { TipTapEditor } from "@/components/notes/TipTapEditor";
import { MarkdownShortcutsModal } from "@/components/notes/MarkdownShortcutsModal";
import { useNoteAutoSave } from "@/hooks/useNoteAutoSave";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMPTY_NOTES: Note[] = [];

export interface NotesProps {
  embedded?: boolean;
  projectId?: number;
}

export default function Notes({ embedded = false, projectId }: NotesProps) {
  const { id: routeNoteId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [activeNoteId, setActiveNoteId] = useState<number | null>(() => {
    return routeNoteId ? parseInt(routeNoteId, 10) : null;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">(
    projectId ?? "all"
  );
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Debounced auto-save hook
  const { saveStatus, lastSaved, queueUpdate, flushSave } = useNoteAutoSave({
    noteId: activeNoteId,
    debounceMs: 500,
  });

  // Queries
  const projects = useLiveQuery(() => db.projects.toArray());
  const allNotesRaw = useLiveQuery(() => db.notes.toArray());
  const allNotes = allNotesRaw ?? EMPTY_NOTES;

  // Sync route param with state
  useEffect(() => {
    if (routeNoteId) {
      const parsed = parseInt(routeNoteId, 10);
      if (!isNaN(parsed) && parsed !== activeNoteId) {
        setActiveNoteId(parsed);
      }
    }
  }, [routeNoteId]);

  // If no note is selected and notes exist, default to the first one if not explicitly navigating away
  useEffect(() => {
    if (activeNoteId === null && allNotes.length > 0 && !routeNoteId) {
      setActiveNoteId(allNotes[0].id ?? null);
    }
  }, [allNotes, activeNoteId, routeNoteId]);

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return allNotes
      .filter((note) => {
        const matchesProject =
          selectedProjectId === "all"
            ? true
            : note.projectId === selectedProjectId;
        const matchesSearch =
          searchQuery.trim() === "" ||
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesProject && matchesSearch;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [allNotes, selectedProjectId, searchQuery]);

  const activeNote = useMemo(() => {
    return allNotes.find((n) => n.id === activeNoteId) || null;
  }, [allNotes, activeNoteId]);

  // Content statistics
  const noteStats = useMemo(() => {
    if (!activeNote?.content) {
      return { words: 0, characters: 0, readTimeMinutes: 1 };
    }
    const text = activeNote.content.replace(/<[^>]*>/g, " ").trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const characters = text.length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readTimeMinutes };
  }, [activeNote?.content]);

  // Project map for quick lookup
  const projectMap = useMemo(() => {
    const map = new Map<number, string>();
    projects?.forEach((p) => {
      if (p.id) map.set(p.id, p.title);
    });
    return map;
  }, [projects]);

  // Actions
  const handleCreateNote = async () => {
    try {
      const now = new Date();
      const defaultProjId =
        selectedProjectId === "all" ? undefined : selectedProjectId;
      const newId = await db.notes.add({
        title: "Untitled Note",
        content: "<p>Start writing your thoughts, design ideas, or project brief...</p>",
        projectId: defaultProjId,
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      });

      const numId = Number(newId);
      setActiveNoteId(numId);
      if (!embedded) {
        navigate(`/notes/${numId}`);
      }
      toast.success("New note created");
    } catch (err) {
      console.error("Failed to create note:", err);
      toast.error("Failed to create note");
    }
  };

  const handleUpdateActiveNote = (
    updates: Partial<Omit<Note, "id" | "createdAt">>
  ) => {
    queueUpdate(updates);
  };

  const handleTogglePin = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    if (!note.id) return;
    try {
      await db.notes.update(note.id, {
        isPinned: !note.isPinned,
        updatedAt: new Date(),
      });
      toast.success(note.isPinned ? "Note unpinned" : "Note pinned to top");
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: number) => {
    e.stopPropagation();
    try {
      await db.notes.delete(noteId);
      if (activeNoteId === noteId) {
        const remaining = allNotes.filter((n) => n.id !== noteId);
        const nextId = remaining.length > 0 ? remaining[0].id ?? null : null;
        setActiveNoteId(nextId);
        if (!embedded) {
          navigate(nextId ? `/notes/${nextId}` : "/notes");
        }
      }
      toast.success("Note deleted");
    } catch (err) {
      console.error("Failed to delete note:", err);
      toast.error("Failed to delete note");
    }
  };

  // Strip HTML for excerpt display
  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text.length > 90 ? text.slice(0, 90) + "..." : text || "Empty note";
  };

  return (
    <div
      className={cn(
        "flex flex-col h-[calc(100vh-4rem)] overflow-hidden",
        embedded && "h-full border rounded-xl"
      )}
      data-testid="notes-page-container"
    >
      {/* Top Header */}
      {!embedded && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Notes & Brainstorm
                <Badge variant="outline" className="text-xs font-normal">
                  {allNotes.length} {allNotes.length === 1 ? "note" : "notes"}
                </Badge>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rich text ideas, project notes, and collaborative brainstorming
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateNote}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              New Note
            </Button>
          </div>
        </div>
      )}

      {/* Main Two-Column Master-Detail Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Notes Listing */}
        <aside
          className="w-80 md:w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0 overflow-hidden"
          aria-label="Notes List"
        >
          {/* Controls: Search & Filter */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 bg-white dark:bg-zinc-950"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <select
                aria-label="Filter notes by project"
                value={selectedProjectId}
                onChange={(e) =>
                  setSelectedProjectId(
                    e.target.value === "all"
                      ? "all"
                      : parseInt(e.target.value, 10)
                  )
                }
                className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Projects</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2 space-y-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No notes found</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Create a note to start jotting down ideas"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNote}
                  className="mt-3 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Note
                </Button>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === activeNoteId;
                const projectName = note.projectId
                  ? projectMap.get(note.projectId)
                  : null;

                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      if (note.id) {
                        setActiveNoteId(note.id);
                        if (!embedded) {
                          navigate(`/notes/${note.id}`);
                        }
                      }
                    }}
                    className={cn(
                      "group p-3 rounded-lg cursor-pointer transition-all border text-left",
                      isSelected
                        ? "bg-white dark:bg-zinc-800/90 border-indigo-200 dark:border-indigo-800/60 shadow-sm"
                        : "border-transparent hover:bg-white/60 dark:hover:bg-zinc-800/40"
                    )}
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
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(e, note)}
                          title={note.isPinned ? "Unpin note" : "Pin note to top"}
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
                          onClick={(e) => note.id && handleDeleteNote(e, note.id)}
                          title="Delete note"
                          className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
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

        {/* Right Pane: Active Note Workspace */}
        <main
          className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden"
          aria-label="Active Note Editor"
        >
          {activeNote ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Note Sub-header */}
              <div className="px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 shrink-0 bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      handleUpdateActiveNote({ title: newTitle });
                    }}
                    placeholder="Note title..."
                    className="text-lg font-bold tracking-tight bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 w-full placeholder:text-zinc-400"
                    aria-label="Note title"
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Project selector for note */}
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                    <select
                      aria-label="Select note project"
                      value={activeNote.projectId ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateActiveNote({
                          projectId: val === "" ? undefined : parseInt(val, 10),
                        });
                      }}
                      className="text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 text-zinc-700 dark:text-zinc-300"
                    >
                      <option value="">No Project (General)</option>
                      {projects?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pin toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleTogglePin(e, activeNote)}
                    className={cn(
                      "h-8 px-2 text-xs gap-1",
                      activeNote.isPinned && "text-amber-500 fill-amber-500"
                    )}
                  >
                    <Pin className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {activeNote.isPinned ? "Pinned" : "Pin"}
                    </span>
                  </Button>

                  {/* Save Status Indicator */}
                  <div
                    className="flex items-center gap-1.5 text-[11px]"
                    data-testid="note-save-status"
                  >
                    {saveStatus === "saving" && (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                      </span>
                    )}
                    {saveStatus === "saved" && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Check className="w-3 h-3" /> Saved to device
                      </span>
                    )}
                    {saveStatus === "unsaved" && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{" "}
                        Unsaved changes
                      </span>
                    )}
                    {saveStatus === "idle" && (
                      <span className="flex items-center gap-1 text-zinc-400">
                        {lastSaved ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" /> Saved
                          </>
                        ) : (
                          "Auto-save on"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Note Editor Area */}
              <div
                className="flex-1 overflow-hidden flex flex-col"
                data-testid="note-editor-wrapper"
              >
                <div
                  id="note-editor-container"
                  className="flex-1 flex flex-col h-full overflow-hidden focus:outline-none"
                  data-testid="note-editor-content"
                >
                  <TipTapEditor
                    key={activeNote.id}
                    content={activeNote.content}
                    onChange={(html) => {
                      handleUpdateActiveNote({ content: html });
                    }}
                    onOpenMarkdownGuide={() => setIsShortcutsOpen(true)}
                    className="p-6 md:p-8 max-w-3xl mx-auto"
                  />
                </div>

                {/* Editor Footer Status Bar */}
                <div
                  className="px-6 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0 select-none"
                  data-testid="editor-footer-status"
                >
                  <div className="flex items-center gap-3">
                    <span>{noteStats.words} words</span>
                    <span>•</span>
                    <span>{noteStats.characters} characters</span>
                    <span>•</span>
                    <span>{noteStats.readTimeMinutes} min read</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => flushSave()}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Save immediately (Ctrl+S)"
                    >
                      Save now (Ctrl+S)
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setIsShortcutsOpen(true)}
                      className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      Shortcuts (?)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <StickyNote className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                No note selected
              </h2>
              <p className="text-xs text-zinc-500 max-w-sm mb-4">
                Select an existing note from the list on the left, or create a
                new one to start capturing your ideas.
              </p>
              <Button
                onClick={handleCreateNote}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Create Note
              </Button>
            </div>
          )}
        </main>
      </div>

      <MarkdownShortcutsModal
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </div>
  );
}
