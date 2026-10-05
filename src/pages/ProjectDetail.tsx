import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, MoreVertical, LayoutDashboard, Pencil, Trash2, FileText, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TagsInput } from "@/components/TagsInput";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { EditProjectModal } from "@/components/EditProjectModal";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = parseInt(id || "0", 10);

  const project = useLiveQuery(() => db.projects.get(projectId), [projectId]);
  // Fetch brief if exists
  const brief = useLiveQuery(() => db.briefs.where("projectId").equals(projectId).first(), [projectId]);

  const [tags, setTags] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"board" | "brief">("board");

  useEffect(() => {
    if (project && project.tags) {
      setTags(project.tags);
    }
  }, [project]);

  if (project === undefined) return <div className="p-8">Loading...</div>;
  if (project === null) return <div className="p-8">Project not found.</div>;

  const handleStatusChange = async (status: "active" | "completed" | "archived") => {
    try {
      await db.projects.update(projectId, { status, updatedAt: new Date() });
      toast.success(`Project marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleTagsChange = async (newTags: string[]) => {
    setTags(newTags);
    try {
      await db.projects.update(projectId, { tags: newTags, updatedAt: new Date() });
    } catch (error) {
      toast.error("Failed to save tags");
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const projectTasks = await db.tasks.where("projectId").equals(projectId).toArray();
      const taskIds = projectTasks.map((t) => t.id!).filter(Boolean);
      await db.tasks.bulkDelete(taskIds);
      
      await db.projects.delete(projectId);
      
      toast.success("Project deleted successfully");
      navigate("/projects");
    } catch (error) {
      toast.error("Failed to delete project");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <Button variant="ghost" size="sm" className="-ml-3 mb-4 text-zinc-500" onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{project.title}</h1>
              <Badge variant={project.status === "active" ? "default" : "secondary"} className="mt-1">
                {project.status}
              </Badge>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed mt-2">{project.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Change Status</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Project Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("archived")}>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Project Tags</h3>
            <TagsInput tags={tags} onChange={handleTagsChange} />
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg ml-8 self-end">
            <button 
              onClick={() => setActiveTab("board")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "board" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
            >
              Task Board
            </button>
            <button 
              onClick={() => setActiveTab("brief")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "brief" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
            >
              Design Brief
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-auto">
        {activeTab === "board" ? (
          <div className="h-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
            <LayoutDashboard className="h-10 w-10 mb-4 opacity-20" />
            <p>Kanban Board will be integrated here (Week 10).</p>
          </div>
        ) : (
          <div className="h-full">
            {brief ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Brief Details</h2>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900">
                    <CheckCircle2 className="mr-1.5 h-3 w-3" /> Completed
                  </Badge>
                </div>
                <div className="prose dark:prose-invert">
                  <p><strong>Company:</strong> {brief.companyName}</p>
                  <p><strong>Audience:</strong> {brief.primaryAudience}</p>
                  <p><strong>Deliverables:</strong> {brief.requiredDeliverables}</p>
                  <Button variant="link" onClick={() => navigate("/briefs")} className="px-0">View full brief generator &rarr;</Button>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
                <FileText className="h-12 w-12 mb-4 text-zinc-400 dark:text-zinc-600" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No design brief yet</h3>
                <p className="max-w-sm text-center mb-6">Create a comprehensive design brief for this project to align on goals, audience, and deliverables.</p>
                <Button onClick={() => navigate("/briefs")}>
                  Create Design Brief
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <EditProjectModal project={project} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{project.title}</span>? This action cannot be undone and will permanently delete all associated tasks, assets, and design briefs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
