import { useState } from "react";
import { Copy, Check, Sun, Moon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { 
  getLuminance, 
  checkWCAGCompliance, 
  hexToRgb, 
  rgbToHsl 
} from "@/lib/colorUtils";
import type { PaletteColor } from "@/lib/db";

interface ColorPreviewCardProps {
  color: PaletteColor;
  className?: string;
  onCopy?: (hex: string) => void;
}

export function ColorPreviewCard({ color, className = "" }: ColorPreviewCardProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const hex = color.hex.toLowerCase();
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const rgbString = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "";
  const hslString = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "";

  const lum = getLuminance(hex);
  const textColor = lum > 0.4 ? "#09090b" : "#ffffff";

  const contrastWhite = checkWCAGCompliance(hex, "#ffffff");
  const contrastBlack = checkWCAGCompliance(hex, "#09090b");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    toast.success(`Copied ${label}: ${text.toUpperCase()}`, {
      description: color.name ? `Palette: ${color.name}` : undefined,
    });
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${className}`}>
      {/* Top Banner / Color Swatch */}
      <div 
        className="h-28 w-full p-4 flex flex-col justify-between relative transition-transform"
        style={{ backgroundColor: hex }}
      >
        <div className="flex justify-between items-start">
          <div 
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm border border-white/20"
            style={{ 
              backgroundColor: lum > 0.5 ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)",
              color: textColor 
            }}
          >
            {color.name || "Brand Color"}
          </div>

          <button
            onClick={() => copyToClipboard(hex, "HEX")}
            className="px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            style={{ 
              backgroundColor: lum > 0.5 ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.9)",
              color: lum > 0.5 ? "#ffffff" : "#09090b"
            }}
            title="Click to copy HEX"
          >
            {copiedFormat === "HEX" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {hex.toUpperCase()}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {rgbString && (
            <button
              onClick={() => copyToClipboard(rgbString, "RGB")}
              className="text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-sm transition-opacity hover:opacity-100 opacity-80"
              style={{ 
                backgroundColor: lum > 0.5 ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)",
                color: textColor 
              }}
            >
              {rgbString}
            </button>
          )}
          {hslString && (
            <button
              onClick={() => copyToClipboard(hslString, "HSL")}
              className="text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-sm transition-opacity hover:opacity-100 opacity-80"
              style={{ 
                backgroundColor: lum > 0.5 ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)",
                color: textColor 
              }}
            >
              {hslString}
            </button>
          )}
        </div>
      </div>

      {/* WCAG Contrast Summary Bar */}
      <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-medium">On White:</span>
          <span className="font-mono font-semibold">{contrastWhite.ratio}:1</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            contrastWhite.AA_normal ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
          }`}>
            {contrastWhite.AA_normal ? "AA PASS" : "AA FAIL"}
          </span>
        </div>

        <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-medium">On Dark:</span>
          <span className="font-mono font-semibold">{contrastBlack.ratio}:1</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            contrastBlack.AA_normal ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
          }`}>
            {contrastBlack.AA_normal ? "AA PASS" : "AA FAIL"}
          </span>
        </div>
      </div>

      {/* Dual Theme Mockup: Light Mode vs Dark Mode Preview */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Light Surface Preview */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-3.5 text-zinc-900">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Surface
            </span>
            <span 
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${hex}18`, color: hex }}
            >
              Accent Pill
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-800" style={{ color: hex }}>
              Headline in Brand Color
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Design systems shine when color harmonies adapt cleanly to white paper surfaces.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-opacity hover:opacity-90 active:scale-95"
              style={{ backgroundColor: hex, color: textColor }}
            >
              Solid Button
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-zinc-50 active:scale-95"
              style={{ borderColor: hex, color: hex }}
            >
              Outline Button
            </button>
          </div>
        </div>

        {/* Dark Surface Preview */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm space-y-3.5 text-zinc-100">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> Dark Surface
            </span>
            <span 
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${hex}25`, color: hex }}
            >
              Accent Pill
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: hex }}>
              Headline in Brand Color
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              High-contrast accents pop on deep dark canvases, elevating nighttime visual comfort.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-opacity hover:opacity-90 active:scale-95"
              style={{ backgroundColor: hex, color: textColor }}
            >
              Solid Button
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-zinc-900 active:scale-95"
              style={{ borderColor: hex, color: hex }}
            >
              Outline Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
