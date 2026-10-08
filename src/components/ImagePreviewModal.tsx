import { useState } from "react";
import { X, ZoomIn, ZoomOut, Download, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface ImagePreviewModalProps {
  url: string;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreviewModal({ url, name, open, onOpenChange }: ImagePreviewModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState(false);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale === 1) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyImage = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Ensure we only copy valid images
      if (!blob.type.startsWith("image/png") && !blob.type.startsWith("image/jpeg")) {
        toast.error("Can only copy PNG or JPEG images directly to clipboard");
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      setIsCopied(true);
      toast.success("Image copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy image to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 overflow-hidden bg-black/95 border-zinc-800 flex flex-col [&>button]:hidden">
        {/* We hide the default close button using [&>button]:hidden and provide our own custom header */}
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <DialogDescription className="sr-only">Previewing {name}</DialogDescription>

        <div className="flex items-center justify-between p-4 bg-black/50 absolute top-0 left-0 right-0 z-50 text-white transition-opacity hover:opacity-100 opacity-80">
          <p className="font-medium truncate max-w-[50%]">{name}</p>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9" onClick={handleZoomOut} disabled={scale <= 1}>
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <span className="text-xs w-10 sm:w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9" onClick={handleZoomIn} disabled={scale >= 4}>
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-1 sm:mx-2" />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9" onClick={handleCopyImage} title="Copy Image">
              {isCopied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9" onClick={handleDownload} title="Download Image">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-1 sm:mx-2" />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9 text-red-400 hover:text-red-300" onClick={() => onOpenChange(false)}>
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        <div 
          className="flex-1 overflow-hidden flex items-center justify-center relative touch-none"
          style={{ cursor: scale > 1 ? "grab" : "default" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={(e) => {
            e.preventDefault();
            if (e.deltaY < 0) handleZoomIn();
            else handleZoomOut();
          }}
        >
          <img 
            src={url} 
            alt={name} 
            className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out select-none pointer-events-none"
            style={{ 
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` 
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

