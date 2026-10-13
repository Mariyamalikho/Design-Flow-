import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { ColorPreviewCard } from "./ColorPreviewCard";
import { PaletteColor } from "@/lib/db";
import { Palette } from "lucide-react";

interface ColorPreviewModalProps {
  color: PaletteColor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorPreviewModal({ color, open, onOpenChange }: ColorPreviewModalProps) {
  if (!color) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Palette className="w-5 h-5 text-indigo-500" />
            UI Surface Preview & Contrast Analysis
          </DialogTitle>
        </DialogHeader>

        <ColorPreviewCard color={color} className="border-0 shadow-none" />
      </DialogContent>
    </Dialog>
  );
}
