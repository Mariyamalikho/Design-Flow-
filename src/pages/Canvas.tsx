import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type CanvasNodeItem, type CanvasConnectionItem } from "@/lib/db";
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
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCanvasPanning, type CanvasTool } from "@/hooks/useCanvasPanning";
import { useCanvasZoom } from "@/hooks/useCanvasZoom";
import {
  CanvasNodeCard,
  type CanvasNodeData,
  type CanvasNodeColor,
} from "@/components/canvas/CanvasNodeCard";
import { CanvasConnectionLine } from "@/components/canvas/CanvasConnectionLine";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type CanvasGridMode = "dots" | "lines" | "none";

const SEED_NODES: Omit<CanvasNodeItem, "id" | "createdAt" | "updatedAt">[] = [
  {
    x: 120,
    y: 100,
    title: "🎨 Design System Architecture",
    content: "Establish primary design tokens, typography scales, and zinc/indigo dark mode palettes.",
    color: "indigo",
  },
  {
    x: 520,
    y: 140,
    title: "⚡ Interactive Flowchart",
    content: "Connect user onboarding journey to the visual brief wizard and live dashboard metrics.",
    color: "amber",
  },
  {
    x: 320,
    y: 400,
    title: "💡 Brainstorming Prompts",
    content: "Freeform visual node layout for rapid sketching, moodboard curation, and wireframes.",
    color: "purple",
  },
];

export default function Canvas() {
  const { id } = useParams<{ id?: string }>();
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [selectedNodeId, setSelectedNodeId] = useState<string | number | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | number | null>(null);
  const [gridMode, setGridMode] = useState<CanvasGridMode>("dots");
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [localNodeOverrides, setLocalNodeOverrides] = useState<
    Record<number, { x: number; y: number }>
  >({});

  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Queries: Dexie reactive query for canvas nodes and connection lines
  const dbNodes = useLiveQuery(() => db.canvasNodes.toArray());
  const dbConnections = useLiveQuery(() => db.canvasConnections.toArray());

  // Seed default nodes and starter connections if tables are empty
  useEffect(() => {
    let isMounted = true;
    const seed = async () => {
      try {
        const count = await db.canvasNodes.count();
        if (count === 0 && isMounted) {
          const now = new Date();
          const nodeIds = await db.canvasNodes.bulkAdd(
            SEED_NODES.map((n) => ({
              ...n,
              createdAt: now,
              updatedAt: now,
            })),
            { allKeys: true }
          );

          if (nodeIds && nodeIds.length >= 3) {
            await db.canvasConnections.bulkAdd([
              {
                fromNodeId: Number(nodeIds[0]),
                toNodeId: Number(nodeIds[1]),
                label: "Architects",
                style: "solid",
                createdAt: now,
              },
              {
                fromNodeId: Number(nodeIds[0]),
                toNodeId: Number(nodeIds[2]),
                label: "Inspires",
                style: "dashed",
                createdAt: now,
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to seed initial canvas nodes & connections:", err);
      }
    };
    seed();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Merge live database nodes with local drag coordinate overrides
  const displayNodes = useMemo(() => {
    if (!dbNodes) return [];
    return dbNodes.map((n) => {
      const override = n.id ? localNodeOverrides[n.id] : undefined;
      return {
        ...n,
        id: n.id ?? 0,
        x: override ? override.x : n.x,
        y: override ? override.y : n.y,
      };
    });
  }, [dbNodes, localNodeOverrides]);

  // Map of node positions for instantaneous SVG curve calculations
  const nodePositionMap = useMemo(() => {
    const map: Record<number, { x: number; y: number }> = {};
    displayNodes.forEach((n) => {
      if (n.id) {
        map[Number(n.id)] = { x: n.x, y: n.y };
      }
    });
    return map;
  }, [displayNodes]);

  const handleMoveNode = useCallback(
    (nodeId: string | number, newX: number, newY: number) => {
      const numId = Number(nodeId);
      setLocalNodeOverrides((prev) => ({
        ...prev,
        [numId]: { x: newX, y: newY },
      }));
    },
    []
  );

  const handleMoveEndNode = useCallback(
    async (nodeId: string | number, finalX: number, finalY: number) => {
      const numId = Number(nodeId);
      try {
        await db.canvasNodes.update(numId, {
          x: finalX,
          y: finalY,
          updatedAt: new Date(),
        });
      } catch (err) {
        console.error("Failed to sync node position to database:", err);
      } finally {
        setLocalNodeOverrides((prev) => {
          const next = { ...prev };
          delete next[numId];
          return next;
        });
      }
    },
    []
  );

  const handleUpdateNode = useCallback(
    async (nodeId: string | number, updates: Partial<CanvasNodeData>) => {
      const numId = Number(nodeId);
      try {
        await db.canvasNodes.update(numId, {
          ...updates,
          updatedAt: new Date(),
        });
      } catch (err) {
        console.error("Failed to update canvas node:", err);
      }
    },
    []
  );

  const handleDeleteNode = useCallback(async (nodeId: string | number) => {
    const numId = Number(nodeId);
    try {
      await db.canvasNodes.delete(numId);
      // Clean up connected lines
      const related = await db.canvasConnections
        .where("fromNodeId")
        .equals(numId)
        .or("toNodeId")
        .equals(numId)
        .toArray();
      for (const rel of related) {
        if (rel.id) await db.canvasConnections.delete(rel.id);
      }

      setSelectedNodeId((current) => (current === nodeId ? null : current));
      setConnectingFromId((current) => (current === nodeId ? null : current));
      toast.success("Idea node deleted");
    } catch (err) {
      console.error("Failed to delete canvas node:", err);
      toast.error("Failed to delete node");
    }
  }, []);

  const handleAddNode = useCallback(async () => {
    const colors: CanvasNodeColor[] = [
      "indigo",
      "amber",
      "emerald",
      "purple",
      "rose",
    ];
    const count = (dbNodes?.length || 0) + 1;
    const pickedColor = colors[count % colors.length] || "indigo";
    const now = new Date();

    try {
      const newId = await db.canvasNodes.add({
        title: `💡 Idea Node #${count}`,
        content: "Click to write your brainstorming thoughts, task items, or architectural notes.",
        x: 180 + (count % 5) * 60,
        y: 180 + (count % 5) * 40,
        color: pickedColor,
        createdAt: now,
        updatedAt: now,
      });

      setSelectedNodeId(Number(newId));
      toast.success("Idea node added");
    } catch (err) {
      console.error("Failed to add canvas node:", err);
      toast.error("Failed to add idea node");
    }
  }, [dbNodes?.length]);

  // Connection creation logic
  const handleStartConnect = useCallback((nodeId: string | number) => {
    setConnectingFromId(nodeId);
    toast.info("Click another node to connect");
  }, []);

  const handleSelectNode = useCallback(
    async (nodeId: string | number) => {
      if (connectingFromId && connectingFromId !== nodeId) {
        try {
          await db.canvasConnections.add({
            fromNodeId: Number(connectingFromId),
            toNodeId: Number(nodeId),
            createdAt: new Date(),
          });
          toast.success("Nodes connected");
        } catch (err) {
          console.error("Failed to create connection:", err);
        } finally {
          setConnectingFromId(null);
        }
      } else {
        setSelectedNodeId(nodeId);
      }
    },
    [connectingFromId]
  );

  const handleDeleteConnection = useCallback(async (connId: number) => {
    try {
      await db.canvasConnections.delete(connId);
      toast.success("Connection removed");
    } catch (err) {
      console.error("Failed to delete connection:", err);
    }
  }, []);

  // Compute dynamic dot grid styles matching pan and zoom
  const backgroundStyle = useMemo<React.CSSProperties>(() => {
    if (gridMode === "none") {
      return {};
    }

    const gridSize = Math.round(28 * zoom);
    const dotRadius = Math.max(1, Number((1.2 * zoom).toFixed(1)));
    const dotOpacity = Math.min(0.35, Math.max(0.15, 0.25 * Math.min(zoom, 1.5)));

    if (gridMode === "lines") {
      return {
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundImage:
          "linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)",
      };
    }

    return {
      backgroundPosition: `${pan.x}px ${pan.y}px`,
      backgroundSize: `${gridSize}px ${gridSize}px`,
      backgroundImage: `radial-gradient(circle, rgba(148, 163, 184, ${dotOpacity}) ${dotRadius}px, transparent ${dotRadius}px)`,
    };
  }, [gridMode, pan.x, pan.y, zoom]);

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

      {/* Main Canvas Viewport with Synchronized Dot Grid */}
      <div
        ref={viewportRef}
        data-testid="canvas-viewport"
        onPointerDown={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).dataset.testid === "canvas-plane"
          ) {
            setSelectedNodeId(null);
            setConnectingFromId(null);
          }
          handlePointerDown(e);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "flex-1 overflow-hidden relative touch-none transition-[background-color] duration-150",
          isPanning
            ? "cursor-grabbing"
            : canPan
            ? "cursor-grab"
            : connectingFromId
            ? "cursor-crosshair"
            : "cursor-default"
        )}
        style={backgroundStyle}
      >
        {/* Infinite Transform Container */}
        <div
          data-testid="canvas-plane"
          className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
          }}
        >
          {/* Origin crosshair indicator at (0, 0) */}
          <div
            data-testid="canvas-origin-indicator"
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-30 dark:opacity-40"
            style={{ left: 0, top: 0 }}
          >
            <div className="w-px h-6 bg-indigo-500 absolute" />
            <div className="h-px w-6 bg-indigo-500 absolute" />
            <div className="w-2 h-2 rounded-full border border-indigo-500" />
          </div>

          {/* SVG Connection Lines Layer */}
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible w-full h-full"
            data-testid="canvas-connections-svg"
          >
            {dbConnections?.map((conn) => {
              const fromNode = nodePositionMap[conn.fromNodeId];
              const toNode = nodePositionMap[conn.toNodeId];
              return (
                <CanvasConnectionLine
                  key={conn.id}
                  connection={conn}
                  fromNode={fromNode}
                  toNode={toNode}
                  onDelete={handleDeleteConnection}
                />
              );
            })}
          </svg>

          {/* Node Cards Layer */}
          {displayNodes.map((node) => (
            <CanvasNodeCard
              key={node.id}
              node={node}
              zoom={zoom}
              isSelected={selectedNodeId === node.id}
              isConnectingSource={connectingFromId === node.id}
              onSelect={handleSelectNode}
              onStartConnect={handleStartConnect}
              onMove={handleMoveNode}
              onMoveEnd={handleMoveEndNode}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
            />
          ))}
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

        {/* Grid mode toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const nextMode: Record<CanvasGridMode, CanvasGridMode> = {
              dots: "lines",
              lines: "none",
              none: "dots",
            };
            setGridMode((m) => nextMode[m]);
          }}
          className="h-7 px-2 text-xs gap-1.5 text-zinc-600 dark:text-zinc-300 capitalize"
          title="Toggle grid background (Dots, Lines, None)"
          data-testid="canvas-grid-toggle"
        >
          <Grid className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden sm:inline">{gridMode}</span>
        </Button>

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
