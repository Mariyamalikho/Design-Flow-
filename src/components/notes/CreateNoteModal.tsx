import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  FileText,
  Briefcase,
  Users,
  Lightbulb,
  FolderKanban,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CreateNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    content: string;
    projectId?: number;
  }) => Promise<void>;
  projects?: { id?: number; title: string }[];
  defaultProjectId?: number;
}

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  content: string;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank Note",
    description: "Start with a clean slate for rapid thoughts",
    icon: FileText,
    defaultTitle: "Untitled Note",
    content: "<p>Start writing your thoughts, design ideas, or project brief...</p>",
  },
  {
    id: "brief",
    name: "Project Brief",
    description: "Structured design goals, audience, and scope",
    icon: Briefcase,
    defaultTitle: "Project Design Brief",
    content: `<h1>Project Design Brief</h1><p><strong>Overview:</strong> Define the creative challenge and business goals.</p><h2>Target Audience</h2><ul><li>Primary demographics</li><li>Core user pain points</li></ul><h2>Key Deliverables</h2><ul><li>Design system tokens</li><li>Responsive screen layouts</li><li>Component library</li></ul>`,
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    description: "Agenda, discussion points, and action items",
    icon: Users,
    defaultTitle: "Design Review Notes",
    content: `<h1>Design Review Meeting</h1><p><strong>Date:</strong> Today | <strong>Attendees:</strong> Product & Design Teams</p><h2>Agenda</h2><ol><li>Review latest mockup revisions</li><li>Clarify typography hierarchy</li></ol><h2>Action Items</h2><ul><li>Export SVG brand assets</li><li>Follow up on client feedback</li></ul>`,
  },
  {
    id: "brainstorm",
    name: "Brainstorming",
    description: "Crazy 8s, divergent hypotheses, and ideas",
    icon: Lightbulb,
    defaultTitle: "Creative Brainstorm",
    content: `<h1>Creative Brainstorming Canvas</h1><blockquote>&quot;Every great design begins with an unconventional question.&quot;</blockquote><h2>Hypotheses & Concepts</h2><ul><li>Concept A: Frictionless onboarding flow</li><li>Concept B: Card-based visual dashboard</li></ul><h2>Next Steps</h2><p>Synthesize team feedback and sketch high-fidelity prototypes.</p>`,
  },
];

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  projects,
  defaultProjectId,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState("blank");
  const [title, setTitle] = useState("Untitled Note");
  const [projectId, setProjectId] = useState<number | undefined>(
    defaultProjectId
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate =
    NOTE_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    NOTE_TEMPLATES[0];

  const handleSelectTemplate = (template: NoteTemplate) => {
    setSelectedTemplateId(template.id);
    if (!title || title === "Untitled Note" || NOTE_TEMPLATES.some((t) => t.defaultTitle === title)) {
      setTitle(template.defaultTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        content: selectedTemplate.content,
        projectId,
      });
      onOpenChange(false);
      // Reset form
      setTitle("Untitled Note");
      setSelectedTemplateId("blank");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        data-testid="create-note-modal"
      >
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
          <DialogDescription>
            Choose a starting template and customize your note details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Template Selection Cards */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
              Select Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NOTE_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between",
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500 shadow-2xs"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center",
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {tmpl.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Title */}
          <div>
            <label
              htmlFor="create-note-title"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5"
            >
              Note Title
            </label>
            <Input
              id="create-note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design System Principles"
              required
              className="text-xs"
            />
          </div>

          {/* Project Association */}
          <div>
            <label
              htmlFor="create-note-project"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5"
            >
              Assign to Project (Optional)
            </label>
            <div className="relative">
              <FolderKanban className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select
                id="create-note-project"
                value={projectId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setProjectId(val === "" ? undefined : parseInt(val, 10));
                }}
                className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-8 pr-2 py-2 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">No Project (General Note)</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? "Creating..." : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
