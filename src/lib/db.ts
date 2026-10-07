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
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
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

export class DesignFlowDB extends Dexie {
  projects!: Table<Project, number>;
  tasks!: Table<Task, number>;
  briefs!: Table<DesignBrief, number>;
  assets!: Table<Asset, number>;

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
  }
}

export const db = new DesignFlowDB();
