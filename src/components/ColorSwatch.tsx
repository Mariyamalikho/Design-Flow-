import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getLuminance } from "@/lib/colorUtils";
import { PaletteColor, db } from "@/lib/db";

interface ColorSwatchProps {
  color: PaletteColor;
}

export function ColorSwatch({ color }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    toast.success(`Copied ${color.hex}`);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = async () => {
    if (!color.id) return;
    try {
      await db.paletteColors.delete(color.id);
      toast.success("Color removed from palette");
    } catch {
      toast.error("Failed to remove color");
    }
  };

  const lum = getLuminance(color.hex);
  const isLight = lum > 0.5;

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
      <div 
        className="h-20 w-full flex items-start justify-end p-2 transition-transform group-hover:scale-105"
        style={{ backgroundColor: color.hex }}
      >
        <button
          onClick={handleDelete}
          className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
            isLight ? "bg-black/10 hover:bg-black/20 text-zinc-900" : "bg-white/10 hover:bg-white/20 text-white"
          }`}
          title="Delete Color"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between z-10">
        <div>
          <p className="font-mono text-xs font-semibold uppercase">{color.hex}</p>
          {color.name && <p className="text-[10px] text-zinc-500 truncate max-w-[80px]">{color.name}</p>}
        </div>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Copy HEX"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

