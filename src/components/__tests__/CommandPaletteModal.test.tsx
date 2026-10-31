import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { CommandPaletteModal } from "../CommandPaletteModal";
import { useAppStore } from "@/store/useAppStore";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    projects: {
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([
          { id: 1, title: "Lumina Brand Identity", client: "Lumina Labs", tags: ["branding"] },
        ]),
      }),
    },
    notes: {
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([
          { id: 10, title: "Typography Scale Explorations", tags: ["design"] },
        ]),
      }),
    },
    canvasNodes: {
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([
          { id: 100, title: "🎨 Design System Architecture" },
        ]),
      }),
    },
  },
}));

describe("CommandPaletteModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ isCommandPaletteOpen: true, theme: "light" });
  });

  const renderModal = (props: React.ComponentProps<typeof CommandPaletteModal> = {}) => {
    return render(
      <MemoryRouter>
        <CommandPaletteModal open={true} {...props} />
      </MemoryRouter>
    );
  };

  it("renders command palette dialog with search input and default commands", async () => {
    await act(async () => {
      renderModal();
    });

    expect(screen.getByTestId("command-palette-modal")).toBeDefined();
    expect(screen.getByTestId("command-palette-input")).toBeDefined();
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Tasks & Kanban")).toBeDefined();
    expect(screen.getByText("Notes & Brainstorm")).toBeDefined();
    expect(screen.getByText("Brainstorm Canvas")).toBeDefined();
  });

  it("does not render when open is false", () => {
    render(
      <MemoryRouter>
        <CommandPaletteModal open={false} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("command-palette-modal")).toBeNull();
  });

  it("filters commands dynamically based on search query", async () => {
    await act(async () => {
      renderModal();
    });

    const input = screen.getByTestId("command-palette-input");
    await act(async () => {
      fireEvent.change(input, { target: { value: "canvas" } });
    });

    expect(screen.getByText("Brainstorm Canvas")).toBeDefined();
    expect(screen.queryByText("Tasks & Kanban")).toBeNull();
  });

  it("displays empty state when query matches nothing", async () => {
    await act(async () => {
      renderModal();
    });

    const input = screen.getByTestId("command-palette-input");
    await act(async () => {
      fireEvent.change(input, { target: { value: "xyznonexistentquery123" } });
    });

    expect(screen.getByTestId("command-palette-empty")).toBeDefined();
    expect(screen.getByText(/No results found for/)).toBeDefined();
  });

  it("navigates to selected route when clicking a navigation command", async () => {
    const handleOpenChange = vi.fn();
    await act(async () => {
      renderModal({ onOpenChange: handleOpenChange });
    });

    const notesCmd = screen.getByTestId("command-item-nav-notes");
    await act(async () => {
      fireEvent.click(notesCmd);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/notes");
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("toggles theme when clicking theme switch action", async () => {
    await act(async () => {
      renderModal();
    });

    const themeCmd = screen.getByTestId("command-item-act-toggle-theme");
    expect(themeCmd).toBeDefined();

    await act(async () => {
      fireEvent.click(themeCmd);
    });

    expect(useAppStore.getState().theme).toBe("dark");
  });

  it("supports keyboard navigation with ArrowDown, ArrowUp, and Enter", async () => {
    const handleOpenChange = vi.fn();
    await act(async () => {
      renderModal({ onOpenChange: handleOpenChange });
    });

    const modal = screen.getByTestId("command-palette-modal");

    // Press ArrowDown to move to second item (Projects)
    await act(async () => {
      fireEvent.keyDown(modal, { key: "ArrowDown" });
    });

    // Press Enter to execute Projects
    await act(async () => {
      fireEvent.keyDown(modal, { key: "Enter" });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/projects");
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes modal when pressing Escape", async () => {
    const handleOpenChange = vi.fn();
    await act(async () => {
      renderModal({ onOpenChange: handleOpenChange });
    });

    const modal = screen.getByTestId("command-palette-modal");
    await act(async () => {
      fireEvent.keyDown(modal, { key: "Escape" });
    });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
