import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/db";

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projects = useLiveQuery(() => db.projects.toArray());

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your branding projects and design briefs.</p>
        </div>
        <Button className="hidden md:flex" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 mt-6">
          <div className="flex flex-col items-center text-center p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
              <FolderKanban className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No projects created</h2>
            <p className="mt-2 text-center text-sm font-normal leading-6 text-zinc-500 max-w-sm">
              You do not have any active design projects. Create one to start managing your brand identities and tasks.
            </p>
            <Button className="mt-6 md:hidden" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate">{project.title}</CardTitle>
                  <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                </div>
                <CardDescription className="line-clamp-2 mt-2">{project.description}</CardDescription>
              </CardHeader>
              <CardFooter className="text-xs text-zinc-500 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Button className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="icon" onClick={() => setIsModalOpen(true)}>
        <Plus className="h-6 w-6" />
      </Button>
      
      <CreateProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
