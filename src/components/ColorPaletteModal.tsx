import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { extractColorsFromImage, generateHarmoniousPalette, checkWCAGCompliance } from "@/lib/colorUtils";
import { toast } from "sonner";
import { Copy, Check, Palette } from "lucide-react";

interface ColorPaletteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string;
  imageTitle?: string;
}

export function ColorPaletteModal({
  open,
  onOpenChange,
  imageUrl,
  imageTitle
}: ColorPaletteModalProps) {
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && imageUrl) {
      setLoading(true);
      extractColorsFromImage(imageUrl)
        .then((colors) => {
          setExtractedColors(colors);
          setSelectedColor(colors[0] || null);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [open, imageUrl]);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Copied ${hex} to clipboard!`);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const harmonies = selectedColor ? generateHarmoniousPalette(selectedColor) : null;
  const contrastOnWhite = selectedColor ? checkWCAGCompliance(selectedColor, "#ffffff") : null;
  const contrastOnBlack = selectedColor ? checkWCAGCompliance(selectedColor, "#000000") : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-500" />
            Color Palette: {imageTitle || "Image"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Extracting color harmonies...</p>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Extracted Dominant Colors
              </h4>
              <div className="flex gap-2">
                {extractedColors.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => setSelectedColor(hex)}
                    className={`flex-1 h-14 rounded-lg flex items-center justify-center transition-all ${
                      selectedColor === hex
                        ? "ring-2 ring-indigo-500 ring-offset-2 scale-105"
                        : "hover:scale-95"
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {selectedColor === hex && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedColor && harmonies && (
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Selected Base Color
                  </h4>
                  <button
                    onClick={() => copyToClipboard(selectedColor)}
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {copiedColor === selectedColor ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {selectedColor}
                  </button>
                </div>

                {contrastOnWhite && contrastOnBlack && (
                  <div className="flex gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-zinc-500">vs White:</span>
                      <span className="font-mono font-medium">{contrastOnWhite.ratio}:1</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        contrastOnWhite.AA_normal ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}>
                        {contrastOnWhite.AA_normal ? "AA PASS" : "AA FAIL"}
                      </span>
                    </div>
                    <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-zinc-500">vs Black:</span>
                      <span className="font-mono font-medium">{contrastOnBlack.ratio}:1</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        contrastOnBlack.AA_normal ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}>
                        {contrastOnBlack.AA_normal ? "AA PASS" : "AA FAIL"}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-xs text-zinc-400 mb-2">Complementary Harmony</h5>
                  <div
                    onClick={() => copyToClipboard(harmonies.complementary)}
                    className="h-10 rounded-md flex items-center justify-between px-3 cursor-pointer group shadow-sm transition-transform hover:scale-[1.01]"
                    style={{ backgroundColor: harmonies.complementary }}
                  >
                    <span className="text-xs font-mono font-semibold bg-white/80 dark:bg-black/80 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-100">
                      {harmonies.complementary}
                    </span>
                    <Copy className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                  </div>
                </div>

                <div>
                  <h5 className="text-xs text-zinc-400 mb-2">Analogous Harmony</h5>
                  <div className="flex gap-2">
                    {harmonies.analogous.map((hex) => (
                      <div
                        key={hex}
                        onClick={() => copyToClipboard(hex)}
                        className="flex-1 h-10 rounded-md flex items-center justify-center cursor-pointer group shadow-sm transition-transform hover:scale-[1.01]"
                        style={{ backgroundColor: hex }}
                      >
                        <span className="text-xs font-mono font-semibold bg-white/80 dark:bg-black/80 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-100">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs text-zinc-400 mb-2">Triadic Harmony</h5>
                  <div className="flex gap-2">
                    {harmonies.triadic.map((hex) => (
                      <div
                        key={hex}
                        onClick={() => copyToClipboard(hex)}
                        className="flex-1 h-10 rounded-md flex items-center justify-center cursor-pointer group shadow-sm transition-transform hover:scale-[1.01]"
                        style={{ backgroundColor: hex }}
                      >
                        <span className="text-xs font-mono font-semibold bg-white/80 dark:bg-black/80 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-100">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


