import { Search, Bell, Moon, Sun, Command } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function TopNav() {
  const { theme, setTheme, setCommandPaletteOpen } = useAppStore();

  return (
    <header className="h-16 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 z-10 sticky top-0 shrink-0">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="relative w-full text-left cursor-pointer group"
          data-testid="topnav-search-button"
          aria-label="Open command palette"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
          <div className="w-full pl-9 pr-14 py-2 bg-zinc-100/50 dark:bg-zinc-800/50 border border-transparent group-hover:border-zinc-300 dark:group-hover:border-zinc-700 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 transition-all select-none">
            Search projects, tasks, or tags...
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-500">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </div>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Toggle light and dark theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
