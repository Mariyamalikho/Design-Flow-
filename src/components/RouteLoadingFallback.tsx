import React from "react";
import { Loader2 } from "lucide-react";

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      className="flex-1 h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-zinc-400 select-none animate-in fade-in-50 duration-200"
      data-testid="route-loading-fallback"
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs mb-3">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
        Loading workspace...
      </p>
    </div>
  );
};
