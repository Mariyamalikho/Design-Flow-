import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Moodboard } from "../Moodboard";

// Mock ResizeObserver for jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock html2canvas & export utils
vi.mock("@/lib/exportUtils", () => ({
  exportElementToFile: vi.fn().mockResolvedValue(true),
}));

// Mock ColorPaletteModal & ImagePreviewModal
vi.mock("../ColorPaletteModal", () => ({
  ColorPaletteModal: ({ open, imageUrl }: any) =>
    open ? <div data-testid="mock-color-palette-modal">Palette: {imageUrl}</div> : null,
}));

vi.mock("../ImagePreviewModal", () => ({
  ImagePreviewModal: ({ open, url }: any) =>
    open ? <div data-testid="mock-preview-modal">Preview: {url}</div> : null,
}));

const { mockItems } = vi.hoisted(() => {
  return {
    mockItems: [
      {
        id: 1,
        projectId: 101,
        type: "image",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        title: "Pavilion Concrete",
        scale: "medium",
        order: 0,
        createdAt: new Date(),
      },
      {
        id: 2,
        projectId: 101,
        type: "note",
        content: "Material Texture: Travertine limestone and charred oak.",
        color: "bg-amber-100 text-amber-900 border-amber-200",
        scale: "medium",
        order: 1,
        createdAt: new Date(),
      },
    ],
  };
});

let currentMockItems = [...mockItems];

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (queryFn: () => unknown) => {
    const fnStr = queryFn.toString();
    if (fnStr.includes("db.assets")) {
      return [];
    }
    return currentMockItems;
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    moodboardItems: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          sortBy: vi.fn().mockImplementation(() => Promise.resolve(currentMockItems)),
        }),
      }),
      add: vi.fn().mockResolvedValue(3),
      delete: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(1),
      bulkPut: vi.fn().mockResolvedValue(undefined),
    },
    assets: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
      add: vi.fn().mockResolvedValue(1),
    },
  },
}));

describe("Moodboard Studio Component", () => {
  const projectId = 101;

  beforeEach(() => {
    vi.clearAllMocks();
    currentMockItems = [...mockItems];
  });

  it("renders Studio Moodboard toolbar with Upload Pictures action and Pinboard mode toggle", () => {
    render(<Moodboard projectId={projectId} />);

    expect(screen.getByText("Studio Moodboard")).toBeInTheDocument();
    expect(screen.getByText("Upload Pictures")).toBeInTheDocument();
    expect(screen.getByText("Pinboard")).toBeInTheDocument();
    expect(screen.getByText("Grid")).toBeInTheDocument();
    expect(screen.getByText("Add URL")).toBeInTheDocument();
    expect(screen.getByText("Add Note")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("renders items in tactile studio pinboard layout mode with title and palette button", () => {
    render(<Moodboard projectId={projectId} />);

    expect(screen.getAllByText("Pavilion Concrete").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Material Texture: Travertine limestone/i)).toBeInTheDocument();
    expect(screen.getByText("Pinboard Note")).toBeInTheDocument();

    const paletteBtns = screen.getAllByTitle(/Extract Color Palette/i);
    expect(paletteBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(paletteBtns[0]);

    expect(screen.getByTestId("mock-color-palette-modal")).toBeInTheDocument();
  });

  it("switches between Pinboard and Masonry Grid mode", () => {
    render(<Moodboard projectId={projectId} />);

    const gridBtn = screen.getByText("Grid");
    fireEvent.click(gridBtn);
    expect(screen.getAllByText("Pavilion Concrete").length).toBeGreaterThanOrEqual(1);

    const pinboardBtn = screen.getByText("Pinboard");
    fireEvent.click(pinboardBtn);
    expect(screen.getAllByText("Pavilion Concrete").length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state with upload picture button when no items exist", () => {
    currentMockItems = [];
    render(<Moodboard projectId={projectId} />);

    expect(screen.getByText("Your Studio Pinboard is Ready")).toBeInTheDocument();
    const uploadButtons = screen.getAllByText("Upload Pictures");
    expect(uploadButtons.length).toBeGreaterThanOrEqual(2);
  });
});
