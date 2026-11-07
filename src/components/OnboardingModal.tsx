import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Palette,
  Layout,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Layers,
  FileText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { safeLocalStorage } from "@/lib/storageUtils";
import { triggerOnboardingCelebrationConfetti } from "@/lib/confettiUtils";
import { toast } from "sonner";

export const ONBOARDING_STORAGE_KEY = "designflow_onboarding_completed";

export interface OnboardingStep {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  highlights: { title: string; desc: string; icon: React.ElementType }[];
  accentColor: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    badge: "Welcome to DesignFlow",
    title: "Your Creative Direction Studio",
    subtitle: "A local-first, privacy-native hub for modern brand designers.",
    description:
      "DesignFlow unifies brand identity guidelines, moodboard curation, freeform visual brainstorms, and deliverable workflows in one elegant, offline-ready application.",
    icon: Sparkles,
    accentColor: "from-indigo-500 to-violet-600",
    highlights: [
      {
        title: "100% Local & Private",
        desc: "All projects, assets, and notes live in your browser's IndexedDB. Zero tracking, zero telemetry.",
        icon: ShieldCheck,
      },
      {
        title: "Lightning Fast",
        desc: "Instant startup and snappy interactions with client-side indexing and zero network lag.",
        icon: Zap,
      },
      {
        title: "Export & Portability",
        desc: "Export your entire workspace as structured JSON or ZIP archive anytime under GDPR Art. 20.",
        icon: Layers,
      },
    ],
  },
  {
    id: 2,
    badge: "Brand Systems",
    title: "Brand Kits & Color Palettes",
    subtitle: "Define colors, typography pairings, and visual foundations.",
    description:
      "Extract harmonious color schemes directly from reference images, test WCAG 2.1 AA accessibility contrast compliance in real time, and export branded PDF presentations.",
    icon: Palette,
    accentColor: "from-fuchsia-500 to-pink-600",
    highlights: [
      {
        title: "Image Palette Extraction",
        desc: "Upload reference photography to automatically extract vibrant color harmonies and hex codes.",
        icon: Palette,
      },
      {
        title: "WCAG Contrast Checker",
        desc: "Audit foreground and background text legibility with automated WCAG AA compliance ratios.",
        icon: ShieldCheck,
      },
      {
        title: "One-Click Brand Deck",
        desc: "Export professional multi-page PDF presentation decks ready for client handoff.",
        icon: FileText,
      },
    ],
  },
  {
    id: 3,
    badge: "Creative Workspace",
    title: "Brainstorm Canvas & Notes",
    subtitle: "Infinite freeform ideation paired with rich-text markdown notes.",
    description:
      "Map out ideas, connect deliverables, and organize references on an infinite zoomable canvas, or draft client briefs and meeting documentation with TipTap markdown auto-save.",
    icon: Layout,
    accentColor: "from-cyan-500 to-blue-600",
    highlights: [
      {
        title: "Infinite Grid Canvas",
        desc: "Freeform pan and zoom canvas with custom nodes, connectable arrows, and responsive grid layouts.",
        icon: Layout,
      },
      {
        title: "TipTap Markdown Editor",
        desc: "Full rich-text editing with header hierarchies, bullet lists, blockquotes, and instant auto-save.",
        icon: FileText,
      },
      {
        title: "Visual Moodboards",
        desc: "Masonry asset boards for client references, typography specimens, and design inspiration.",
        icon: Sparkles,
      },
    ],
  },
  {
    id: 4,
    badge: "Project Management",
    title: "Kanban Board & Milestones",
    subtitle: "Deliver projects on schedule with agile task workflows.",
    description:
      "Keep track of every design deliverable with customizable Kanban columns, priority ratings, quick due-date presets, milestone timeline grouping, and keyboard shortcuts.",
    icon: CheckCircle2,
    accentColor: "from-emerald-500 to-teal-600",
    highlights: [
      {
        title: "Agile Task Board",
        desc: "Organize deliverables across Todo, In Progress, and Done with smooth drag-and-drop status transitions.",
        icon: CheckCircle2,
      },
      {
        title: "Milestone Timeline",
        desc: "Visualize upcoming deadlines grouped into Overdue, Today, Upcoming This Week, and Completed milestones.",
        icon: Compass,
      },
      {
        title: "Power User Shortcuts",
        desc: "Press 'Cmd+K' for command palette, '?' for shortcuts, 'N' for new tasks, or 'G E' for data export.",
        icon: Zap,
      },
    ],
  },
];

export interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Reset to first step whenever reopened
  useEffect(() => {
    if (open) {
      setCurrentStepIndex(0);
    }
  }, [open]);

  const step = ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = useCallback(() => {
    safeLocalStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    triggerOnboardingCelebrationConfetti();
    toast.success("Welcome aboard! Your workspace is ready.", {
      description: "You can reopen this tour anytime from the sidebar or Command Palette.",
    });
    onOpenChange(false);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete, onOpenChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (!isLastStep) {
          e.preventDefault();
          setCurrentStepIndex((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
        }
      } else if (e.key === "ArrowLeft") {
        if (!isFirstStep) {
          e.preventDefault();
          setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isFirstStep, isLastStep]);

  if (!step) return null;
  const StepIcon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[620px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-dialog-title"
        aria-describedby="onboarding-dialog-description"
      >
        {/* Banner with gradient accent */}
        <div className="relative px-6 pt-7 pb-6 bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800 text-white">
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Skip walkthrough"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              {step.badge}
            </span>
            <span className="text-xs text-white/80 font-medium">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>

          <DialogHeader className="p-0 text-left">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                <StepIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <DialogTitle
                  id="onboarding-dialog-title"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-white"
                >
                  {step.title}
                </DialogTitle>
                <DialogDescription
                  id="onboarding-dialog-description"
                  className="text-sm text-white/90 font-medium mt-1"
                >
                  {step.subtitle}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body content */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {step.highlights.map((highlight, idx) => {
              const HighlightIcon = highlight.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                    <HighlightIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {highlight.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {highlight.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer controls & progress */}
        <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between sm:justify-between">
          {/* Step dots */}
          <div className="flex items-center space-x-1.5" aria-hidden="true">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                  idx === currentStepIndex
                    ? "w-6 bg-indigo-600 dark:bg-indigo-400"
                    : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="text-xs h-8 px-3"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            )}

            {isFirstStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs h-8 px-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Skip Tour
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
