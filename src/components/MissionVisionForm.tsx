import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, saveBrandIdentity } from "@/lib/db";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { 
  Compass, 
  Target, 
  Eye, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Award,
  HelpCircle 
} from "lucide-react";

interface MissionVisionFormProps {
  projectId: number;
}

interface CoreValueItem {
  id: string;
  title: string;
  description: string;
}

const DEFAULT_CORE_VALUES: CoreValueItem[] = [
  {
    id: "val-1",
    title: "Radical Craftsmanship",
    description: "Obsess over the details and deliver intentional work that exceeds expectations.",
  },
  {
    id: "val-2",
    title: "Human-First Empathy",
    description: "Design technology that adapts gracefully to people, reducing friction and stress.",
  },
  {
    id: "val-3",
    title: "Transparent Collaboration",
    description: "Clear communication, honest feedback, and open processes build lasting partnerships.",
  },
];

export function MissionVisionForm({ projectId }: MissionVisionFormProps) {
  const brandIdentity = useLiveQuery(
    () => db.brandIdentities.where("projectId").equals(projectId).first(),
    [projectId]
  );

  const [tagline, setTagline] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [visionStatement, setVisionStatement] = useState("");
  const [coreValues, setCoreValues] = useState<CoreValueItem[]>(DEFAULT_CORE_VALUES);
  const [isSaving, setIsSaving] = useState(false);

  // Sync from DB
  useEffect(() => {
    if (brandIdentity) {
      if (brandIdentity.tagline !== undefined) setTagline(brandIdentity.tagline);
      if (brandIdentity.missionStatement !== undefined) setMissionStatement(brandIdentity.missionStatement);
      if (brandIdentity.visionStatement !== undefined) setVisionStatement(brandIdentity.visionStatement);
      if (brandIdentity.coreValues && brandIdentity.coreValues.length > 0) {
        setCoreValues(brandIdentity.coreValues);
      }
    }
  }, [brandIdentity]);

  // Core Values Handlers
  const handleAddValue = () => {
    const newValue: CoreValueItem = {
      id: `val-${Date.now()}`,
      title: "",
      description: "",
    };
    setCoreValues((prev) => [...prev, newValue]);
  };

  const handleUpdateValue = (id: string, field: "title" | "description", value: string) => {
    setCoreValues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveValue = (id: string) => {
    setCoreValues((prev) => prev.filter((v) => v.id !== id));
  };

  // Save to Database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveBrandIdentity(projectId, {
        tagline,
        missionStatement,
        visionStatement,
        coreValues,
      });
      toast.success("Mission, vision & values saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save brand identity");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            Brand Mission, Vision & Core Values
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Define your organization's overarching purpose, long-term aspirations, and guiding values.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-xs shrink-0 text-xs h-8"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Mission & Vision
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Brand Tagline */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
              Brand Tagline / Slogan
            </label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Design faster. Collaborate effortlessly."
              className="text-xs bg-white dark:bg-zinc-900"
            />
            <p className="text-[11px] text-zinc-500">
              A memorable, punchy hook that encapsulates your brand promise.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                Mission Statement
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Present Focus (Today)</span>
            </div>
            <Textarea
              value={missionStatement}
              onChange={(e) => setMissionStatement(e.target.value)}
              placeholder="e.g. To empower modern creative teams with unified design engineering tools that turn raw concepts into production-ready software without friction."
              className="text-xs bg-white dark:bg-zinc-900 min-h-[90px]"
            />
            <p className="text-[11px] text-zinc-500">
              What does your organization do today? Who does it serve, and how does it create value?
            </p>
          </div>

          {/* Vision Statement */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-purple-500" />
                Vision Statement
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Future Aspiration (5-10 yrs)</span>
            </div>
            <Textarea
              value={visionStatement}
              onChange={(e) => setVisionStatement(e.target.value)}
              placeholder="e.g. A digital world where beautiful software and accessible user experiences are effortlessly created by teams of all sizes without technical barriers."
              className="text-xs bg-white dark:bg-zinc-900 min-h-[90px]"
            />
            <p className="text-[11px] text-zinc-500">
              Where is your company heading in the long term? What transformative future are you building?
            </p>
          </div>

          {/* Core Values */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Core Brand Values
                </label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  The non-negotiable principles that drive decision-making and product excellence.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddValue}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" /> Add Value
              </Button>
            </div>

            <div className="space-y-3">
              {coreValues.map((val, idx) => (
                <div
                  key={val.id}
                  className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                    <span>Value #{idx + 1}</span>
                    {coreValues.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(val.id)}
                        className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                        title="Delete value"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={val.title}
                      onChange={(e) => handleUpdateValue(val.id, "title", e.target.value)}
                      placeholder="Value Name (e.g. Radical Simplicity)"
                      className="text-xs font-medium bg-white dark:bg-zinc-900"
                    />
                    <Textarea
                      value={val.description}
                      onChange={(e) => handleUpdateValue(val.id, "description", e.target.value)}
                      placeholder="Brief description of what this value means in practice..."
                      className="text-xs bg-white dark:bg-zinc-900 min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Mission/Vision Preview Specimen */}
        <div className="lg:col-span-4 space-y-5">
          <div className="sticky top-6 space-y-4">
            <div className="bg-gradient-to-br from-indigo-500/10 via-white to-purple-500/10 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-purple-950/30 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Brand Identity Specimen
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Live Preview
                </Badge>
              </div>

              {tagline && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-1">
                    Tagline
                  </span>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 italic">
                    "{tagline}"
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-1">
                  Our Mission
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {missionStatement || "To build intuitive software experiences that simplify complex workflows."}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-1">
                  Our Vision
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {visionStatement || "A future where every digital interaction is fast, accessible, and delightful."}
                </p>
              </div>

              {coreValues.length > 0 && (
                <div className="pt-3 border-t border-indigo-100 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-2">
                    Core Values ({coreValues.length})
                  </span>
                  <div className="space-y-2">
                    {coreValues.map((val) => (
                      <div key={`preview-${val.id}`} className="text-xs">
                        <strong className="text-zinc-800 dark:text-zinc-200 block font-medium">
                          • {val.title || "Untitled Value"}
                        </strong>
                        {val.description && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pl-3">
                            {val.description}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 space-y-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                Strategic Alignment
              </span>
              <p className="text-[11px] leading-relaxed">
                A well-defined mission grounds your team in daily execution, while a clear vision gives purpose and motivation for future product milestones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
