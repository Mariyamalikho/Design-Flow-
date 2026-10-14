import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  FolderKanban, 
  LayoutGrid, 
  List, 
  Search, 
  ArrowRight, 
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { db } from "@/lib/db";

export default function Projects() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    return (localStorage.getItem("projects-view-mode") as "grid" | "table") || "grid";
  });

  const projects = useLiveQuery(() => db.projects.toArray());

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("projects-view-mode", mode);
  };

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.tags && project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStatus = statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your design briefs, moodboards, brand palettes, and client assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange("table")}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {projects && projects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search projects, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["all", "active", "completed", "archived"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!projects || projects.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold">No projects created yet</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Create your first branding project to start building briefs, gathering moodboard inspiration, and curating color palettes.
            </p>
            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Create First Project
            </Button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No matching projects found</p>
          <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query or status filter.</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4"
            onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              onClick={() => navigate(`/projects/${project.id}`)}
              className="hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.title}
                  </CardTitle>
                  <Badge 
                    variant={project.status === "active" ? "default" : "secondary"}
                    className="capitalize shrink-0 text-[10px]"
                  >
                    {project.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 mt-1.5 text-xs">
                  {project.description || "No project description provided."}
                </CardDescription>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-[10px] text-zinc-400 self-center">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardFooter className="text-[11px] text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* Table Layout */
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-950/50">
              <TableRow>
                <TableHead className="w-[300px]">Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="cursor-pointer group"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-semibold">
                        {project.title}
                      </span>
                      {project.description && (
                        <span className="text-xs text-zinc-400 truncate max-w-sm mt-0.5">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={project.status === "active" ? "default" : "secondary"}
                      className="capitalize text-[10px]"
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {project.tags && project.tags.length > 0 ? (
                        project.tags.slice(0, 2).map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-medium"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2.5 text-xs text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    >
                      Open
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
