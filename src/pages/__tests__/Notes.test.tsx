import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import React from "react";
import Notes from "../Notes";
import type { Note, Project } from "@/lib/db";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "1" }),
  useNavigate: () => mockNavigate,
}));

const { mockProjects, mockNotes } = vi.hoisted(() => {
  const mockProjects: Project[] = [
    {
      id: 1,
      title: "Mobile App Redesign",
      description: "New UX/UI design",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: "Brand Identity",
      description: "Logo & Guidelines",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockNotes: Note[] = [
    {
      id: 1,
      projectId: 1,
      title: "Design System Tokens",
      content: "<p>Color palette and typography scale definitions for the design system.</p>",
      isPinned: true,
      createdAt: new Date("2026-10-24T10:00:00Z"),
      updatedAt: new Date("2026-10-24T10:30:00Z"),
    },
    {
      id: 2,
      projectId: 2,
      title: "Marketing Copy Ideas",
      content: "<p>Brainstorming catchy headlines and value propositions.</p>",
      isPinned: false,
      createdAt: new Date("2026-10-24T11:00:00Z"),
      updatedAt: new Date("2026-10-24T11:15:00Z"),
    },
  ];

  return { mockProjects, mockNotes };
});

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (fn: () => unknown) => {
    const queryStr = fn.toString();
    if (queryStr.includes("db.projects")) {
      return mockProjects;
    }
    return mockNotes;
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    projects: {
      toArray: vi.fn().mockResolvedValue(mockProjects),
    },
    notes: {
      toArray: vi.fn().mockResolvedValue(mockNotes),
      add: vi.fn().mockResolvedValue(3),
      update: vi.fn().mockResolvedValue(1),
      delete: vi.fn().mockResolvedValue(1),
    },
  },
}));

describe("Notes Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Notes page header, search input, and master-detail layout", () => {
    render(<Notes />);

    expect(
      screen.getByRole("heading", { name: /Notes & Brainstorm/i })
    ).toBeDefined();
    expect(screen.getByPlaceholderText("Search notes...")).toBeDefined();
    expect(screen.getByText("Design System Tokens")).toBeDefined();
    expect(screen.getByText("Marketing Copy Ideas")).toBeDefined();
  });

  it("displays note details and content in active editor pane", () => {
    render(<Notes />);

    const titleInput = screen.getByDisplayValue("Design System Tokens");
    expect(titleInput).toBeDefined();

    const editorWrapper = screen.getByTestId("note-editor-wrapper");
    expect(
      within(editorWrapper).getByText(/Color palette and typography scale definitions/i)
    ).toBeDefined();
  });

  it("filters notes list based on search query", () => {
    render(<Notes />);

    const searchInput = screen.getByPlaceholderText("Search notes...");
    fireEvent.change(searchInput, { target: { value: "Marketing" } });

    expect(screen.queryByText("Design System Tokens")).toBeNull();
    expect(screen.getByText("Marketing Copy Ideas")).toBeDefined();
  });

  it("filters notes list based on selected project", () => {
    render(<Notes />);

    const projectSelect = screen.getByRole("combobox", {
      name: "Filter notes by project",
    }) as HTMLSelectElement;

    // Filter by Brand Identity (id: 2)
    fireEvent.change(projectSelect, { target: { value: "2" } });

    expect(screen.queryByText("Design System Tokens")).toBeNull();
    expect(screen.getByText("Marketing Copy Ideas")).toBeDefined();
  });

  it("creates a new note when clicking New Note button", async () => {
    const { db } = await import("@/lib/db");
    render(<Notes />);

    const newNoteButtons = screen.getAllByRole("button", {
      name: /New Note/i,
    });
    fireEvent.click(newNoteButtons[0]);

    // Modal opens; submit creation
    const submitBtn = screen.getByRole("button", { name: "Create Note" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(db.notes.add).toHaveBeenCalledTimes(1);
    });
  });

  it("allows updating note title in active editor pane", async () => {
    const { db } = await import("@/lib/db");
    render(<Notes />);

    const titleInput = screen.getByDisplayValue("Design System Tokens");
    fireEvent.change(titleInput, { target: { value: "Updated Tokens Title" } });

    await waitFor(
      () => {
        expect(db.notes.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            title: "Updated Tokens Title",
          })
        );
      },
      { timeout: 2000 }
    );
  });

  it("renders content statistics and save status in active editor", () => {
    render(<Notes />);

    expect(screen.getByTestId("note-save-status")).toBeDefined();
    expect(screen.getByTestId("editor-footer-status")).toBeDefined();
    expect(screen.getByText(/words/i)).toBeDefined();
    expect(screen.getByText(/characters/i)).toBeDefined();
  });

  it("toggles pin status on note", async () => {
    const { db } = await import("@/lib/db");
    render(<Notes />);

    const pinButtons = screen.getAllByTitle(/pin note/i);
    fireEvent.click(pinButtons[0]);

    await waitFor(() => {
      expect(db.notes.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          isPinned: false,
        })
      );
    });
  });

  it("deletes note on delete button click", async () => {
    const { db } = await import("@/lib/db");
    render(<Notes />);

    const deleteButtons = screen.getAllByTitle("Delete note");
    fireEvent.click(deleteButtons[0]);

    // Modal opens; confirm deletion
    const confirmDeleteBtn = screen.getByRole("button", {
      name: "Delete Note",
    });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(db.notes.delete).toHaveBeenCalledWith(1);
    });
  });
});
