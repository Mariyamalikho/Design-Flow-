import { useState, useRef, useEffect } from "react";
import { Plus, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { useMasonry } from "@/hooks/useMasonry";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";


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
  const [containerWidth, setContainerWidth] = useState(0);
  const columns = useMasonry(containerWidth, 250, 16);
  
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
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

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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

  // Basic masonry layout logic
  const columnData: any[][] = Array.from({ length: columns }, () => []);
  if (items) {
    items.forEach((item, i) => {
      columnData[i % columns].push(item);
    });
  }

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
                    <img src={item.url} alt={item.title} className="w-full h-auto object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
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
    </div>
  );
}









