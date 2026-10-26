import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { NoteListSidebar } from "../NoteListSidebar";
import type { Note } from "@/lib/db";

const mockNotes: Note[] = [
  {
    id: 1,
    projectId: 10,
    title: "Typography Rules",
    content: "<p>Headings must use Playfair Display and body should use Inter.</p>",
    isPinned: true,
    createdAt: new Date("2026-10-24T10:00:00Z"),
    updatedAt: new Date("2026-10-24T12:00:00Z"),
  },
  {
    id: 2,
    projectId: 20,
    title: "Color Palette Contrast",
    content: "<p>Check WCAG AAA standards for deep indigo and slate.</p>",
    isPinned: false,
    createdAt: new Date("2026-10-24T11:00:00Z"),
    updatedAt: new Date("2026-10-24T11:30:00Z"),
  },
];

const mockProjects = [
  { id: 10, title: "Fintech App" },
  { id: 20, title: "Design System" },
];

describe("NoteListSidebar", () => {
  it("renders search input, project filter, and list of notes", () => {
    render(
      <NoteListSidebar
        notes={mockNotes}
        activeNoteId={1}
        onSelectNote={vi.fn()}
        onCreateNote={vi.fn()}
        onTogglePin={vi.fn()}
        onDeleteNote={vi.fn()}
        projects={mockProjects}
        selectedProjectId="all"
        onProjectChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText("Search notes...")).toBeDefined();
    expect(screen.getByText("Typography Rules")).toBeDefined();
    expect(screen.getByText("Color Palette Contrast")).toBeDefined();
    expect(screen.getAllByText("Fintech App").length).toBeGreaterThan(0);
  });

  it("triggers onSelectNote when clicking a note item", () => {
    const handleSelect = vi.fn();
    render(
      <NoteListSidebar
        notes={mockNotes}
        activeNoteId={1}
        onSelectNote={handleSelect}
        onCreateNote={vi.fn()}
        onTogglePin={vi.fn()}
        onDeleteNote={vi.fn()}
        projects={mockProjects}
        selectedProjectId="all"
        onProjectChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Color Palette Contrast"));
    expect(handleSelect).toHaveBeenCalledWith(2);
  });

  it("filters to pinned notes when clicking the Pinned tab", () => {
    render(
      <NoteListSidebar
        notes={mockNotes}
        activeNoteId={1}
        onSelectNote={vi.fn()}
        onCreateNote={vi.fn()}
        onTogglePin={vi.fn()}
        onDeleteNote={vi.fn()}
        projects={mockProjects}
        selectedProjectId="all"
        onProjectChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
      />
    );

    const pinnedTab = screen.getByRole("button", { name: /Pinned/i });
    fireEvent.click(pinnedTab);

    expect(screen.getByText("Typography Rules")).toBeDefined();
    expect(screen.queryByText("Color Palette Contrast")).toBeNull();
  });

  it("sorts notes by title alphabetically when selected", () => {
    render(
      <NoteListSidebar
        notes={mockNotes}
        activeNoteId={1}
        onSelectNote={vi.fn()}
        onCreateNote={vi.fn()}
        onTogglePin={vi.fn()}
        onDeleteNote={vi.fn()}
        projects={mockProjects}
        selectedProjectId="all"
        onProjectChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
      />
    );

    const sortSelect = screen.getByRole("combobox", { name: "Sort notes" });
    fireEvent.change(sortSelect, { target: { value: "title" } });

    const noteItems = screen.getAllByTestId(/note-item-/);
    // "Color Palette Contrast" starts with C, so should come before "Typography Rules"
    expect(noteItems[0].textContent).toContain("Color Palette Contrast");
    expect(noteItems[1].textContent).toContain("Typography Rules");
  });

  it("renders collapsed mode when isCollapsed is true", () => {
    const handleToggleCollapse = vi.fn();
    render(
      <NoteListSidebar
        notes={mockNotes}
        activeNoteId={1}
        onSelectNote={vi.fn()}
        onCreateNote={vi.fn()}
        onTogglePin={vi.fn()}
        onDeleteNote={vi.fn()}
        projects={mockProjects}
        selectedProjectId="all"
        onProjectChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        isCollapsed={true}
        onToggleCollapse={handleToggleCollapse}
      />
    );

    expect(screen.getByTestId("notes-sidebar-collapsed")).toBeDefined();
    expect(screen.queryByPlaceholderText("Search notes...")).toBeNull();

    const expandBtn = screen.getByRole("button", { name: "Expand notes list" });
    fireEvent.click(expandBtn);
    expect(handleToggleCollapse).toHaveBeenCalledTimes(1);
  });
});
