import React from "react";
import type { CanvasConnectionItem } from "@/lib/db";
import { X } from "lucide-react";

export interface NodePosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface CanvasConnectionLineProps {
  connection: CanvasConnectionItem;
  fromNode?: NodePosition;
  toNode?: NodePosition;
  onDelete?: (id: number) => void;
}

export const NODE_DEFAULT_WIDTH = 288;
export const NODE_DEFAULT_HEIGHT = 120;

export function computeConnectionPath(
  from: NodePosition,
  to: NodePosition
): {
  pathData: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  midX: number;
  midY: number;
} {
  const fromW = from.width || NODE_DEFAULT_WIDTH;
  const fromH = from.height || NODE_DEFAULT_HEIGHT;
  const toW = to.width || NODE_DEFAULT_WIDTH;
  const toH = to.height || NODE_DEFAULT_HEIGHT;

  // Compute smart docking points between from and to nodes
  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;

  if (to.x >= from.x + fromW) {
    // Target is to the right
    startX = from.x + fromW;
    startY = from.y + fromH / 2;
    endX = to.x;
    endY = to.y + toH / 2;
  } else if (to.x + toW <= from.x) {
    // Target is to the left
    startX = from.x;
    startY = from.y + fromH / 2;
    endX = to.x + toW;
    endY = to.y + toH / 2;
  } else {
    // Vertically stacked
    startX = from.x + fromW / 2;
    startY = to.y > from.y ? from.y + fromH : from.y;
    endX = to.x + toW / 2;
    endY = to.y > from.y ? to.y : to.y + toH;
  }

  // Smooth cubic bezier curve
  const dx = endX - startX;
  const curvature = Math.max(40, Math.abs(dx) * 0.5);
  const cp1x = startX + (dx >= 0 ? curvature : -curvature);
  const cp1y = startY;
  const cp2x = endX - (dx >= 0 ? curvature : -curvature);
  const cp2y = endY;

  const pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return { pathData, startX, startY, endX, endY, midX, midY };
}

export const CanvasConnectionLine: React.FC<CanvasConnectionLineProps> = ({
  connection,
  fromNode,
  toNode,
  onDelete,
}) => {
  if (!fromNode || !toNode) return null;

  const { pathData, midX, midY } = computeConnectionPath(fromNode, toNode);
  const strokeColor = connection.color || "#6366f1"; // indigo-500 default
  const isDashed = connection.style === "dashed";

  return (
    <g
      data-testid={`canvas-connection-${connection.id}`}
      className="canvas-connection-group group pointer-events-auto cursor-pointer"
    >
      {/* Background thicker stroke for easy hover / selection */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="18"
        className="pointer-events-stroke"
      />

      {/* Visible connector line */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeDasharray={isDashed ? "6 5" : undefined}
        strokeLinecap="round"
        className="transition-all duration-150 group-hover:stroke-indigo-600 dark:group-hover:stroke-indigo-400 group-hover:stroke-[3.5px] opacity-80 group-hover:opacity-100"
      />

      {/* Midpoint badge with label or quick delete button */}
      <foreignObject
        x={midX - 14}
        y={midY - 14}
        width={28}
        height={28}
        className="overflow-visible"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (connection.id !== undefined) {
              onDelete?.(connection.id);
            }
          }}
          className="w-7 h-7 rounded-full bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 shadow-sm flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          title="Delete connection"
          data-testid={`delete-connection-${connection.id}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </foreignObject>

      {/* Connection label if provided */}
      {connection.label && (
        <foreignObject
          x={midX - 60}
          y={midY + 16}
          width={120}
          height={24}
          className="overflow-visible pointer-events-none"
        >
          <div className="text-[10px] text-center font-medium px-2 py-0.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xs text-zinc-600 dark:text-zinc-400 truncate">
            {connection.label}
          </div>
        </foreignObject>
      )}
    </g>
  );
};
