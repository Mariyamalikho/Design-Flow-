import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TypographyManager } from "../TypographyManager";
import { TypographyPairingPreview } from "../TypographyPairingPreview";

// Mock font loading
vi.mock("@/lib/fontUtils", async () => {
  const actual = await vi.importActual<any>("@/lib/fontUtils");
  return {
    ...actual,
    loadGoogleFont: vi.fn().mockResolvedValue(true),
  };
});

const { mockBrandIdentity, mockColors } = vi.hoisted(() => {
  return {
    mockBrandIdentity: {
      projectId: 202,
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      headingWeight: 700,
      bodyWeight: 400,
      headingSize: 36,
      bodySize: 16,
      headingLineHeight: 1.2,
      bodyLineHeight: 1.6,
      letterSpacing: "normal",
      primaryColor: "#18181b",
      accentColor: "#c2410c",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    mockColors: [
      { id: 1, projectId: 202, hex: "#18181b", name: "Obsidian Charcoal", createdAt: new Date() },
      { id: 2, projectId: 202, hex: "#e7e5e4", name: "Warm Limestone", createdAt: new Date() },
      { id: 3, projectId: 202, hex: "#c2410c", name: "Terracotta Earth", createdAt: new Date() },
    ],
  };
});

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (queryFn: () => unknown) => {
    const fnStr = queryFn.toString();
    if (fnStr.includes("db.brandIdentities")) {
      return mockBrandIdentity;
    }
    if (fnStr.includes("db.paletteColors")) {
      return mockColors;
    }
    if (fnStr.includes("db.projects")) {
      return { id: 202, title: "Nordic Architecture" };
    }
    return [];
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    brandIdentities: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockBrandIdentity),
        }),
      }),
      put: vi.fn().mockResolvedValue(1),
    },
    paletteColors: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockColors),
          reverse: vi.fn().mockReturnValue({
            sortBy: vi.fn().mockResolvedValue(mockColors),
          }),
        }),
      }),
      add: vi.fn().mockResolvedValue(4),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    projects: {
      get: vi.fn().mockResolvedValue({ id: 202, title: "Nordic Architecture" }),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ id: 202, title: "Nordic Architecture" }),
        }),
      }),
    },
    assets: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
    },
    moodboardItems: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
    },
  },
  saveBrandIdentity: vi.fn().mockResolvedValue(1),
}));

describe("Brand Identity Studio Component", () => {
  const projectId = 202;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sub-navigation tabs including Colors & Palettes tab", () => {
    render(<TypographyManager projectId={projectId} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Pairing Studio")).toBeInTheDocument();
    expect(screen.getByText(/Fonts \(/)).toBeInTheDocument();
    expect(screen.getByText("Colors & Palettes")).toBeInTheDocument();
    expect(screen.getByText("Brand Voice")).toBeInTheDocument();
    expect(screen.getByText("Mission & Vision")).toBeInTheDocument();
  });

  it("switches to Colors & Palettes tab and renders ProjectColorPalette component", () => {
    render(<TypographyManager projectId={projectId} />);

    const colorsTab = screen.getByText("Colors & Palettes");
    fireEvent.click(colorsTab);

    expect(screen.getByText("Project Color Palette")).toBeInTheDocument();
    expect(screen.getByText(/Curate brand colors, copy HEX codes/i)).toBeInTheDocument();
    expect(screen.getByText("Swatches")).toBeInTheDocument();
  });

  it("pairs typographies and brand colors with live WCAG contrast checking in TypographyPairingPreview", () => {
    render(
      <TypographyPairingPreview
        projectId={projectId}
        initialHeadingFont="Playfair Display"
        initialBodyFont="Inter"
      />
    );

    expect(screen.getByText("Pair with Brand Colors")).toBeInTheDocument();
    expect(screen.getByText("Headline Color")).toBeInTheDocument();
    expect(screen.getByText("Accent / CTA Color")).toBeInTheDocument();
    expect(screen.getByText(/WCAG 2.1 Contrast:/i)).toBeInTheDocument();
  });
});
