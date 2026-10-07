import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { UploadCloud, Image as ImageIcon, Filter } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { formatFileSize, revokeObjectUrl } from "@/lib/fileUtils";
import { AssetCard } from "./AssetCard";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";

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
  const [filterType, setFilterType] = useState<"all" | "images" | "documents">("all");

  // Fetch assets for this project
  const assets = useLiveQuery(
    () => db.assets.where("projectId").equals(projectId).reverse().sortBy("createdAt"),
    [projectId]
  );

  const filteredAssets = assets?.filter((asset) => {
    if (filterType === "all") return true;
    if (filterType === "images") return asset.type.startsWith("image/");
    if (filterType === "documents") return asset.type === "application/pdf";
    return true;
  });

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

  const handleDeleteAsset = async (id: number) => {
    try {
      const asset = await db.assets.get(id);
      if (asset && asset.data) {
        revokeObjectUrl(asset.data as Blob);
      }
      await db.assets.delete(id);
      toast.success("Asset deleted");
    } catch (error) {
      toast.error("Failed to delete asset");
    }
  };

  const handleRenameAsset = async (id: number, newName: string) => {
    try {
      // Basic check for duplicate before renaming
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
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-200 shrink-0 ${
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
        
        <div className={`p-3 rounded-full mb-3 ${isDragging ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
          <UploadCloud className="w-6 h-6" />
        </div>
        
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          {isDragging ? "Drop files now" : "Click or drag files to upload"}
        </h3>
        <p className="text-xs text-zinc-500 max-w-xs text-center">
          Support for images, SVGs, and documents up to 50MB.
        </p>
      </div>

      <div className="flex-1 min-h-[300px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Project Assets</h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                {filterType === "all" ? "All Files" : filterType === "images" ? "Images" : "Documents"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={filterType === "all"} onCheckedChange={() => setFilterType("all")}>
                All Files
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterType === "images"} onCheckedChange={() => setFilterType("images")}>
                Images
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterType === "documents"} onCheckedChange={() => setFilterType("documents")}>
                Documents
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {assets === undefined ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl aspect-[3/4]"></div>
              ))}
            </div>
          ) : filteredAssets?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
              <ImageIcon className="w-10 h-10 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                {filterType === "all" ? "No assets yet" : `No ${filterType} found`}
              </h3>
              <p className="text-sm">
                {filterType === "all" ? "Upload files using the dropzone above." : "Try changing your filter or upload a new file."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-max">
              {filteredAssets?.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onDelete={handleDeleteAsset} onRename={handleRenameAsset} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
