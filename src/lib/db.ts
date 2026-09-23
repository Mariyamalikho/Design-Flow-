import Dexie, { type Table } from "dexie";

export interface Project {
  id?: number;
  title: string;
  description: string;
  status: "active" | "completed" | "archived";
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

export class DesignFlowDB extends Dexie {
  projects!: Table<Project, number>;
  tasks!: Table<Task, number>;

  constructor() {
    super("DesignFlowDB");
    this.version(1).stores({
      projects: "++id, status, createdAt",
      tasks: "++id, projectId, status, priority",
    });
  }
}

export const db = new DesignFlowDB();
