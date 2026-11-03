import { describe, it, expect, vi, beforeEach } from "vitest";
import { gatherAllUserData, exportAllUserDataAsJson } from "../privacyUtils";

vi.mock("../db", () => ({
  db: {
    projects: { toArray: vi.fn().mockResolvedValue([{ id: 1, title: "Test Project" }]) },
    tasks: { toArray: vi.fn().mockResolvedValue([{ id: 10, title: "Design Logo" }]) },
    briefs: { toArray: vi.fn().mockResolvedValue([]) },
    notes: { toArray: vi.fn().mockResolvedValue([{ id: 100, title: "Meeting Memo" }]) },
    canvasNodes: { toArray: vi.fn().mockResolvedValue([]) },
    canvasConnections: { toArray: vi.fn().mockResolvedValue([]) },
    brandIdentities: { toArray: vi.fn().mockResolvedValue([]) },
    paletteColors: { toArray: vi.fn().mockResolvedValue([]) },
    moodboardItems: { toArray: vi.fn().mockResolvedValue([]) },
    assets: {
      toArray: vi.fn().mockResolvedValue([
        {
          id: 50,
          name: "logo.png",
          type: "image/png",
          size: 1024,
          data: new Blob(["mock-image"], { type: "image/png" }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    },
  },
}));

vi.mock("../exportUtils", () => ({
  downloadBlob: vi.fn(),
}));

describe("GDPR Privacy & Data Portability Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gathers all local entities and packages summary metadata", async () => {
    const { dump, rawAssets } = await gatherAllUserData();

    expect(dump.version).toBe("1.0.0");
    expect(dump.schemaVersion).toBe(11);
    expect(dump.exportedAt).toBeDefined();

    // Summary verification
    expect(dump.summary.totalProjects).toBe(1);
    expect(dump.summary.totalTasks).toBe(1);
    expect(dump.summary.totalNotes).toBe(1);
    expect(dump.summary.totalAssets).toBe(1);

    // Data verification
    expect(dump.data.projects).toHaveLength(1);
    expect(dump.data.tasks).toHaveLength(1);
    expect(dump.data.notes).toHaveLength(1);
    expect(dump.data.assets).toHaveLength(1);
    expect(rawAssets).toHaveLength(1);
  });

  it("exports all user data as formatted JSON and triggers download", async () => {
    const { downloadBlob } = await import("../exportUtils");

    await exportAllUserDataAsJson();

    expect(downloadBlob).toHaveBeenCalledTimes(1);
    const [blob, filename] = (downloadBlob as any).mock.calls[0];

    expect(blob).toBeInstanceOf(Blob);
    expect(filename).toMatch(/^designflow-gdpr-export-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
