import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ColorSwatch } from "./ColorSwatch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Palette } from "lucide-react";
import { toast } from "sonner";

interface ProjectColorPaletteProps {
  projectId: number;
}

export function ProjectColorPalette({ projectId }: ProjectColorPaletteProps) {
  const [customHex, setCustomHex] = useState("#6366f1");
  const [colorName, setColorName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const colors = useLiveQuery(
    () => db.paletteColors.where("projectId").equals(projectId).reverse().sortBy("createdAt"),
    [projectId]
  );

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
      toast.success("Color saved to project palette!");
    } catch {
      toast.error("Failed to save color");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-500" />
            Project Color Palette
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Curate and manage your project's primary, secondary, and accent colors.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Color
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddColor} className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              className="w-9 h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
            />
            <Input
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              placeholder="#6366f1"
              className="w-28 font-mono text-xs uppercase"
              required
            />
          </div>

          <Input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Color Name (e.g. Primary Indigo)"
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
        </form>
      )}

      {!colors || colors.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No colors in palette yet</p>
          <p className="text-xs text-zinc-500 mt-1">
            Add colors manually or extract them directly from your moodboard images!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {colors.map((color) => (
            <ColorSwatch key={color.id} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

