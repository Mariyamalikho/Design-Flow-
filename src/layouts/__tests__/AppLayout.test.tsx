import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "../AppLayout";
import { useAppStore } from "@/store/useAppStore";

vi.mock("@/lib/db", () => ({
  db: {
    projects: {
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    },
    notes: {
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    },
    canvasNodes: {
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    },
  },
}));

describe("AppLayout with Command Palette integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ isCommandPaletteOpen: false });
  });

  const renderAppLayout = () => {
    return render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<div>Dashboard Page Content</div>} />
            <Route path="projects" element={<div>Projects Page Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders main layout and outlet page content", () => {
    renderAppLayout();

    expect(screen.getByText("Dashboard Page Content")).toBeDefined();
    expect(screen.getByTestId("topnav-search-button")).toBeDefined();
  });

  it("opens Command Palette when Cmd+K keyboard shortcut is pressed globally", async () => {
    renderAppLayout();

    expect(screen.queryByTestId("command-palette-modal")).toBeNull();

    await act(async () => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(screen.getByTestId("command-palette-modal")).toBeDefined();
  });

  it("links command palette to core routes and navigates to Projects page", async () => {
    renderAppLayout();

    // Trigger Cmd+K
    await act(async () => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    const projectsCmd = screen.getByTestId("command-item-nav-projects");
    await act(async () => {
      fireEvent.click(projectsCmd);
    });

    // Navigated to projects route!
    expect(screen.getByText("Projects Page Content")).toBeDefined();
    expect(useAppStore.getState().isCommandPaletteOpen).toBe(false);
  });
});
