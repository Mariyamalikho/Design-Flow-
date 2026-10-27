import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Sparkles,
  MousePointer,
  Hand,
  RotateCcw,
  Plus,
  StickyNote,
  ZoomIn,
  ZoomOut,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCanvasPanning, type CanvasTool } from "@/hooks/useCanvasPanning";
import { useCanvasZoom } from "@/hooks/useCanvasZoom";
import { cn } from "@/lib/utils";

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  color?: "indigo" | "amber" | "emerald" | "purple" | "rose" | "zinc";
}

const INITIAL_NODES: CanvasNode[] = [
  {
    id: "node-1",
    x: 120,
    y: 100,
    title: "🎨 Design System Architecture",
    content: "Establish primary design tokens, typography scales, and zinc/indigo dark mode palettes.",
    color: "indigo",
  },
  {
    id: "node-2",
    x: 480,
    y: 160,
    title: "⚡ Interactive Flowchart",
    content: "Connect user onboarding journey to the visual brief wizard and live dashboard metrics.",
    color: "amber",
  },
  {
    id: "node-3",
    x: 240,
    y: 380,
    title: "💡 Brainstorming Prompts",
    content: "Freeform visual node layout for rapid sketching, moodboard curation, and wireframes.",
    color: "purple",
  },
];

const COLOR_CLASSES: Record<
  NonNullable<CanvasNode["color"]>,
  { bg: string; border: string; text: string; header: string }
> = {
  indigo: {
    bg: "bg-indigo-50/80 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-800/70",
    text: "text-indigo-900 dark:text-indigo-200",
    header: "text-indigo-700 dark:text-indigo-400 font-semibold",
  },
  amber: {
    bg: "bg-amber-50/80 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800/70",
    text: "text-amber-900 dark:text-amber-200",
    header: "text-amber-700 dark:text-amber-400 font-semibold",
  },
  emerald: {
    bg: "bg-emerald-50/80 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800/70",
    text: "text-emerald-900 dark:text-emerald-200",
    header: "text-emerald-700 dark:text-emerald-400 font-semibold",
  },
  purple: {
    bg: "bg-purple-50/80 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800/70",
    text: "text-purple-900 dark:text-purple-200",
    header: "text-purple-700 dark:text-purple-400 font-semibold",
  },
  rose: {
    bg: "bg-rose-50/80 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800/70",
    text: "text-rose-900 dark:text-rose-200",
    header: "text-rose-700 dark:text-rose-400 font-semibold",
  },
  zinc: {
    bg: "bg-zinc-50 dark:bg-zinc-900/60",
    border: "border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-800 dark:text-zinc-200",
    header: "text-zinc-900 dark:text-zinc-100 font-semibold",
  },
};

export default function Canvas() {
  const { id } = useParams<{ id?: string }>();
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Infinite panning hook
  const {
    pan,
    setPan,
    isPanning,
    canPan,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetPan,
  } = useCanvasPanning({
    activeTool,
    isSpacePressed,
  });

  // Wheel zoom hook
  const { zoom, zoomIn, zoomOut, resetZoom } = useCanvasZoom({
    pan,
    setPan,
    viewportRef,
  });

  // Handle Spacebar toggling pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag === "input" || activeTag === "textarea") return;
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleResetView = useCallback(() => {
    resetPan();
    resetZoom();
  }, [resetPan, resetZoom]);

  const handleAddNode = useCallback(() => {
    const nextIndex = nodes.length + 1;
    const colors: Array<CanvasNode["color"]> = [
      "indigo",
      "amber",
      "emerald",
      "purple",
      "rose",
    ];
    const pickedColor = colors[nodes.length % colors.length] || "indigo";

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      x: 180 + (nodes.length % 5) * 60,
      y: 180 + (nodes.length % 5) * 40,
      title: `💡 Idea Node #${nextIndex}`,
      content: "Click to write your brainstorming thoughts, task items, or architectural notes.",
      color: pickedColor,
    };

    setNodes((prev) => [...prev, newNode]);
  }, [nodes.length]);

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-zinc-50 dark:bg-zinc-950 select-none relative"
      data-testid="brainstorm-canvas-container"
    >
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Brainstorm Canvas
              </h1>
              <Badge variant="outline" className="text-xs font-normal">
                {id ? `Board #${id}` : "Infinite Workspace"}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Freeform visual workspace for sketching design architectures, mood ideas, and flows
            </p>
          </div>
        </div>

        {/* Toolbar Center & Right */}
        <div className="flex items-center gap-2">
          {/* Tool switchers */}
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100/60 dark:bg-zinc-900/60">
            <Button
              variant={activeTool === "select" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTool("select")}
              className="h-8 px-2.5 gap-1.5 text-xs font-medium"
              title="Select tool (V)"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Select</span>
            </Button>
            <Button
              variant={activeTool === "pan" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTool("pan")}
              className="h-8 px-2.5 gap-1.5 text-xs font-medium"
              title="Pan tool (H or hold Spacebar)"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Pan</span>
            </Button>
          </div>

          {/* Reset view */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
            className="h-8 px-2.5 gap-1.5 text-xs"
            title="Reset canvas view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </Button>

          {/* Switch to Notes */}
          <Link to="/notes">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 gap-1.5 text-xs"
              title="Open Rich Notes"
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Notes</span>
            </Button>
          </Link>

          {/* Add idea node */}
          <Button
            onClick={handleAddNode}
            size="sm"
            className="h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Idea</span>
          </Button>
        </div>
      </header>

      {/* Main Canvas Viewport */}
      <div
        ref={viewportRef}
        data-testid="canvas-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "flex-1 overflow-hidden relative touch-none",
          isPanning
            ? "cursor-grabbing"
            : canPan
            ? "cursor-grab"
            : "cursor-default"
        )}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148, 163, 184, 0.25) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      >
        {/* Infinite Transform Container */}
        <div
          data-testid="canvas-plane"
          className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
          }}
        >
          {nodes.map((node) => {
            const colorStyle = COLOR_CLASSES[node.color || "indigo"];
            return (
              <div
                key={node.id}
                data-testid={`canvas-node-${node.id}`}
                className={cn(
                  "absolute w-64 rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md cursor-pointer",
                  colorStyle.bg,
                  colorStyle.border,
                  colorStyle.text
                )}
                style={{
                  transform: `translate3d(${node.x}px, ${node.y}px, 0px)`,
                }}
              >
                <h4 className={cn("text-sm mb-1.5", colorStyle.header)}>
                  {node.title}
                </h4>
                <p className="text-xs leading-relaxed opacity-90 line-clamp-4">
                  {node.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Canvas Controls Bar */}
      <div
        data-testid="canvas-footer-controls"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs z-20 text-zinc-600 dark:text-zinc-300"
      >
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="h-7 w-7 p-0"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <button
            type="button"
            onClick={resetZoom}
            data-testid="canvas-zoom-indicator"
            className="min-w-[46px] text-center font-semibold text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Click to reset zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="h-7 w-7 p-0"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

        {/* Pan coordinates */}
        <div
          data-testid="canvas-pan-coordinates"
          className="text-[11px] font-mono text-zinc-400"
        >
          X: {Math.round(pan.x)} Y: {Math.round(pan.y)}
        </div>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

        {/* Help tooltip */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <HelpCircle className="w-3 h-3 text-zinc-400" />
          <span className="hidden sm:inline">Space+Drag to pan • Wheel to zoom</span>
        </div>
      </div>
    </div>
  );
}
