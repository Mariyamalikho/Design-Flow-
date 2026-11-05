import { describe, it, expect, beforeEach, vi } from "vitest";
import { safeLocalStorage } from "@/lib/storageUtils";
import { ONBOARDING_STORAGE_KEY } from "@/components/OnboardingModal";
import { gatherAllUserData, exportAllUserDataAsJson } from "@/lib/privacyUtils";
import { checkWCAGCompliance, getContrastRatio } from "@/lib/colorUtils";
import { downloadBlob } from "@/lib/exportUtils";
import { db } from "@/lib/db";

// In-memory mock tables for Dexie IndexedDB
const { mockDb } = vi.hoisted(() => {
  interface BaseEntity {
    id?: number;
    [key: string]: unknown;
  }

  const createTable = <T extends BaseEntity>() => {
    const list: T[] = [];
    let autoId = 1;

    return {
      _list: list,
      add: vi.fn(async (entity: T) => {
        const id = entity.id ?? autoId++;
        const record = { ...entity, id };
        list.push(record);
        return id;
      }),
      get: vi.fn(async (id: number) => {
        return list.find((item) => item.id === id);
      }),
      update: vi.fn(async (id: number, changes: Partial<T>) => {
        const index = list.findIndex((item) => item.id === id);
        if (index !== -1) {
          list[index] = { ...list[index], ...changes };
          return 1;
        }
        return 0;
      }),
      toArray: vi.fn(async () => [...list]),
      clear: vi.fn(async () => {
        list.length = 0;
      }),
    };
  };

  const mockDb = {
    projects: createTable(),
    tasks: createTable(),
    briefs: createTable(),
    notes: createTable(),
    canvasNodes: createTable(),
    canvasConnections: createTable(),
    brandIdentities: createTable(),
    paletteColors: createTable(),
    moodboardItems: createTable(),
    assets: createTable(),
  };

  return { mockDb };
});

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/exportUtils", () => ({
  downloadBlob: vi.fn(),
}));

describe("E2E Manual Regression Test Suite (Automated Core Lifecycle)", () => {
  beforeEach(async () => {
    safeLocalStorage.clear();
    vi.clearAllMocks();

    // Reset all table arrays
    await db.projects.clear();
    await db.tasks.clear();
    await db.briefs.clear();
    await db.notes.clear();
    await db.canvasNodes.clear();
    await db.canvasConnections.clear();
    await db.brandIdentities.clear();
    await db.paletteColors.clear();
    await db.moodboardItems.clear();
    await db.assets.clear();
  });

  it("executes the full user journey: onboarding -> project -> tasks -> notes -> canvas -> GDPR export", async () => {
    // 1. First-Time Onboarding
    expect(safeLocalStorage.getItem(ONBOARDING_STORAGE_KEY, null)).toBeNull();
    safeLocalStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    expect(safeLocalStorage.getItem(ONBOARDING_STORAGE_KEY, null)).toBe("true");

    // 2. Project Creation & Retrieval
    const projectId = await db.projects.add({
      title: "Apex Creative Rebrand",
      description: "Full brand identity guidelines and digital asset creation.",
      status: "active",
      tags: ["Branding", "Creative", "Q4"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(projectId).toBeDefined();

    const savedProject = await db.projects.get(projectId);
    expect(savedProject?.title).toBe("Apex Creative Rebrand");
    expect((savedProject?.tags as string[])).toContain("Branding");

    // 3. Kanban Deliverables Workflow
    const taskId = await db.tasks.add({
      projectId,
      title: "Design Primary Vector Mark",
      description: "Draft SVG logo mark with responsive lockups.",
      status: "todo",
      priority: "high",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(taskId).toBeDefined();

    // Transition Task: todo -> in-progress -> done
    await db.tasks.update(taskId, { status: "in-progress" });
    let task = await db.tasks.get(taskId);
    expect(task?.status).toBe("in-progress");

    await db.tasks.update(taskId, { status: "done" });
    task = await db.tasks.get(taskId);
    expect(task?.status).toBe("done");

    // 4. Rich Project Note Creation
    const noteId = await db.notes.add({
      projectId,
      title: "Brand Strategy Discovery Notes",
      content: "<h2>Vision & Tone</h2><p>Modern, organic, accessible creative design system.</p>",
      tags: ["Strategy", "Discovery"],
      isPinned: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(noteId).toBeDefined();

    // 5. Brainstorm Canvas Node & Connection
    const node1Id = await db.canvasNodes.add({
      projectId,
      title: "Brand Essence Node",
      color: "indigo",
      position: { x: 100, y: 150 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const node2Id = await db.canvasNodes.add({
      projectId,
      title: "Color Harmony Node",
      color: "emerald",
      position: { x: 350, y: 220 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const connectionId = await db.canvasConnections.add({
      fromNodeId: node1Id,
      toNodeId: node2Id,
      createdAt: new Date(),
    });
    expect(connectionId).toBeDefined();

    // 6. WCAG 2.1 AA Palette Compliance Verification
    const primaryTextHex = "#fafafa";
    const darkSurfaceHex = "#18181b";
    const ratio = getContrastRatio(primaryTextHex, darkSurfaceHex);
    expect(ratio).toBeGreaterThan(7.0); // WCAG AAA minimum 7.0:1
    const compliance = checkWCAGCompliance(primaryTextHex, darkSurfaceHex);
    expect(compliance.AA_normal).toBe(true);

    // Save palette color to database
    await db.paletteColors.add({
      projectId,
      hex: "#6366f1",
      name: "Primary Indigo",
      role: "primary",
      contrastRatioWithDark: ratio,
      wcagPassed: true,
      createdAt: new Date(),
    });

    // 7. GDPR Article 20 Full Data Portability Verification
    const { dump } = await gatherAllUserData();

    expect(dump.summary.totalProjects).toBe(1);
    expect(dump.summary.totalTasks).toBe(1);
    expect(dump.summary.totalNotes).toBe(1);
    expect(dump.summary.totalCanvasNodes).toBe(2);
    expect(dump.summary.totalCanvasConnections).toBe(1);
    expect(dump.summary.totalPaletteColors).toBe(1);

    expect(dump.data.projects[0].title).toBe("Apex Creative Rebrand");
    expect(dump.data.tasks[0].title).toBe("Design Primary Vector Mark");
    expect(dump.data.tasks[0].status).toBe("done");

    // Verify machine-readable JSON serializability
    const jsonString = JSON.stringify(dump, null, 2);
    expect(jsonString).toContain('"title": "Apex Creative Rebrand"');
    expect(jsonString).toContain('"version": "1.0.0"');

    // Trigger export function and assert downloadBlob invoked
    await exportAllUserDataAsJson();
    expect(downloadBlob).toHaveBeenCalledTimes(1);
  });
});
