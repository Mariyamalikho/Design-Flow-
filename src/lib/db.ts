import Dexie, { type Table } from "dexie";
import type { BriefWizardFormValues } from "./schemas";

export interface Project {
  id?: number;
  title: string;
  description: string;
  status: "active" | "completed" | "archived";
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id?: number;
  projectId: number;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  createdAt: Date;
}

export interface DesignBrief extends BriefWizardFormValues {
  id?: number;
  projectId?: number;
  status: "draft" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id?: number;
  projectId?: number; // Optional: can be associated with a project, or global
  name: string;
  type: string; // mime type
  size: number;
  data: Blob | File; // The actual file data stored in IndexedDB
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodboardItem {
  id?: number;
  projectId: number;
  type?: "image" | "note";
  url?: string; // For images
  title?: string;
  content?: string; // For sticky notes
  color?: string; // Sticky note color
  scale?: "small" | "medium" | "large";
  order?: number;
  createdAt: Date;
}

export interface PaletteColor {
  id?: number;
  projectId: number;
  hex: string;
  name?: string;
  createdAt: Date;
}

export interface BrandIdentity {
  id?: number;
  projectId: number;
  // Typography
  headingFont: string;
  bodyFont: string;
  headingWeight?: number;
  bodyWeight?: number;
  headingSize?: number;
  bodySize?: number;
  headingLineHeight?: number;
  bodyLineHeight?: number;
  letterSpacing?: string;

  // Mission & Vision
  tagline?: string;
  missionStatement?: string;
  visionStatement?: string;
  coreValues?: { id: string; title: string; description: string }[];

  // Brand Voice & Tone
  brandVoice?: string;
  toneAttributes?: string[];
  dosAndDonts?: { id: string; doText: string; dontText: string }[];
  targetAudienceNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id?: number;
  projectId?: number;
  title: string;
  content: string; // TipTap HTML or markdown string
  tags?: string[];
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DesignFlowDB extends Dexie {
  projects!: Table<Project, number>;
  tasks!: Table<Task, number>;
  briefs!: Table<DesignBrief, number>;
  assets!: Table<Asset, number>;
  moodboardItems!: Table<MoodboardItem, number>;
  paletteColors!: Table<PaletteColor, number>;
  brandIdentities!: Table<BrandIdentity, number>;
  notes!: Table<Note, number>;

  constructor() {
    super("DesignFlowDB");
    
    // Version 1
    this.version(1).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
    });

    // Version 2
    this.version(2).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
    });

    // Version 3
    this.version(3).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
      assets: "++id, projectId, type, createdAt",
    });

    // Version 4
    this.version(4).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
      assets: "++id, projectId, type, createdAt",
      moodboardItems: "++id, projectId, createdAt",
    });

    // Version 5
    this.version(5).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
      assets: "++id, projectId, type, createdAt",
      moodboardItems: "++id, projectId, order, createdAt",
    });

    // Version 6
    this.version(6).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
      assets: "++id, projectId, type, createdAt",
      moodboardItems: "++id, projectId, type, order, createdAt",
    });

    // Version 7
    this.version(7).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
      assets: "++id, projectId, type, createdAt",
      moodboardItems: "++id, projectId, type, order, createdAt",
      paletteColors: "++id, projectId, createdAt",
    });

    // Version 8: Brand Guidelines & Typography
    this.version(8).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
      assets: "++id, projectId, type, createdAt",
      moodboardItems: "++id, projectId, type, order, createdAt",
      paletteColors: "++id, projectId, createdAt",
      brandIdentities: "++id, projectId, createdAt, updatedAt",
    });

    // Version 9: Rich Notes & Brainstorm Canvas
    this.version(9).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
      assets: "++id, projectId, type, createdAt",
      moodboardItems: "++id, projectId, type, order, createdAt",
      paletteColors: "++id, projectId, createdAt",
      brandIdentities: "++id, projectId, createdAt, updatedAt",
      notes: "++id, projectId, isPinned, createdAt, updatedAt",
    });
  }
}

export const db = new DesignFlowDB();

export async function saveBrandIdentity(
  projectId: number,
  updates: Partial<Omit<BrandIdentity, "id" | "projectId" | "createdAt">>
): Promise<number> {
  const existing = await db.brandIdentities.where("projectId").equals(projectId).first();
  const now = new Date();
  if (existing && existing.id) {
    await db.brandIdentities.update(existing.id, {
      ...updates,
      updatedAt: now,
    });
    return existing.id;
  } else {
    const id = await db.brandIdentities.add({
      projectId,
      headingFont: updates.headingFont || "Playfair Display",
      bodyFont: updates.bodyFont || "Inter",
      headingWeight: updates.headingWeight || 700,
      bodyWeight: updates.bodyWeight || 400,
      headingSize: updates.headingSize || 36,
      bodySize: updates.bodySize || 16,
      headingLineHeight: updates.headingLineHeight || 1.2,
      bodyLineHeight: updates.bodyLineHeight || 1.6,
      letterSpacing: updates.letterSpacing || "normal",
      ...updates,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }
}





