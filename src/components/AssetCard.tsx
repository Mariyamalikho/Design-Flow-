import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";
import { formatFileSize, getObjectUrl } from "@/lib/fileUtils";
import { Asset } from "@/lib/db";

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate object URL for the blob
    if (asset.data) {
      const url = getObjectUrl(asset.data as Blob);
      setObjectUrl(url);
    }
  }, [asset.data]);

  const isImage = asset.type.startsWith("image/");

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
        {isImage && objectUrl ? (
          <img 
            src={objectUrl} 
            alt={asset.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-400">
            {asset.type === "application/pdf" ? (
              <FileText className="w-12 h-12 mb-2 opacity-50" />
            ) : (
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
            )}
            <span className="text-xs font-medium uppercase tracking-wider">{asset.type.split("/")[1] || "File"}</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
          {/* Actions will go here on Day 40/41 (Preview/Delete/Copy) */}
          <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">View Asset</span>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate" title={asset.name}>
          {asset.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-zinc-500">
            {formatFileSize(asset.size)}
          </p>
          <p className="text-xs text-zinc-400 capitalize">
            {asset.type.split("/")[1] || "file"}
          </p>
        </div>
      </div>
    </div>
  );
}

