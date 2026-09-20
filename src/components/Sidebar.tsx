import { NavLink } from "react-router-dom";
import { PenTool, LayoutDashboard, FolderKanban, FileText, Image, Palette } from "lucide-react";

export function Sidebar() {
  const navItems = [
    { name: "Dashboard", to: "/", icon: LayoutDashboard },
    { name: "Projects", to: "/projects", icon: FolderKanban },
    { name: "Design Briefs", to: "/briefs", icon: FileText },
    { name: "Moodboards", to: "/moodboards", icon: Image },
    { name: "Brand Identity", to: "/identity", icon: Palette },
  ];

  return (
    <aside className="w-64 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hidden md:flex z-10">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-indigo-500 flex items-center justify-center text-white">
              <PenTool className="w-4 h-4" />
            </div>
            DesignFlow
          </div>
        </div>
        <nav className="p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 mt-4">Workspace</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-500 dark:text-indigo-400" : ""}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
