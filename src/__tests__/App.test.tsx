import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import App from "../App";

vi.mock("@/lib/db", () => ({
  db: {
    projects: {
      count: vi.fn().mockResolvedValue(0),
      toArray: vi.fn().mockResolvedValue([]),
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    },
    tasks: {
      count: vi.fn().mockResolvedValue(0),
      toArray: vi.fn().mockResolvedValue([]),
    },
    briefs: {
      count: vi.fn().mockResolvedValue(0),
      toArray: vi.fn().mockResolvedValue([]),
    },
    notes: {
      count: vi.fn().mockResolvedValue(0),
      toArray: vi.fn().mockResolvedValue([]),
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    },
    canvasNodes: {
      count: vi.fn().mockResolvedValue(0),
      toArray: vi.fn().mockResolvedValue([]),
      limit: () => ({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    },
  },
}));

describe("App Route Code Splitting", () => {
  it("renders lazy loaded dashboard inside AppLayout", async () => {
    render(<App />);

    // TopNav search button from AppLayout should be rendered immediately
    expect(screen.getByTestId("topnav-search-button")).toBeDefined();

    // Lazy loaded dashboard content resolves within Suspense
    await waitFor(() => {
      expect(screen.getByText(/Good morning/i)).toBeDefined();
      expect(screen.getByText("Active Projects")).toBeDefined();
    });
  });
});
