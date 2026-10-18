import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { 
  BrandGuidelinesPdfTemplate, 
  type LocalDeckAsset 
} from "./BrandGuidelinesPdfTemplate";
import { 
  blobToDataUrl, 
  exportDeckToPdf, 
  buildDeckFileName 
} from "@/lib/brandPdfUtils";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { 
  Download, 
  Printer, 
  X, 
  Sparkles, 
  Loader2 
} from "lucide-react";

interface BrandDeckModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDeckModal({ projectId, isOpen, onClose }: BrandDeckModalProps) {
  const [activeSlide, setActiveSlide] = useState<number | "all">("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [localAssets, setLocalAssets] = useState<LocalDeckAsset[]>([]);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const project = useLiveQuery(() => db.projects.get(projectId), [projectId]);
  const brandIdentity = useLiveQuery(
    () => db.brandIdentities.where("projectId").equals(projectId).first(),
    [projectId]
  );
  const paletteColors = useLiveQuery(
    () => db.paletteColors.where("projectId").equals(projectId).toArray(),
    [projectId]
  );
  const rawAssets = useLiveQuery(
    () => db.assets.where("projectId").equals(projectId).toArray(),
    [projectId]
  );
  const moodboardItems = useLiveQuery(
    () => db.moodboardItems.where("projectId").equals(projectId).toArray(),
    [projectId]
  );

  // Convert IndexedDB Blobs to base64 Data URLs for local image injection
  useEffect(() => {
    let isSubscribed = true;

    async function loadLocalImages() {
      const converted: LocalDeckAsset[] = [];

      if (rawAssets && rawAssets.length > 0) {
        for (const asset of rawAssets) {
          if (asset.id && asset.data instanceof Blob) {
            try {
              const dataUrl = await blobToDataUrl(asset.data);
              converted.push({
                id: asset.id,
                name: asset.name,
                dataUrl
              });
            } catch {
              // Silently skip unreadable blobs
            }
          }
        }
      }

      // Also ingest any image moodboard items
      if (moodboardItems && moodboardItems.length > 0) {
        for (const item of moodboardItems) {
          if (item.type === "image" && item.url && !item.url.startsWith("blob:")) {
            converted.push({
              id: item.id || Math.floor(Math.random() * 100000),
              name: item.title || "Moodboard Image",
              dataUrl: item.url
            });
          }
        }
      }

      if (isSubscribed) {
        setLocalAssets(converted);
      }
    }

    if (isOpen) {
      loadLocalImages();
    }

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, rawAssets, moodboardItems]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsExporting(true);
    setExportProgress({ current: 1, total: 6 });

    const toastId = toast.loading("Generating agency PDF deck...");

    try {
      const filename = buildDeckFileName(project?.title);
      await exportDeckToPdf(printAreaRef.current, {
        filename,
        scale: 2,
        onProgress: (current, total) => {
          setExportProgress({ current, total });
          toast.loading(`Rendering page ${current} of ${total}...`, { id: toastId });
        }
      });
      toast.success("Brand Guidelines PDF exported successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF deck. Please try printing to PDF instead.", { id: toastId });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleNativePrint = () => {
    // Switch to all slides so the entire deck prints
    setActiveSlide("all");
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const slideTabs = [
    { label: "All Slides", value: "all" as const },
    { label: "01 Cover", value: 0 },
    { label: "02 Strategy", value: 1 },
    { label: "03 Voice", value: 2 },
    { label: "04 Colors", value: 3 },
    { label: "05 Typography", value: 4 },
    { label: "06 Visuals", value: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Deck Navigation Bar (Hidden during native print) */}
      <header className="print-hide h-16 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between shrink-0 text-white z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              Brand Guidelines Deck Preview
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                A4 Landscape
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              {project?.title || "Project"} · {localAssets.length} local images injected
            </p>
          </div>
        </div>

        {/* Slide Selector Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          {slideTabs.map((tab) => (
            <button
              key={String(tab.value)}
              onClick={() => setActiveSlide(tab.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeSlide === tab.value
                  ? "bg-zinc-800 text-white shadow-2xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleNativePrint}
            className="text-xs h-9 gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700"
          >
            <Printer className="w-3.5 h-3.5" /> Print A4 Deck
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {exportProgress ? `Page ${exportProgress.current}/${exportProgress.total}...` : "Exporting..."}
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download PDF
              </>
            )}
          </Button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Deck Viewport Container */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-zinc-900/90 flex justify-center">
        <div 
          id="brand-deck-print-area" 
          ref={printAreaRef}
          className="w-full max-w-[1000px] print-container"
        >
          <BrandGuidelinesPdfTemplate
            project={project}
            brandIdentity={brandIdentity}
            paletteColors={paletteColors}
            localAssets={localAssets}
            activeSlideIndex={activeSlide}
          />
        </div>
      </main>
    </div>
  );
}
