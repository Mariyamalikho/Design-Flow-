import { Link } from "react-router-dom";
import { FolderKanban, ArrowLeft, Palette, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePageSeo } from "@/hooks/usePageSeo";

export default function NotFound() {
  usePageSeo({
    title: "Page Not Found | DesignFlow",
    description: "The requested creative workspace page could not be located.",
    canonicalPath: "/404",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-6 border border-zinc-200 dark:border-zinc-700">
        <Sparkles className="w-8 h-8 text-zinc-500" />
      </div>

      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
        Error 404
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
        Workspace Page Not Found
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm leading-relaxed">
        The workspace URL you navigated to does not exist or has been archived. Explore your active creative studios below:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8 text-left">
        <Link
          to="/projects"
          className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          <FolderKanban className="w-4 h-4 text-zinc-400" />
          <span>Projects Directory</span>
        </Link>
        <Link
          to="/identity"
          className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          <Palette className="w-4 h-4 text-indigo-500" />
          <span>Brand Identity Studio</span>
        </Link>
        <Link
          to="/moodboards"
          className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          <ImageIcon className="w-4 h-4 text-emerald-500" />
          <span>Moodboard Studio</span>
        </Link>
        <Link
          to="/canvas"
          className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Brainstorm Canvas</span>
        </Link>
      </div>

      <Link to="/">
        <Button size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Studio Overview</span>
        </Button>
      </Link>
    </div>
  );
}
