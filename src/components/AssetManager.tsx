import { useState } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/fileUtils";

interface AssetManagerProps {
  projectId: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "image/jpeg", 
  "image/png", 
  "image/webp", 
  "image/gif", 
  "image/svg+xml", 
  "application/pdf"
];

export function AssetManager({ projectId }: AssetManagerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const uploadFiles = async (files: File[]) => {
    try {
      // Fetch existing assets to check for duplicates by name
      const existingAssets = await db.assets.where("projectId").equals(projectId).toArray();
      const existingNames = new Set(existingAssets.map(a => a.name));

      const validFiles: File[] = [];
      let skippedCount = 0;
      let errorMessages: string[] = [];

      for (const file of files) {
        // Validation: Type
        if (!ALLOWED_TYPES.includes(file.type)) {
          errorMessages.push(`"${file.name}" is not a supported file type.`);
          skippedCount++;
          continue;
        }

        // Validation: Size
        if (file.size > MAX_FILE_SIZE) {
          errorMessages.push(`"${file.name}" exceeds the 50MB limit (${formatFileSize(file.size)}).`);
          skippedCount++;
          continue;
        }

        // Validation: Duplicate Name
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
          data: file, // Store the raw File blob
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await uploadFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    await uploadFiles(files);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all duration-200 ${
          isDragging 
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          multiple 
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileInput} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Drop files here to upload"
        />
        
        <div className={`p-4 rounded-full mb-4 ${isDragging ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          {isDragging ? "Drop files now" : "Click or drag files to upload"}
        </h3>
        <p className="text-sm text-zinc-500 max-w-xs text-center">
          Support for images, SVGs, and documents up to 50MB.
        </p>
      </div>

      <div className="flex-1 min-h-[300px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-500">
        <ImageIcon className="w-10 h-10 mb-4 opacity-20" />
        <p>Asset gallery will be displayed here (Day 39).</p>
      </div>
    </div>
  );
}
