import { useState } from "react";
import { Copy, Check, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { getLuminance, checkWCAGCompliance, hexToRgb } from "@/lib/colorUtils";
import { type PaletteColor, db } from "@/lib/db";

interface ColorSwatchProps {
  color: PaletteColor;
  onPreview?: (color: PaletteColor) => void;
}

export function ColorSwatch({ color, onPreview }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    toast.success(`Copied ${color.hex.toUpperCase()} to clipboard!`, {
      description: color.name ? `Color: ${color.name}` : undefined,
    });
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!color.id) return;
    try {
      await db.paletteColors.delete(color.id);
      toast.success("Color removed from palette");
    } catch {
      toast.error("Failed to remove color");
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(color);
  };

  const hex = color.hex.toLowerCase();
  const rgb = hexToRgb(hex);
  const rgbString = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "";
  const lum = getLuminance(hex);
  const isLight = lum > 0.45;
  const contrastWhite = checkWCAGCompliance(hex, "#ffffff");

  return (
    <div 
      onClick={handleCopy}
      className="group relative flex flex-col rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer select-none"
      title="Click anywhere to copy HEX"
    >
      {/* Top Swatch Body */}
      <div 
        className="h-24 w-full flex flex-col justify-between p-2.5 relative transition-transform duration-200 group-hover:scale-[1.02]"
        style={{ backgroundColor: hex }}
      >
        {/* Top Badges and Action Icons */}
        <div className="flex items-center justify-between">
          <span 
            className={`text-[9px] font-bold font-mono tracking-tight px-1.5 py-0.5 rounded shadow-xs backdrop-blur-xs flex items-center gap-1 ${
              contrastWhite.AA_normal ? "bg-black/25 text-white" : "bg-white/40 text-zinc-900"
            }`}
            title={`Contrast with white: ${contrastWhite.ratio}:1 (${contrastWhite.AA_normal ? "AA Pass" : "AA Fail"})`}
          >
            <span>{contrastWhite.ratio}:1</span>
            <span className="opacity-75">·</span>
            <span>{contrastWhite.AA_normal ? "AA" : "FAIL"}</span>
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onPreview && (
              <button
                onClick={handlePreview}
                className={`p-1 rounded-md backdrop-blur-md transition-transform active:scale-90 ${
                  isLight ? "bg-black/15 hover:bg-black/25 text-zinc-900" : "bg-white/20 hover:bg-white/30 text-white"
                }`}
                title="Preview Dark/Light UI"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleDelete}
              className={`p-1 rounded-md backdrop-blur-md transition-transform active:scale-90 ${
                isLight ? "bg-black/15 hover:bg-black/25 text-zinc-900" : "bg-white/20 hover:bg-white/30 text-white"
              }`}
              title="Delete Color"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Copied Feedback Pill */}
        {copied && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-150">
            <span className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Copied!
            </span>
          </div>
        )}
      </div>

      {/* Bottom Information Row with Polished Typography */}
      <div className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between z-10 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="min-w-0 pr-2 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {hex}
            </p>
          </div>

          {color.name ? (
            <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[100px]" title={color.name}>
              {color.name}
            </p>
          ) : rgbString ? (
            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate">
              {rgbString}
            </p>
          ) : (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Click to copy</p>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          title="Copy HEX"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
