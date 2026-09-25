import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Projects() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your branding projects and design briefs.</p>
        </div>
        <Button className="hidden md:flex">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 mt-6">
        <div className="flex flex-col items-center text-center p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <Plus className="h-10 w-10 text-zinc-400" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No projects created</h2>
          <p className="mt-2 text-center text-sm font-normal leading-6 text-zinc-500 max-w-sm">
            You do not have any active design projects. Create one to start managing your brand identities and tasks.
          </p>
          <Button className="mt-6 md:hidden">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>
      
      {/* Floating Action Button for Mobile */}
      <Button className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
