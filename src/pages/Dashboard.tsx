import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePageSeo } from "@/hooks/usePageSeo";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight,
  Calendar,
  Palette,
  Image as ImageIcon,
} from "lucide-react";

export default function Dashboard() {
  usePageSeo({
    title: "Dashboard | DesignFlow — Creative Workspace & Brand Platform",
    description: "Local-first creative workspace overview, active deliverables, visual moodboards, and brand identity assets.",
    canonicalPath: "/",
    keywords: "creative workspace, design direction, brand identity dashboard, local-first indexeddb, design agency management",
  });

  const projects = useLiveQuery(() => db.projects.toArray());
  const activeProjects = useLiveQuery(() => db.projects.where("status").equals("active").toArray());
  const pendingTasks = useLiveQuery(() => db.tasks.where("status").notEqual("done").toArray());
  const completedTasks = useLiveQuery(() => db.tasks.where("status").equals("done").toArray());
  const notes = useLiveQuery(() => db.notes.orderBy("updatedAt").reverse().limit(5).toArray());

  const isLoading = projects === undefined || pendingTasks === undefined;

  const totalProjects = projects?.length || 0;
  const activeCount = activeProjects?.length || 0;
  const pendingCount = pendingTasks?.length || 0;
  const doneCount = completedTasks?.length || 0;
  const totalTasks = pendingCount + doneCount;
  const taskCompletionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Good morning
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            Here is your workspace overview, active deliverables, and creative assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/canvas">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span>Canvas</span>
            </Button>
          </Link>
          <Link to="/projects">
            <Button size="sm" className="h-9 gap-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white">
              <Plus className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Active Projects</span>
              <FolderKanban className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{activeCount}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {totalProjects} total in local database
            </p>
          </Card>

          <Card className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Pending Deliverables</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{pendingCount}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {doneCount} completed so far
            </p>
          </Card>

          <Card className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Task Completion</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{taskCompletionRate}%</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {doneCount} of {totalTasks} tasks resolved
            </p>
          </Card>

          <Card className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Notes & Specs</span>
              <FileText className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{notes?.length || 0}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Markdown documentation records
            </p>
          </Card>
        </div>
      )}

      {/* Featured Creative Studios Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/identity"
          className="group block p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <Palette className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Brand Identity Studio
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Typography pairings, WCAG 2.1 AA palettes &amp; brand decks
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors shrink-0 mt-2.5" />
          </div>
        </Link>

        <Link
          to="/moodboards"
          className="group block p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Visual Moodboard Studio
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Multi-column moodboards, reference imagery &amp; Unsplash search
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors shrink-0 mt-2.5" />
          </div>
        </Link>
      </div>

      {/* Main Content: Projects and Notes Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-500" />
              Active Projects
            </h2>
            <Link to="/projects" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-3 w-64" />
                </Card>
              ))}
            </div>
          ) : !projects || projects.length === 0 ? (
            <Card className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
              <FolderKanban className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No active projects</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Create your first project to start organizing brand guidelines, moodboards, and deliverable tasks.
              </p>
              <Link to="/projects" className="inline-block mt-4">
                <Button size="sm" className="h-8 gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Create Project
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block group"
                >
                  <Card className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {project.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            project.status === "active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : project.status === "completed"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {project.description || "No description provided."}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Documentation & Notes Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              Recent Notes
            </h2>
            <Link to="/notes" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1">
              Open notes <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <Skeleton className="h-4 w-36 mb-1.5" />
                  <Skeleton className="h-3 w-24" />
                </Card>
              ))}
            </div>
          ) : !notes || notes.length === 0 ? (
            <Card className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
              <FileText className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">No notes created yet.</p>
              <Link to="/notes" className="inline-block mt-3">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Create Note
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  to="/notes"
                  className="block group"
                >
                  <Card className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {note.title || "Untitled Document"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "Recently"}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
