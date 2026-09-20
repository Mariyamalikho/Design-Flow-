import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export function AppLayout() {
  return (
    <div className="h-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl opacity-50 pointer-events-none"></div>
        <TopNav />
        <div className="flex-1 overflow-y-auto z-10 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
