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

export class DesignFlowDB extends Dexie {
  projects!: Table<Project, number>;
  tasks!: Table<Task, number>;
  briefs!: Table<DesignBrief, number>;

  constructor() {
    super("DesignFlowDB");
    this.version(2).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
      briefs: "++id, projectId, status, createdAt",
    });
  }
}

export const db = new DesignFlowDB();
