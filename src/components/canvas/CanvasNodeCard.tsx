import React, { useState, useRef, useCallback } from "react";
import { GripVertical, Trash2, Palette, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

export type CanvasNodeColor =
  | "indigo"
  | "amber"
  | "emerald"
  | "purple"
  | "rose"
  | "zinc";

export interface CanvasNodeData {
  id: string | number;
  x: number;
  y: number;
  title: string;
  content: string;
  color?: CanvasNodeColor;
}

export interface CanvasNodeCardProps {
  node: CanvasNodeData;
  zoom: number;
  isSelected?: boolean;
  isConnectingSource?: boolean;
  onSelect?: (id: string | number) => void;
  onStartConnect?: (id: string | number) => void;
  onMove?: (id: string | number, x: number, y: number) => void;
  onMoveEnd?: (id: string | number, x: number, y: number) => void;
  onUpdate?: (id: string | number, updates: Partial<CanvasNodeData>) => void;
  onDelete?: (id: string | number) => void;
  className?: string;
}

export const COLOR_THEMES: Record<
  CanvasNodeColor,
  {
    bg: string;
    border: string;
    text: string;
    header: string;
    swatch: string;
    label: string;
  }
> = {
  indigo: {
    bg: "bg-indigo-50/90 dark:bg-indigo-950/50",
    border: "border-indigo-200 dark:border-indigo-800/80",
    text: "text-indigo-950 dark:text-indigo-100",
    header: "text-indigo-700 dark:text-indigo-300 font-semibold",
    swatch: "bg-indigo-500",
    label: "Indigo",
  },
  amber: {
    bg: "bg-amber-50/90 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800/80",
    text: "text-amber-950 dark:text-amber-100",
    header: "text-amber-700 dark:text-amber-300 font-semibold",
    swatch: "bg-amber-500",
    label: "Amber",
  },
  emerald: {
    bg: "bg-emerald-50/90 dark:bg-emerald-950/50",
    border: "border-emerald-200 dark:border-emerald-800/80",
    text: "text-emerald-950 dark:text-emerald-100",
    header: "text-emerald-700 dark:text-emerald-300 font-semibold",
    swatch: "bg-emerald-500",
    label: "Emerald",
  },
  purple: {
    bg: "bg-purple-50/90 dark:bg-purple-950/50",
    border: "border-purple-200 dark:border-purple-800/80",
    text: "text-purple-950 dark:text-purple-100",
    header: "text-purple-700 dark:text-purple-300 font-semibold",
    swatch: "bg-purple-500",
    label: "Purple",
  },
  rose: {
    bg: "bg-rose-50/90 dark:bg-rose-950/50",
    border: "border-rose-200 dark:border-rose-800/80",
    text: "text-rose-950 dark:text-rose-100",
    header: "text-rose-700 dark:text-rose-300 font-semibold",
    swatch: "bg-rose-500",
    label: "Rose",
  },
  zinc: {
    bg: "bg-white dark:bg-zinc-900/90",
    border: "border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-900 dark:text-zinc-100",
    header: "text-zinc-800 dark:text-zinc-200 font-semibold",
    swatch: "bg-zinc-500",
    label: "Zinc",
  },
};

export const CanvasNodeCard: React.FC<CanvasNodeCardProps> = ({
  node,
  zoom,
  isSelected = false,
  isConnectingSource = false,
  onSelect,
  onStartConnect,
  onMove,
  onMoveEnd,
  onUpdate,
  onDelete,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);

  const startDragRef = useRef<{
    pointerX: number;
    pointerY: number;
    nodeX: number;
    nodeY: number;
  } | null>(null);

  const colorStyle = COLOR_THEMES[node.color || "indigo"];

  // Pointer down initiates drag
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Don't drag if clicking buttons or input elements
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        e.button !== 0
      ) {
        return;
      }

      e.stopPropagation();
      onSelect?.(node.id);

      setIsDragging(true);
      startDragRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        nodeX: node.x,
        nodeY: node.y,
      };

      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    },
    [node.id, node.x, node.y, onSelect]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startDragRef.current) return;
      e.stopPropagation();

      // Delta adjusted for canvas zoom level
      const dx = (e.clientX - startDragRef.current.pointerX) / (zoom || 1);
      const dy = (e.clientY - startDragRef.current.pointerY) / (zoom || 1);

      const nextX = Math.round(startDragRef.current.nodeX + dx);
      const nextY = Math.round(startDragRef.current.nodeY + dy);

      onMove?.(node.id, nextX, nextY);
    },
    [node.id, onMove, zoom]
  );

  const lastPosRef = useRef<{ x: number; y: number }>({ x: node.x, y: node.y });
  React.useEffect(() => {
    lastPosRef.current = { x: node.x, y: node.y };
  }, [node.x, node.y]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (startDragRef.current) {
        e.stopPropagation();
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // Fallback
        }
        startDragRef.current = null;
        setIsDragging(false);
        onMoveEnd?.(node.id, lastPosRef.current.x, lastPosRef.current.y);
      }
    },
    [node.id, onMoveEnd]
  );

  return (
    <div
      data-testid={`canvas-node-${node.id}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        "absolute w-72 rounded-xl border p-4 shadow-sm backdrop-blur-md transition-[box-shadow,ring] select-none",
        "touch-none group",
        isConnectingSource
          ? "cursor-crosshair shadow-lg z-30 ring-2 ring-emerald-500 animate-pulse"
          : isDragging
          ? "cursor-grabbing shadow-xl z-30 ring-2 ring-indigo-500/70"
          : isSelected
          ? "cursor-grab shadow-md z-20 ring-2 ring-indigo-500"
          : "cursor-grab hover:shadow-md z-10",
        colorStyle.bg,
        colorStyle.border,
        colorStyle.text,
        className
      )}
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0px)`,
      }}
    >
      {/* Node Header & Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 shrink-0 cursor-grab" />
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              defaultValue={node.title}
              onBlur={(e) => {
                setIsEditingTitle(false);
                const val = e.target.value.trim();
                if (val && val !== node.title) {
                  onUpdate?.(node.id, { title: val });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-full bg-transparent font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
            />
          ) : (
            <h4
              onDoubleClick={() => setIsEditingTitle(true)}
              className={cn(
                "text-sm font-semibold truncate cursor-text",
                colorStyle.header
              )}
              title="Double click to rename"
            >
              {node.title}
            </h4>
          )}
        </div>

        {/* Action icons: Connect, Color Picker & Delete */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect?.(node.id);
            }}
            className={cn(
              "h-6 w-6 p-0 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400",
              isConnectingSource &&
                "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 opacity-100"
            )}
            title="Connect to another node"
          >
            <Link2 className="w-3 h-3" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                title="Change node color"
              >
                <Palette className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 p-1">
              {(Object.keys(COLOR_THEMES) as CanvasNodeColor[]).map((col) => (
                <DropdownMenuItem
                  key={col}
                  onClick={() => onUpdate?.(node.id, { color: col })}
                  className="flex items-center justify-between text-xs py-1 px-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-3 h-3 rounded-full border border-black/10",
                        COLOR_THEMES[col].swatch
                      )}
                    />
                    <span>{COLOR_THEMES[col].label}</span>
                  </div>
                  {node.color === col && (
                    <Check className="w-3 h-3 text-indigo-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(node.id);
            }}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
            title="Delete node"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Node Content Body */}
      {isEditingContent ? (
        <textarea
          autoFocus
          defaultValue={node.content}
          onBlur={(e) => {
            setIsEditingContent(false);
            const val = e.target.value.trim();
            if (val !== node.content) {
              onUpdate?.(node.id, { content: val });
            }
          }}
          rows={3}
          className="w-full text-xs leading-relaxed bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
        />
      ) : (
        <p
          onDoubleClick={() => setIsEditingContent(true)}
          className="text-xs leading-relaxed opacity-90 line-clamp-4 cursor-text"
          title="Double click to edit text"
        >
          {node.content}
        </p>
      )}
    </div>
  );
};
