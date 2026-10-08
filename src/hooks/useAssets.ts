import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/fileUtils";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "image/jpeg", 
  "image/png", 
  "image/webp", 
  "image/gif", 
  "image/svg+xml", 
  "application/pdf"
];

export function useAssets(projectId: number) {
  const assets = useLiveQuery(
    () => db.assets.where("projectId").equals(projectId).reverse().sortBy("createdAt"),
    [projectId]
  );

  const uploadFiles = async (files: File[]) => {
    try {
      const existingAssets = await db.assets.where("projectId").equals(projectId).toArray();
      const existingNames = new Set(existingAssets.map(a => a.name));

      const validFiles: File[] = [];
      let skippedCount = 0;
      let errorMessages: string[] = [];

      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          errorMessages.push(`"${file.name}" is not a supported file type.`);
          skippedCount++;
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          errorMessages.push(`"${file.name}" exceeds the 50MB limit (${formatFileSize(file.size)}).`);
          skippedCount++;
          continue;
        }

        if (existingNames.has(file.name)) {
          errorMessages.push(`"${file.name}" already exists in this project.`);
          skippedCount++;
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        const newAssets = validFiles.map(file => ({
          projectId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: file,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await db.assets.bulkAdd(newAssets);
        toast.success(`Successfully uploaded ${validFiles.length} asset${validFiles.length > 1 ? "s" : ""}`);
      }

      if (skippedCount > 0) {
        toast.error(`Skipped ${skippedCount} file${skippedCount > 1 ? "s" : ""}`, {
          description: errorMessages.slice(0, 3).join("\n") + (errorMessages.length > 3 ? `\n...and ${errorMessages.length - 3} more` : "")
        });
      }
    } catch (error) {
      toast.error("Failed to upload assets");
    }
  };

  const deleteAsset = async (id: number) => {
    try {
      await db.assets.delete(id);
      toast.success("Asset deleted");
    } catch (error) {
      toast.error("Failed to delete asset");
    }
  };

  const renameAsset = async (id: number, newName: string) => {
    try {
      const existingAssets = await db.assets.where("projectId").equals(projectId).toArray();
      if (existingAssets.some(a => a.name === newName && a.id !== id)) {
        toast.error("An asset with this name already exists");
        return;
      }
      
      await db.assets.update(id, { name: newName, updatedAt: new Date() });
      toast.success("Asset renamed");
    } catch (error) {
      toast.error("Failed to rename asset");
    }
  };

  return {
    assets,
    uploadFiles,
    deleteAsset,
    renameAsset,
    isLoading: assets === undefined
  };
}
