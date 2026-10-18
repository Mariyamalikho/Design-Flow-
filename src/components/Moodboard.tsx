import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Link as LinkIcon, Image as ImageIcon, Trash2, Maximize, StickyNote, Scaling, Download, Palette } from "lucide-react";
import { ColorPaletteModal } from "./ColorPaletteModal";
import { exportElementToFile } from "@/lib/exportUtils";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { useMasonry } from "@/hooks/useMasonry";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";


function ImageWithSkeleton({ src, alt, className }: { src: string, alt?: string, className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 ${className}`} style={{ minHeight: "200px" }} />}
      <img 
        src={src} 
        alt={alt}
        crossOrigin="anonymous" 
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
  const [paletteItem, setPaletteItem] = useState<{ url: string; title?: string } | null>(null);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !items) return;
    
    const sourceColIndex = parseInt(result.source.droppableId);
    const destColIndex = parseInt(result.destination.droppableId);
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    const draggedItem = columnData[sourceColIndex][sourceIndex];
    if (!draggedItem) return;
    
    const newItems = [...items];
    const flatSourceIndex = newItems.findIndex(i => i.id === draggedItem.id);
    newItems.splice(flatSourceIndex, 1);
    
    const targetItem = columnData[destColIndex][destIndex];
    let flatDestIndex = newItems.length;
    
    if (targetItem) {
      flatDestIndex = newItems.findIndex(i => i.id === targetItem.id);
    }
    
    newItems.splice(flatDestIndex, 0, draggedItem);
    
    try {
      const updates = newItems.map((item, index) => ({
        ...item,
        order: index
      }));
      await db.moodboardItems.bulkPut(updates);
    } catch (err) {
      toast.error("Failed to reorder items");
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await db.moodboardItems.delete(id);
      toast.success("Image removed from moodboard");
    } catch (err) {
      toast.error("Failed to remove image");
    }
  };
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteColor, setNoteColor] = useState("bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-800");

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await db.moodboardItems.add({
        projectId,
        type: "note",
        content: noteContent,
        color: noteColor,
        order: items ? items.length : 0,
        createdAt: new Date(),
      });
      setIsNoteModalOpen(false);
      setNoteContent("");
      toast.success("Note added to moodboard");
    } catch (err) {
      toast.error("Failed to add note");
    }
  };

  const handleExportPng = async () => {
    if (!containerRef.current) return;
    const toastId = toast.loading("Generating PNG export...");
    try {
      await exportElementToFile(containerRef.current, `moodboard-project-${projectId}.png`, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      toast.dismiss(toastId);
      toast.success("Moodboard exported to PNG!");
    } catch (err) {
      console.error("Moodboard export error:", err);
      toast.dismiss(toastId);
      toast.error("Failed to export. Some external images may restrict CORS access.");
    }
  };

  const handleToggleScale = async (item: any) => {
    const scales: ("small" | "medium" | "large")[] = ["small", "medium", "large"];
    const currentScale = item.scale || "medium";
    const nextScale = scales[(scales.indexOf(currentScale) + 1) % scales.length];
    try {
      await db.moodboardItems.update(item.id, { scale: nextScale });
    } catch (err) {
      toast.error("Failed to update scale");
    }
  };
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
        order: items ? items.length : 0,
        createdAt: new Date(),
      });
      toast.success("Asset added to moodboard");
      setIsAssetModalOpen(false);
    } catch (err) {
      toast.error("Failed to add asset");
    }
  };

  const items = useLiveQuery(
    () => db.moodboardItems.where("projectId").equals(projectId).sortBy("order"),
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
        order: items ? items.length : 0,
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
          <Button size="sm" variant="outline" onClick={() => setIsNoteModalOpen(true)}>
            <StickyNote className="w-4 h-4 mr-2" /> Add Note
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportPng}>
            <Download className="w-4 h-4 mr-2" /> Export PNG
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
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 items-start w-full">
              {columnData.map((col, colIndex) => (
                <Droppable key={colIndex.toString()} droppableId={colIndex.toString()}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps} 
                      className={`flex flex-col gap-4 flex-1 min-w-[200px] p-2 rounded-xl transition-colors duration-200 ${
                        snapshot.isDraggingOver ? "bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-400/30 dark:ring-indigo-600/30" : ""
                      }`}
                    >
                      {col.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id!.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative group rounded-xl overflow-hidden break-inside-avoid cursor-grab active:cursor-grabbing touch-none transition-all duration-200 ${
                                item.type === "note" 
                                  ? `${item.color || "bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-800"} border shadow-sm min-h-[140px] flex flex-col justify-between` 
                                  : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                              } ${
                                snapshot.isDragging 
                                  ? "shadow-2xl ring-2 ring-indigo-500 scale-105 rotate-2 z-50 opacity-90" 
                                  : "hover:shadow-md"
                              }`}
                            >
                              {item.type === "note" ? (
                                <>
                                  <p className="text-sm font-medium whitespace-pre-wrap p-4">{item.content}</p>
                                  <div className="flex justify-between items-center px-4 pb-3 pt-2 border-t border-black/5 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] opacity-60">Sticky Note</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/10"
                                      onClick={() => item.id && handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <ImageWithSkeleton 
                                    src={item.url!} 
                                    alt={item.title} 
                                    className={`w-full object-cover ${
                                      item.scale === "small" ? "h-32" : item.scale === "large" ? "h-80" : "h-auto"
                                    }`} 
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="secondary" 
                                        size="icon" 
                                        title="Extract Color Palette"
                                        className="h-8 w-8 bg-white/90 hover:bg-white text-zinc-900"
                                        onClick={() => setPaletteItem({ url: item.url!, title: item.title })}
                                      >
                                        <Palette className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="secondary" 
                                        size="icon" 
                                        title={`Size: ${item.scale || "medium"}`}
                                        className="h-8 w-8 bg-white/90 hover:bg-white text-zinc-900"
                                        onClick={() => handleToggleScale(item)}
                                      >
                                        <Scaling className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="secondary" 
                                        size="icon" 
                                        className="h-8 w-8 bg-white/90 hover:bg-white text-zinc-900"
                                        onClick={() => setPreviewItem({ url: item.url!, name: item.title || "Moodboard Image" })}
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
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
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

      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent>
          <form onSubmit={handleAddNote}>
            <DialogHeader>
              <DialogTitle>Add Sticky Note</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="note">Note Text</Label>
                <textarea
                  id="note"
                  rows={4}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
                  placeholder="Type a thought, theme keyword, or brand emotion..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Note Color</Label>
                <div className="flex gap-2">
                  {[
                    { label: "Yellow", class: "bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-800", dot: "bg-yellow-400" },
                    { label: "Rose", class: "bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800", dot: "bg-rose-400" },
                    { label: "Sky", class: "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800", dot: "bg-sky-400" },
                    { label: "Emerald", class: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800", dot: "bg-emerald-400" },
                  ].map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setNoteColor(c.class)}
                      className={`w-8 h-8 rounded-full ${c.dot} border-2 transition-all ${
                        noteColor === c.class ? "border-zinc-900 dark:border-zinc-100 scale-110 shadow-sm" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Note</Button>
            </DialogFooter>
          </form>
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

      {paletteItem && (
        <ColorPaletteModal
          open={!!paletteItem}
          onOpenChange={(open) => !open && setPaletteItem(null)}
          imageUrl={paletteItem.url}
          imageTitle={paletteItem.title}
          projectId={projectId}
        />
      )}
    </div>
  );
}






































