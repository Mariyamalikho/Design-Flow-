import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Moodboard } from "@/components/Moodboard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { Image as ImageIcon, FolderKanban, Plus, ExternalLink } from "lucide-react";
import { safeLocalStorage } from "@/lib/storageUtils";

export default function Moodboards() {
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const projects = useLiveQuery(() => db.projects.toArray());

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(() => {
    if (urlProjectId) {
      const parsed = parseInt(urlProjectId, 10);
      if (!isNaN(parsed)) return parsed;
    }
    const saved = safeLocalStorage.getItem<string | null>("designflow_active_moodboard_project", null);
    return saved ? parseInt(saved, 10) : null;
  });

  // Sync selected project once projects load
  useEffect(() => {
    if (projects && projects.length > 0) {
      if (urlProjectId) {
        const parsed = parseInt(urlProjectId, 10);
        if (!isNaN(parsed) && projects.some((p) => p.id === parsed)) {
          setSelectedProjectId(parsed);
          return;
        }
      }
      // If current selection is invalid or null, default to first project
      if (selectedProjectId === null || !projects.some((p) => p.id === selectedProjectId)) {
        const defaultId = projects[0].id ?? null;
        setSelectedProjectId(defaultId);
        if (defaultId) {
          safeLocalStorage.setItem("designflow_active_moodboard_project", String(defaultId));
        }
      }
    }
  }, [projects, urlProjectId, selectedProjectId]);

  const handleProjectChange = (id: number) => {
    setSelectedProjectId(id);
    safeLocalStorage.setItem("designflow_active_moodboard_project", String(id));
    navigate(`/moodboards/${id}`, { replace: true });
  };

  const isLoading = projects === undefined;
  const currentProject = projects?.find((p) => p.id === selectedProjectId);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex flex-col space-y-6">
      {/* Editorial Header with Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono font-semibold">
              Creative Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Moodboard Studio
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Curate visual inspiration, drag-and-drop imagery, and generate color harmonies across projects.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {projects && projects.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedProjectId || ""}
                  onChange={(e) => handleProjectChange(Number(e.target.value))}
                  aria-label="Select project for moodboard"
                  className="h-9 pl-3 pr-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <FolderKanban className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {selectedProjectId && (
                <Link to={`/projects/${selectedProjectId}`}>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" title="Open Project Details">
                    <span>Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 gap-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <Skeleton className="h-48 w-full rounded-lg mb-3" />
                <Skeleton className="h-4 w-32" />
              </Card>
            ))}
          </div>
        </div>
      ) : !projects || projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No projects found
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            Create your first project to start uploading reference imagery, organizing visual moodboards, and extracting color palettes.
          </p>
          <Button
            className="mt-6 gap-1.5 text-xs"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Create First Project
          </Button>
        </Card>
      ) : selectedProjectId ? (
        <div className="space-y-4">
          {currentProject && (
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">
                Viewing moodboard for <strong className="text-zinc-800 dark:text-zinc-200">{currentProject.title}</strong>
              </span>
            </div>
          )}
          <Moodboard projectId={selectedProjectId} />
        </div>
      ) : null}

      {/* Quick Action: Create Project Modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
