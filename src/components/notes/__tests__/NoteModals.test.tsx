import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CreateNoteModal } from "../CreateNoteModal";
import { RenameNoteModal } from "../RenameNoteModal";
import { DeleteNoteModal } from "../DeleteNoteModal";
import type { Note } from "@/lib/db";

const mockNote: Note = {
  id: 42,
  title: "Brand Voice & Guidelines",
  content: "<p>Empathetic, clear, and direct.</p>",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CreateNoteModal", () => {
  it("renders templates and form inputs when open", () => {
    render(
      <CreateNoteModal
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        projects={[{ id: 1, title: "Fintech Dashboard" }]}
      />
    );

    expect(screen.getByText("Create New Note")).toBeDefined();
    expect(screen.getByText("Blank Note")).toBeDefined();
    expect(screen.getByText("Project Brief")).toBeDefined();
    expect(screen.getByText("Meeting Notes")).toBeDefined();
    expect(screen.getByText("Brainstorming")).toBeDefined();
    expect(screen.getByLabelText("Note Title")).toBeDefined();
  });

  it("submits selected template and customized title", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateNoteModal
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    // Select Project Brief template
    fireEvent.click(screen.getByText("Project Brief"));
    expect(
      (screen.getByLabelText("Note Title") as HTMLInputElement).value
    ).toBe("Project Design Brief");

    // Click submit
    fireEvent.click(screen.getByRole("button", { name: "Create Note" }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Project Design Brief",
          content: expect.stringContaining("Project Design Brief"),
        })
      );
    });
  });
});

describe("RenameNoteModal", () => {
  it("renders current title and submits updated name", async () => {
    const handleRename = vi.fn().mockResolvedValue(undefined);
    render(
      <RenameNoteModal
        open={true}
        onOpenChange={vi.fn()}
        note={mockNote}
        onRename={handleRename}
      />
    );

    expect(screen.getByText("Rename Note")).toBeDefined();
    const input = screen.getByLabelText("Note Title") as HTMLInputElement;
    expect(input.value).toBe("Brand Voice & Guidelines");

    fireEvent.change(input, {
      target: { value: "New Brand Identity Guide" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Name" }));

    await waitFor(() => {
      expect(handleRename).toHaveBeenCalledWith(
        42,
        "New Brand Identity Guide"
      );
    });
  });
});

describe("DeleteNoteModal", () => {
  it("renders note title in confirmation and calls delete on confirm", async () => {
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <DeleteNoteModal
        open={true}
        onOpenChange={vi.fn()}
        note={mockNote}
        onConfirmDelete={handleDelete}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Delete Note" })
    ).toBeDefined();
    expect(screen.getByText("Brand Voice & Guidelines")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Delete Note" }));

    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith(42);
    });
  });
});
