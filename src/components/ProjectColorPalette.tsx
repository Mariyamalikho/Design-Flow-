import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, PaletteColor } from "@/lib/db";
import { ColorSwatch } from "./ColorSwatch";
import { ColorPreviewCard } from "./ColorPreviewCard";
import { ColorPreviewModal } from "./ColorPreviewModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Palette, LayoutGrid, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ProjectColorPaletteProps {
  projectId: number;
}

const PRESET_COLORS = [
  { hex: "#6366f1", label: "Indigo" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#0ea5e9", label: "Sky" },
  { hex: "#10b981", label: "Emerald" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#f43f5e", label: "Rose" },
  { hex: "#8b5cf6", label: "Violet" },
  { hex: "#ec4899", label: "Pink" },
  { hex: "#64748b", label: "Slate" },
  { hex: "#18181b", label: "Dark" },
];

export function ProjectColorPalette({ projectId }: ProjectColorPaletteProps) {
  const [customHex, setCustomHex] = useState("#6366f1");
  const [colorName, setColorName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<"swatches" | "previews">("swatches");
  const [previewColor, setPreviewColor] = useState<PaletteColor | null>(null);

  const colors = useLiveQuery(
    () => db.paletteColors.where("projectId").equals(projectId).reverse().sortBy("createdAt"),
    [projectId]
  );

  const handleHexInputChange = (val: string) => {
    let clean = val.trim();
    if (!clean.startsWith("#")) {
      clean = "#" + clean;
    }
    // Limit to 7 chars (# + 6 hex digits)
    if (clean.length <= 7) {
      setCustomHex(clean);
    }
  };

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(customHex)) {
      toast.error("Please enter a valid hex color code (e.g. #6366f1)");
      return;
    }

    try {
      await db.paletteColors.add({
        projectId,
        hex: customHex.toLowerCase(),
        name: colorName.trim() || undefined,
        createdAt: new Date(),
      });
      setColorName("");
      setIsAdding(false);
      toast.success(`Color ${customHex.toUpperCase()} saved to project palette!`);
    } catch {
      toast.error("Failed to save color");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-500" />
            Project Color Palette
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Curate brand colors, copy HEX codes with one click, and inspect light/dark UI contrast mockups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setViewMode("swatches")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "swatches"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Swatches
            </button>
            <button
              onClick={() => setViewMode("previews")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "previews"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              UI Previews
            </button>
          </div>

          <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Color
          </Button>
        </div>
      </div>

      {isAdding && (
        <form 
          onSubmit={handleAddColor} 
          className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in duration-150 overflow-visible relative"
        >
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Color Input Picker & HEX Field */}
            <div className="flex items-center gap-2">
              <div className="relative overflow-visible shrink-0">
                <input
                  type="color"
                  value={customHex.length === 7 ? customHex : "#6366f1"}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                  title="Choose custom color"
                />
              </div>

              <Input
                value={customHex}
                onChange={(e) => handleHexInputChange(e.target.value)}
                placeholder="#6366F1"
                className="w-28 font-mono text-xs uppercase tracking-wider font-semibold"
                required
              />
            </div>

            <Input
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="Color Name (e.g. Primary Brand, Accent Sky)"
              className="flex-1 min-w-[180px] text-xs"
            />

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Color
              </Button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex-wrap">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
            </span>
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => {
                  setCustomHex(preset.hex);
                  if (!colorName) setColorName(preset.label);
                }}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 active:scale-95 shadow-xs border-2 ${
                  customHex.toLowerCase() === preset.hex.toLowerCase() 
                    ? "border-zinc-900 dark:border-zinc-100 scale-110" 
                    : "border-transparent"
                }`}
                style={{ backgroundColor: preset.hex }}
                title={`${preset.label} (${preset.hex})`}
              />
            ))}
          </div>
        </form>
      )}

      {!colors || colors.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Palette className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-40" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No colors in palette yet</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Add colors manually with the color picker or extract them directly from your moodboard images!
          </p>
        </div>
      ) : viewMode === "swatches" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {colors.map((color) => (
            <ColorSwatch 
              key={color.id} 
              color={color} 
              onPreview={setPreviewColor}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {colors.map((color) => (
            <ColorPreviewCard key={color.id} color={color} />
          ))}
        </div>
      )}

      {/* Fullscreen UI Preview Modal */}
      <ColorPreviewModal 
        color={previewColor}
        open={!!previewColor}
        onOpenChange={(open) => !open && setPreviewColor(null)}
      />
    </div>
  );
}
