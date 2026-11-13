import { Link } from "react-router-dom";
import { PenTool, ShieldCheck, Compass, FileCode2, Globe } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function AppFooter() {
  const { setGdprModalOpen, setOnboardingModalOpen } = useAppStore();

  return (
    <footer
      aria-label="DesignFlow studio footer"
      className="pt-12 pb-6 border-t border-zinc-200 dark:border-zinc-800 mt-12 w-full text-zinc-600 dark:text-zinc-400"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Studio Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-indigo-500 flex items-center justify-center text-white shadow-xs">
                <PenTool className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                DesignFlow
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Local-first creative direction studio and brand platform. Zero cloud tracking, instant IndexedDB performance, and client-ready brand decks.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Local-First Offline Ready
            </div>
          </div>

          {/* Creative Studios Directory */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Creative Studios
            </h4>
            <nav className="flex flex-col space-y-2 text-xs">
              <Link to="/identity" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Brand Identity Studio
              </Link>
              <Link to="/moodboards" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Visual Moodboard Studio
              </Link>
              <Link to="/canvas" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Brainstorm Canvas
              </Link>
              <Link to="/briefs" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Interactive Design Briefs
              </Link>
            </nav>
          </div>

          {/* Deliverables & Workspace */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Deliverables
            </h4>
            <nav className="flex flex-col space-y-2 text-xs">
              <Link to="/projects" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Projects Directory
              </Link>
              <Link to="/tasks" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Kanban Task Board
              </Link>
              <Link to="/notes" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Creative Notes &amp; Copy
              </Link>
              <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Studio Overview
              </Link>
            </nav>
          </div>

          {/* Privacy, Sitemap & Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Privacy &amp; System
            </h4>
            <nav className="flex flex-col space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setGdprModalOpen(true)}
                className="text-left hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>GDPR Data Export</span>
              </button>
              <button
                type="button"
                onClick={() => setOnboardingModalOpen(true)}
                className="text-left hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Interactive Tour</span>
              </button>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5"
              >
                <FileCode2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>XML Sitemap</span>
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Robots Directive</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Baseline Bar */}
        <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            &copy; {new Date().getFullYear()} DesignFlow. Designed by Mariya Malik for brand strategists and design studios.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% In-Browser Dexie DB</span>
            <span>&bull;</span>
            <span>Zero Vendor Lock-in</span>
            <span>&bull;</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
