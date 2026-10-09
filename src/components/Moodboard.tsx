import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Link as LinkIcon, Image as ImageIcon, Trash2, Maximize } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { useMasonry } from "@/hooks/useMasonry";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { ImagePreviewModal } from "./ImagePreviewModal";


function ImageWithSkeleton({ src, alt, className }: { src: string, alt?: string, className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 ${className}`} style={{ minHeight: "200px" }} />}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} ${loaded ? "opacity-100" : "opacity-0 absolute"} transition-opacity duration-300`} 
        loading="lazy" 
        onLoad={() => setLoaded(true)} 
      />
    </>
  );
}

function AssetThumbnail({ asset }: { asset: any }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(asset.data as Blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [asset.data]);
  
  if (!url) return null;
  return (
    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
      <img src={url} alt={asset.name} className="w-full h-full object-cover" />
    </div>
  );
}

interface MoodboardProps {
  projectId: number;
}

export function Moodboard({ projectId }: MoodboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columns = useMasonry(containerRef, 250, 16);
  
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [previewItem, setPreviewItem] = useState<{url: string, name: string} | null>(null);

  const handleDeleteItem = async (id: number) => {
    try {
      await db.moodboardItems.delete(id);
      toast.success("Image removed from moodboard");
    } catch (err) {
      toast.error("Failed to remove image");
    }
  };
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const assets = useLiveQuery(
    () => db.assets.where("projectId").equals(projectId).toArray(),
    [projectId]
  );
  
  const handleAddAsset = async (asset: any) => {
    try {
      const url = URL.createObjectURL(asset.data);
      await db.moodboardItems.add({
        projectId,
        url,
        title: asset.name,
        createdAt: new Date(),
      });
      toast.success("Asset added to moodboard");
      setIsAssetModalOpen(false);
    } catch (err) {
      toast.error("Failed to add asset");
    }
  };

  const items = useLiveQuery(
    () => db.moodboardItems.where("projectId").equals(projectId).reverse().sortBy("createdAt"),
    [projectId]
  );

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    
    try {
      await db.moodboardItems.add({
        projectId,
        url: urlInput,
        title: titleInput || "External Image",
        createdAt: new Date(),
      });
      setIsUrlModalOpen(false);
      setUrlInput("");
      setTitleInput("");
      toast.success("Image added to moodboard");
    } catch (err) {
      toast.error("Failed to add image");
    }
  };

  // Basic masonry layout logic memoized to prevent unnecessary recalculations
  const columnData = useMemo(() => {
    const cols: any[][] = Array.from({ length: columns }, () => []);
    if (items) {
      items.forEach((item, i) => {
        cols[i % columns].push(item);
      });
    }
    return cols;
  }, [items, columns]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Project Moodboard</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsUrlModalOpen(true)}>
            <LinkIcon className="w-4 h-4 mr-2" /> Add URL
          </Button>
          <Button size="sm" onClick={() => setIsAssetModalOpen(true)}>
            <ImageIcon className="w-4 h-4 mr-2" /> Add Asset
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6" ref={containerRef}>
        {!items || items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <Plus className="w-8 h-8 opacity-40 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Empty Moodboard</h3>
            <p className="text-sm max-w-sm text-center">
              Start gathering inspiration by adding images from external URLs or your project assets.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 items-start w-full">
            {columnData.map((col, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-4 flex-1 min-w-[200px]">
                {col.map((item) => (
                  <div key={item.id} className="relative group rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 break-inside-avoid">
                    <ImageWithSkeleton src={item.url} alt={item.title} className="w-full h-auto object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-8 w-8 bg-white/90 hover:bg-white text-zinc-900"
                          onClick={() => setPreviewItem({ url: item.url, name: item.title || "Moodboard Image" })}
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => item.id && handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-white font-medium text-sm truncate">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
        <DialogContent>
          <form onSubmit={handleAddUrl}>
            <DialogHeader>
              <DialogTitle>Add Image from URL</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Image URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Caption (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Inspiration note..."
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUrlModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Image</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAssetModalOpen} onOpenChange={setIsAssetModalOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add from Assets</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {!assets || assets.filter(a => a.type.startsWith("image/")).length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No images found in project assets.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                {assets.filter(a => a.type.startsWith("image/")).map(asset => {
                  return (
                    <div 
                      key={asset.id} 
                      className="cursor-pointer group relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-colors"
                      onClick={() => handleAddAsset(asset)}
                    >
                      <AssetThumbnail asset={asset} />
                      <div className="p-2 truncate text-xs font-medium text-center">{asset.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAssetModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {previewItem && (
        <ImagePreviewModal
          url={previewItem.url}
          name={previewItem.name}
          open={!!previewItem}
          onOpenChange={(open) => !open && setPreviewItem(null)}
        />
      )}
    </div>
  );
}
















