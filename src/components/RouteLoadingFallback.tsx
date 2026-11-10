import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-150"
      data-testid="route-loading-fallback"
      aria-busy="true"
      aria-label="Loading workspace"
    >
      {/* Screen-reader indicator for accessibility and test suites */}
      <span className="sr-only">Loading workspace...</span>

      {/* Editorial Header Skeleton */}
      <div className="space-y-3 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      {/* Architectural Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <Skeleton className="h-28 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
