import { db } from "./db";
import JSZip from "jszip";
import { downloadBlob } from "./exportUtils";

export interface UserDataDump {
  version: string;
  schemaVersion: number;
  exportedAt: string;
  deviceInfo: {
    userAgent: string;
    language: string;
  };
  localStorage: Record<string, string>;
  summary: {
    totalProjects: number;
    totalTasks: number;
    totalBriefs: number;
    totalNotes: number;
    totalCanvasNodes: number;
    totalCanvasConnections: number;
    totalBrandIdentities: number;
    totalPaletteColors: number;
    totalMoodboardItems: number;
    totalAssets: number;
  };
  data: {
    projects: any[];
    tasks: any[];
    briefs: any[];
    notes: any[];
    canvasNodes: any[];
    canvasConnections: any[];
    brandIdentities: any[];
    paletteColors: any[];
    moodboardItems: any[];
    assets: {
      id?: number;
      projectId?: number;
      name: string;
      type: string;
      size: number;
      createdAt: Date;
      updatedAt: Date;
    }[];
  };
}

/**
 * Gathers all local user data across IndexedDB tables and localStorage keys
 * in accordance with GDPR Article 20 (Right to data portability).
 */
export async function gatherAllUserData(): Promise<{ dump: UserDataDump; rawAssets: any[] }> {
  // Safe localStorage dump
  const localStoreData: Record<string, string> = {};
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          localStoreData[key] = window.localStorage.getItem(key) || "";
        }
      }
    } catch {
      // Ignored if access restricted in sandbox/incognito
    }
  }

  const [
    projects,
    tasks,
    briefs,
    notes,
    canvasNodes,
    canvasConnections,
    brandIdentities,
    paletteColors,
    moodboardItems,
    assets,
  ] = await Promise.all([
    db.projects.toArray(),
    db.tasks.toArray(),
    db.briefs.toArray(),
    db.notes.toArray(),
    db.canvasNodes.toArray(),
    db.canvasConnections.toArray(),
    db.brandIdentities.toArray(),
    db.paletteColors.toArray(),
    db.moodboardItems.toArray(),
    db.assets.toArray(),
  ]);

  const assetMetadata = assets.map((a) => ({
    id: a.id,
    projectId: a.projectId,
    name: a.name,
    type: a.type,
    size: a.size,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  const dump: UserDataDump = {
    version: "1.0.0",
    schemaVersion: 11,
    exportedAt: new Date().toISOString(),
    deviceInfo: {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      language: typeof navigator !== "undefined" ? navigator.language : "en-US",
    },
    localStorage: localStoreData,
    summary: {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      totalBriefs: briefs.length,
      totalNotes: notes.length,
      totalCanvasNodes: canvasNodes.length,
      totalCanvasConnections: canvasConnections.length,
      totalBrandIdentities: brandIdentities.length,
      totalPaletteColors: paletteColors.length,
      totalMoodboardItems: moodboardItems.length,
      totalAssets: assets.length,
    },
    data: {
      projects,
      tasks,
      briefs,
      notes,
      canvasNodes,
      canvasConnections,
      brandIdentities,
      paletteColors,
      moodboardItems,
      assets: assetMetadata,
    },
  };

  return { dump, rawAssets: assets };
}

/**
 * Packages all user workspace data and binary media files into a downloadable ZIP archive.
 */
export async function exportAllUserDataAsZip(): Promise<void> {
  const { dump, rawAssets } = await gatherAllUserData();
  const zip = new JSZip();

  // 1. Core structured JSON dump
  zip.file("designflow-data.json", JSON.stringify(dump, null, 2));

  // 2. Add Readme explaining GDPR portability
  zip.file(
    "README.txt",
    `DesignFlow Complete Workspace Export (GDPR Art. 20 Data Portability)
Export Date: ${dump.exportedAt}
DesignFlow Version: ${dump.version}

Contents:
- designflow-data.json: Structured JSON format containing all projects, briefs, tasks, notes, canvas nodes, and brand identity configurations.
- assets/: Original binary files and uploaded media assets.
`
  );

  // 3. Binary assets directory
  if (rawAssets.length > 0) {
    const assetsFolder = zip.folder("assets");
    if (assetsFolder) {
      for (const asset of rawAssets) {
        if (asset.data) {
          assetsFolder.file(asset.name, asset.data);
        }
      }
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const filename = `designflow-gdpr-export-${new Date().toISOString().slice(0, 10)}.zip`;
  downloadBlob(content, filename);
}

/**
 * Exports all user workspace data as a standalone formatted JSON file.
 */
export async function exportAllUserDataAsJson(): Promise<void> {
  const { dump } = await gatherAllUserData();
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
  const filename = `designflow-gdpr-export-${new Date().toISOString().slice(0, 10)}.json`;
  downloadBlob(blob, filename);
}
