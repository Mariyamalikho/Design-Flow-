import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../db";
import { createDetailedStarterProject, ensureStarterProject } from "../seedProject";

vi.mock("../db", () => {
  return {
    db: {
      projects: {
        add: vi.fn().mockResolvedValue(100),
        count: vi.fn(),
        orderBy: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ id: 100 }),
        }),
      },
      moodboardItems: {
        bulkAdd: vi.fn().mockResolvedValue([1, 2, 3, 4, 5, 6]),
      },
      brandIdentities: {
        add: vi.fn().mockResolvedValue(1),
      },
      paletteColors: {
        bulkAdd: vi.fn().mockResolvedValue([1, 2, 3, 4, 5, 6]),
      },
      tasks: {
        bulkAdd: vi.fn().mockResolvedValue([1, 2, 3, 4]),
      },
    },
  };
});

describe("seedProject Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a detailed architectural starter project with rich branding, moodboard items, and colors", async () => {
    const projectId = await createDetailedStarterProject();
    expect(projectId).toBe(100);

    expect(db.projects.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Nordic Architecture & Editorial Identity",
        status: "active",
        tags: expect.arrayContaining(["Architecture", "Editorial", "Typography"]),
      })
    );

    expect(db.moodboardItems.bulkAdd).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          projectId: 100,
          title: "Monolithic Concrete & Timber Pavilion",
          scale: "large",
        }),
      ])
    );

    expect(db.brandIdentities.add).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 100,
        headingFont: "Playfair Display",
        bodyFont: "Inter",
        brandVoice: expect.stringContaining("Understated yet authoritative"),
      })
    );

    expect(db.paletteColors.bulkAdd).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ projectId: 100, hex: "#18181b", name: "Obsidian Charcoal" }),
        expect.objectContaining({ projectId: 100, hex: "#e7e5e4", name: "Warm Limestone" }),
      ])
    );

    expect(db.tasks.bulkAdd).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          projectId: 100,
          title: "Finalize editorial type scale & line height ratios",
        }),
      ])
    );
  });

  it("ensureStarterProject creates project when database has 0 projects", async () => {
    (db.projects.count as any).mockResolvedValueOnce(0);

    const id = await ensureStarterProject();
    expect(id).toBe(100);
    expect(db.projects.add).toHaveBeenCalled();
  });

  it("ensureStarterProject returns existing project when count > 0", async () => {
    (db.projects.count as any).mockResolvedValueOnce(1);

    const id = await ensureStarterProject();
    expect(id).toBe(100);
    expect(db.projects.add).not.toHaveBeenCalled();
  });
});
