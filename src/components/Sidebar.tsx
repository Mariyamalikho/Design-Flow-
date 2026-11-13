import { NavLink } from "react-router-dom";
import {
  PenTool,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Image,
  Palette,
  Kanban,
  StickyNote,
  Sparkles,
  ShieldCheck,
  Compass,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen, setGdprModalOpen, setOnboardingModalOpen } =
    useAppStore();

  const navItems = [
    { name: "Dashboard", to: "/", icon: LayoutDashboard },
    { name: "Projects", to: "/projects", icon: FolderKanban },
    { name: "Task Board", to: "/tasks", icon: Kanban },
    { name: "Notes", to: "/notes", icon: StickyNote },
    { name: "Brainstorm Canvas", to: "/canvas", icon: Sparkles },
    { name: "Design Briefs", to: "/briefs", icon: FileText },
    { name: "Moodboards", to: "/moodboards", icon: Image },
    { name: "Brand Identity", to: "/identity", icon: Palette },
  ];

  const renderNavLinks = () => (
    <nav className="p-3.5 space-y-1">
      <p className="px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 mt-3">
        Workspace
      </p>
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          onClick={() => setIsSidebarOpen(false)}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
              isActive
                ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 hover:translate-x-1"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Glowing active indicator bar with smooth expansion */}
              {isActive && (
                <div
                  data-testid="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 dark:bg-indigo-400 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-in fade-in zoom-in-75 duration-200"
                />
              )}
              {/* Animated icon with subtle hover bounce/scale */}
              <item.icon
                className={`w-4 h-4 transition-all duration-200 ease-out ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 scale-110"
                    : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:scale-110"
                }`}
              />
              <span>{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  const renderFooter = () => (
    <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1">
      <button
        type="button"
        onClick={() => {
          setIsSidebarOpen(false);
          setOnboardingModalOpen(true);
        }}
        className="group/btn w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 hover:translate-x-0.5 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        aria-label="Open Welcome Onboarding Tour"
        data-testid="sidebar-welcome-tour-button"
      >
        <Compass className="w-4 h-4 text-indigo-500 shrink-0 transition-transform duration-300 ease-out group-hover/btn:rotate-45 group-hover/btn:scale-110" />
        <span>Quick Welcome Tour</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setIsSidebarOpen(false);
          setGdprModalOpen(true);
        }}
        className="group/btn w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 hover:translate-x-0.5 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        aria-label="Export all workspace data (GDPR Portability)"
        data-testid="sidebar-gdpr-export-button"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-300 ease-out group-hover/btn:scale-110" />
        <span>Privacy &amp; Data Export</span>
      </button>

      <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noreferrer"
          className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          Sitemap
        </a>
        <span>&bull;</span>
        <a
          href="/robots.txt"
          target="_blank"
          rel="noreferrer"
          className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          Robots
        </a>
        <span>&bull;</span>
        <span className="text-[10px]">IndexedDB</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          data-testid="sidebar-mobile-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sheet */}
      <aside
        data-testid="sidebar-mobile-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-label="Mobile Navigation"
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm">
                <PenTool className="w-4 h-4" />
              </div>
              <span className="text-zinc-900 dark:text-zinc-100">
                DesignFlow
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close mobile menu"
              data-testid="sidebar-mobile-close-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderNavLinks()}
        </div>
        {renderFooter()}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-r border-zinc-200 dark:border-zinc-800 flex-col justify-between hidden md:flex z-10 select-none transition-colors duration-200">
        <div>
          {/* Brand Header with subtle logo spring micro-animation */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="group/logo flex items-center gap-2.5 text-xl font-semibold tracking-tight cursor-default">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm transition-transform duration-300 ease-out group-hover/logo:scale-110 group-hover/logo:rotate-6">
                <PenTool className="w-4 h-4 transition-transform duration-300 group-hover/logo:-rotate-6" />
              </div>
              <span className="text-zinc-900 dark:text-zinc-100">
                DesignFlow
              </span>
            </div>
          </div>
          {renderNavLinks()}
        </div>
        {renderFooter()}
      </aside>
    </>
  );
}
