import JSZip from "jszip";
import { Project, DesignBrief, Task, Asset } from "@/lib/db";
import { generateReactRouterLayout } from "./reactRouterGenerator";

export interface ProjectExportData {
  project: Project;
  brief?: DesignBrief;
  tasks: Task[];
  assets: Asset[];
}

export async function exportProjectToZip(data: ProjectExportData): Promise<Blob> {
  const zip = new JSZip();
  
  // 1. Add project info as a JSON file
  const metadata = {
    project: data.project,
    brief: data.brief,
    tasks: data.tasks,
  };
  
  zip.file("designflow-metadata.json", JSON.stringify(metadata, null, 2));

  // 2. Add assets to an /assets directory
  if (data.assets.length > 0) {
    const assetsFolder = zip.folder("public/assets");
    if (assetsFolder) {
      for (const asset of data.assets) {
        // Just writing raw blob data into the zip file
        assetsFolder.file(asset.name, asset.data);
      }
    }
  }

  // 3. Generate initial React Router code layout
  const layoutFiles = generateReactRouterLayout(data);
  for (const [filepath, content] of Object.entries(layoutFiles)) {
    zip.file(filepath, content);
  }

  // Generate the zip blob
  return zip.generateAsync({ type: "blob" });
}

