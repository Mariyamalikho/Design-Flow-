import { Search, Bell, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function TopNav() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
        <Search className="w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search projects, assets, or tags... (Cmd+K)" 
          className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-zinc-400 dark:placeholder:text-zinc-500" 
        />
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="bg-zinc-900 dark:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
    </header>
  );
}
