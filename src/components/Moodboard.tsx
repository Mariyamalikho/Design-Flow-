import { useState, useRef, useEffect, useMemo } from "react";
import { 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Trash2, 
  Maximize, 
  StickyNote, 
  Scaling, 
  Download, 
  Palette, 
  Upload, 
  LayoutGrid, 
  Layers, 
  Pin
} from "lucide-react";
import { ColorPaletteModal } from "./ColorPaletteModal";
import { exportElementToFile } from "@/lib/exportUtils";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type MoodboardItem } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { useMasonry } from "@/hooks/useMasonry";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

function ImageWithSkeleton({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt || "Moodboard photo"}
        crossOrigin="anonymous"
        className={`${className || ""} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
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
    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
      <img src={url} alt={asset.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
    </div>
  );
}

// Subtle organic rotation classes for tactile pinboard cards
const STUDIO_TILTS = [
  "-rotate-1 hover:rotate-0",
  "rotate-1 hover:rotate-0",
  "-rotate-1.5 hover:rotate-0",
  "rotate-1.5 hover:rotate-0",
  "-rotate-0.5 hover:rotate-0",
  "rotate-0.5 hover:rotate-0",
];

interface MoodboardProps {
  projectId: number;
}

export function Moodboard({ projectId }: MoodboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const columns = useMasonry(containerRef, 260, 16);

  const [layoutMode, setLayoutMode] = useState<"studio" | "masonry">("studio");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [previewItem, setPreviewItem] = useState<{ url: string; name: string } | null>(null);
  const [paletteItem, setPaletteItem] = useState<{ url: string; title?: string } | null>(null);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteColor, setNoteColor] = useState(
    "bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-800"
  );

  const items = useLiveQuery(
    () => db.moodboardItems.where("projectId").equals(projectId).sortBy("order"),
    [projectId]
  );

  const assets = useLiveQuery(
    () => db.assets.where("projectId").equals(projectId).toArray(),
    [projectId]
  );

  // File upload processing (saves to db.assets + creates db.moodboardItems)
  const processImageFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select or drop valid image files (JPEG, PNG, WebP, SVG, GIF).");
      return;
    }

    const currentCount = items?.length || 0;
    let addedCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        await db.assets.add({
          projectId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: file,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const objectUrl = URL.createObjectURL(file);
        const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        await db.moodboardItems.add({
          projectId,
          url: objectUrl,
          title: cleanTitle,
          scale: "medium",
          order: currentCount + i,
          createdAt: new Date(),
        });

        addedCount++;
      } catch (err) {
        console.error("Error saving picture to moodboard:", err);
      }
    }

    if (addedCount > 0) {
      toast.success(`Uploaded ${addedCount} picture${addedCount > 1 ? "s" : ""} to moodboard`);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processImageFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  // Drag-and-drop file ingestion over canvas
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setIsDraggingFiles(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingFiles(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setIsDraggingFiles(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await processImageFiles(Array.from(e.dataTransfer.files));
      }
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !items) return;

    const sourceColIndex = parseInt(result.source.droppableId);
    const destColIndex = parseInt(result.destination.droppableId);
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const draggedItem = columnData[sourceColIndex][sourceIndex];
    if (!draggedItem) return;

    const newItems = [...items];
    const flatSourceIndex = newItems.findIndex((i) => i.id === draggedItem.id);
    newItems.splice(flatSourceIndex, 1);

    const targetItem = columnData[destColIndex][destIndex];
    let flatDestIndex = newItems.length;

    if (targetItem) {
      flatDestIndex = newItems.findIndex((i) => i.id === targetItem.id);
    }

    newItems.splice(flatDestIndex, 0, draggedItem);

    try {
      const updates = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));
      await db.moodboardItems.bulkPut(updates);
    } catch {
      toast.error("Failed to reorder items");
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await db.moodboardItems.delete(id);
      toast.success("Item removed from moodboard");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleToggleScale = async (item: MoodboardItem) => {
    const scales: ("small" | "medium" | "large")[] = ["small", "medium", "large"];
    const currentScale = item.scale || "medium";
    const nextScale = scales[(scales.indexOf(currentScale) + 1) % scales.length];
    try {
      await db.moodboardItems.update(item.id!, { scale: nextScale });
    } catch {
      toast.error("Failed to update scale");
    }
  };

  const handleAddAsset = async (asset: any) => {
    try {
      const url = URL.createObjectURL(asset.data);
      await db.moodboardItems.add({
        projectId,
        url,
        title: asset.name,
        scale: "medium",
        order: items ? items.length : 0,
        createdAt: new Date(),
      });
      toast.success("Asset added to moodboard");
      setIsAssetModalOpen(false);
    } catch {
      toast.error("Failed to add asset");
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    try {
      await db.moodboardItems.add({
        projectId,
        url: urlInput,
        title: titleInput || "Inspiration Photo",
        scale: "medium",
        order: items ? items.length : 0,
        createdAt: new Date(),
      });
      setIsUrlModalOpen(false);
      setUrlInput("");
      setTitleInput("");
      toast.success("Image added to moodboard");
    } catch {
      toast.error("Failed to add image");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await db.moodboardItems.add({
        projectId,
        type: "note",
        content: noteContent,
        color: noteColor,
        scale: "medium",
        order: items ? items.length : 0,
        createdAt: new Date(),
      });
      setIsNoteModalOpen(false);
      setNoteContent("");
      toast.success("Sticky note pinned to moodboard");
    } catch {
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

  // Memoized columns for masonry mode
  const columnData = useMemo(() => {
    const cols: MoodboardItem[][] = Array.from({ length: columns }, () => []);
    if (items) {
      items.forEach((item, i) => {
        cols[i % columns].push(item);
      });
    }
    return cols;
  }, [items, columns]);

  return (
    <div
      className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden native file input for picture upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload pictures to moodboard"
      />

      {/* Visual drag-over overlay */}
      {isDraggingFiles && (
        <div className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-xs border-2 border-dashed border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-3 p-6 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
            <Upload className="w-8 h-8 animate-bounce" />
          </div>
          <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Drop pictures to add to your moodboard
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pictures will be saved directly into project assets and arranged on your pinboard.
          </p>
        </div>
      )}

      {/* Toolbar & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Pin className="w-4 h-4 text-indigo-500" />
            Studio Moodboard
          </h3>
          <span className="text-xs text-zinc-400">
            {items?.length || 0} items
          </span>

          {/* Layout Mode Toggle */}
          <div className="flex bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60">
            <button
              onClick={() => setLayoutMode("studio")}
              title="Studio Pinboard (Tactile polaroid layout with tape & organic tilt)"
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                layoutMode === "studio"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Pinboard
            </button>
            <button
              onClick={() => setLayoutMode("masonry")}
              title="Masonry Grid (Reorderable columns)"
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                layoutMode === "masonry"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Direct Upload Action */}
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Pictures
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUrlModalOpen(true)}
            className="text-xs"
          >
            <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> Add URL
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssetModalOpen(true)}
            className="text-xs"
          >
            <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Add Asset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNoteModalOpen(true)}
            className="text-xs"
          >
            <StickyNote className="w-3.5 h-3.5 mr-1.5" /> Add Note
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPng}
            className="text-xs"
            title="Export moodboard as high-resolution PNG"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Main Moodboard Canvas */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto p-6 min-h-[480px] ${
          layoutMode === "studio"
            ? "bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px]"
            : "bg-zinc-50/30 dark:bg-zinc-950"
        }`}
      >
        {!items || items.length === 0 ? (
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-zinc-500 space-y-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <Upload className="w-8 h-8 opacity-40 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="text-center space-y-1 max-w-sm">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Your Studio Pinboard is Ready
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Upload photos from your computer, drag and drop files onto this canvas, or link external visual references.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Pictures
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUrlModalOpen(true)}
                className="text-xs"
              >
                <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> Add URL
              </Button>
            </div>
          </div>
        ) : layoutMode === "studio" ? (
          /* ========================================================
             1. TACTILE STUDIO PINBOARD MODE (Literal moodboard way)
             Polaroid frames, masking tape strips, organic tilts,
             tactile shadows, and 1-click color palette extraction.
             ======================================================== */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
            {items.map((item, index) => {
              const tiltClass = STUDIO_TILTS[index % STUDIO_TILTS.length];
              const isNote = item.type === "note";

              if (isNote) {
                return (
                  <div
                    key={item.id}
                    className={`relative group rounded-xl p-5 border shadow-sm transition-all duration-200 ${tiltClass} ${
                      item.color ||
                      "bg-yellow-100 text-yellow-950 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-100 dark:border-yellow-800"
                    }`}
                  >
                    {/* Tactile pushpin dot */}
                    <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500 shadow-inner mx-auto -mt-3 mb-3 border border-white/60 dark:border-black/40" />

                    <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap min-h-[90px]">
                      {item.content}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
                        Pinboard Note
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/10"
                        onClick={() => item.id && handleDeleteItem(item.id)}
                        title="Remove note"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              }

              // Image Card: Studio Polaroid / Tactile Print
              return (
                <div
                  key={item.id}
                  className={`group relative bg-white dark:bg-zinc-900 rounded-xl p-3 pb-3.5 border border-zinc-200/90 dark:border-zinc-800/90 shadow-md hover:shadow-xl transition-all duration-300 ${tiltClass}`}
                >
                  {/* Masking tape strip accent */}
                  <div className="w-14 h-3.5 mx-auto -mt-5 mb-2 bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300/60 dark:border-amber-800/60 rounded-xs shadow-xs pointer-events-none select-none" />

                  {/* Photo area */}
                  <div
                    className={`relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-pointer ${
                      item.scale === "small"
                        ? "h-40"
                        : item.scale === "large"
                        ? "h-80"
                        : "h-56"
                    }`}
                    onClick={() =>
                      setPreviewItem({ url: item.url!, name: item.title || "Moodboard Photo" })
                    }
                  >
                    <ImageWithSkeleton
                      src={item.url!}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hover quick-actions overlay */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="icon"
                          title="Extract Color Palette from this photo"
                          className="h-7 w-7 bg-white/95 hover:bg-white text-zinc-900 shadow-sm"
                          onClick={() => setPaletteItem({ url: item.url!, title: item.title })}
                        >
                          <Palette className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          title={`Toggle height: currently ${item.scale || "medium"}`}
                          className="h-7 w-7 bg-white/95 hover:bg-white text-zinc-900 shadow-sm"
                          onClick={() => handleToggleScale(item)}
                        >
                          <Scaling className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          title="Full image preview"
                          className="h-7 w-7 bg-white/95 hover:bg-white text-zinc-900 shadow-sm"
                          onClick={() =>
                            setPreviewItem({ url: item.url!, name: item.title || "Moodboard Photo" })
                          }
                        >
                          <Maximize className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          title="Remove picture"
                          className="h-7 w-7 shadow-sm"
                          onClick={() => item.id && handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-white text-xs font-medium truncate drop-shadow-sm">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  {/* Tactile Polaroid Label */}
                  <div className="pt-2.5 px-0.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[170px]" title={item.title}>
                      {item.title}
                    </span>
                    <button
                      onClick={() => setPaletteItem({ url: item.url!, title: item.title })}
                      className="text-[10px] font-mono font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                      title="Extract Palette"
                    >
                      <Palette className="w-3 h-3" /> Palette
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================
             2. MASONRY DRAG-AND-DROP GRID MODE
             Structured multi-column drag-and-drop reordering.
             ======================================================== */
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 items-start w-full">
              {columnData.map((col, colIndex) => (
                <Droppable key={colIndex.toString()} droppableId={colIndex.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-4 flex-1 min-w-[200px] p-2 rounded-xl transition-colors duration-200 ${
                        snapshot.isDraggingOver
                          ? "bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-400/30 dark:ring-indigo-600/30"
                          : ""
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
                                  ? `${
                                      item.color ||
                                      "bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-800"
                                    } border shadow-sm min-h-[140px] flex flex-col justify-between`
                                  : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                              } ${
                                snapshot.isDragging
                                  ? "shadow-2xl ring-2 ring-indigo-500 scale-105 rotate-2 z-50 opacity-90"
                                  : "hover:shadow-md"
                              }`}
                            >
                              {item.type === "note" ? (
                                <>
                                  <p className="text-sm font-medium whitespace-pre-wrap p-4">
                                    {item.content}
                                  </p>
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
                                      item.scale === "small"
                                        ? "h-32"
                                        : item.scale === "large"
                                        ? "h-80"
                                        : "h-auto"
                                    }`}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="secondary"
                                        size="icon"
                                        title="Extract Color Palette"
                                        className="h-8 w-8 bg-white/90 hover:bg-white text-zinc-900"
                                        onClick={() =>
                                          setPaletteItem({ url: item.url!, title: item.title })
                                        }
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
                                        onClick={() =>
                                          setPreviewItem({
                                            url: item.url!,
                                            name: item.title || "Moodboard Image",
                                          })
                                        }
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
                                    <p className="text-white font-medium text-sm truncate">
                                      {item.title}
                                    </p>
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

      {/* Modal: Add from URL */}
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
              <Button type="button" variant="outline" onClick={() => setIsUrlModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Image</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Add from Project Assets */}
      <Dialog open={isAssetModalOpen} onOpenChange={setIsAssetModalOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add from Assets</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {!assets || assets.filter((a) => a.type.startsWith("image/")).length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No images found in project assets.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                {assets
                  .filter((a) => a.type.startsWith("image/"))
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="cursor-pointer group relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-colors"
                      onClick={() => handleAddAsset(asset)}
                    >
                      <AssetThumbnail asset={asset} />
                      <div className="p-2 truncate text-xs font-medium text-center">
                        {asset.name}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAssetModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Add Sticky Note */}
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
                  placeholder="Type an architectural thought, texture note, or creative emotion..."
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
                    {
                      label: "Yellow",
                      class:
                        "bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-800",
                      dot: "bg-yellow-400",
                    },
                    {
                      label: "Rose",
                      class:
                        "bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800",
                      dot: "bg-rose-400",
                    },
                    {
                      label: "Sky",
                      class:
                        "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800",
                      dot: "bg-sky-400",
                    },
                    {
                      label: "Emerald",
                      class:
                        "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
                      dot: "bg-emerald-400",
                    },
                  ].map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setNoteColor(c.class)}
                      className={`w-8 h-8 rounded-full ${c.dot} border-2 transition-all ${
                        noteColor === c.class
                          ? "border-zinc-900 dark:border-zinc-100 scale-110 shadow-sm"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {previewItem && (
        <ImagePreviewModal
          url={previewItem.url}
          name={previewItem.name}
          open={!!previewItem}
          onOpenChange={(open) => !open && setPreviewItem(null)}
        />
      )}

      {/* Color Palette Modal for 1-Click Extraction */}
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
