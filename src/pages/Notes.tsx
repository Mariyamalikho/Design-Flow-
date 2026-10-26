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
import { NoteListSidebar } from "@/components/notes/NoteListSidebar";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        <NoteListSidebar
          notes={allNotes}
          activeNoteId={activeNoteId}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            if (!embedded) {
              navigate(`/notes/${id}`);
            }
          }}
          onCreateNote={handleCreateNote}
          onTogglePin={handleTogglePin}
          onDeleteNote={handleDeleteNote}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

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
