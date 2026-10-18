import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, saveBrandIdentity } from "@/lib/db";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  Loader2, 
  HelpCircle,
  CheckCircle2,
  X
} from "lucide-react";

interface BrandVoiceFormProps {
  projectId: number;
}

const TONE_PRESETS = [
  "Empathetic",
  "Direct",
  "Visionary",
  "Conversational",
  "Authoritative",
  "Playful",
  "Inspirational",
  "Sophisticated",
  "Bold",
  "Warm",
];

interface DoDontRule {
  id: string;
  doText: string;
  dontText: string;
}

const DEFAULT_DOS_AND_DONTS: DoDontRule[] = [
  {
    id: "rule-1",
    doText: "Write with clear, intentional language and active voice.",
    dontText: "Rely on dense corporate jargon or passive phrasing.",
  },
  {
    id: "rule-2",
    doText: "Focus on human benefits and real user outcomes.",
    dontText: "List dry technical specifications without clear context.",
  },
];

export function BrandVoiceForm({ projectId }: BrandVoiceFormProps) {
  const brandIdentity = useLiveQuery(
    () => db.brandIdentities.where("projectId").equals(projectId).first(),
    [projectId]
  );

  const [brandVoice, setBrandVoice] = useState("");
  const [toneAttributes, setToneAttributes] = useState<string[]>(["Direct", "Empathetic"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [dosAndDonts, setDosAndDonts] = useState<DoDontRule[]>(DEFAULT_DOS_AND_DONTS);
  const [targetAudienceNotes, setTargetAudienceNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const isInitialMount = useRef(true);

  // Sync from DB
  useEffect(() => {
    if (brandIdentity) {
      if (brandIdentity.brandVoice !== undefined) setBrandVoice(brandIdentity.brandVoice);
      if (brandIdentity.toneAttributes !== undefined) setToneAttributes(brandIdentity.toneAttributes);
      if (brandIdentity.dosAndDonts && brandIdentity.dosAndDonts.length > 0) {
        setDosAndDonts(brandIdentity.dosAndDonts);
      }
      if (brandIdentity.targetAudienceNotes !== undefined) {
        setTargetAudienceNotes(brandIdentity.targetAudienceNotes);
      }
      setTimeout(() => {
        isInitialMount.current = false;
      }, 300);
    } else {
      isInitialMount.current = false;
    }
  }, [brandIdentity]);

  // Debounced auto-save for all textareas and inputs
  useEffect(() => {
    if (isInitialMount.current) return;

    setAutoSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await saveBrandIdentity(projectId, {
          brandVoice,
          toneAttributes,
          dosAndDonts,
          targetAudienceNotes,
        });
        setAutoSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save failed", err);
        setAutoSaveStatus("idle");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [brandVoice, toneAttributes, dosAndDonts, targetAudienceNotes, projectId]);

  // Toggle Preset Attribute
  const handleTogglePreset = (attr: string) => {
    if (toneAttributes.includes(attr)) {
      setToneAttributes((prev) => prev.filter((t) => t !== attr));
    } else {
      setToneAttributes((prev) => [...prev, attr]);
    }
  };

  // Add Custom Attribute
  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!toneAttributes.includes(trimmed)) {
      setToneAttributes((prev) => [...prev, trimmed]);
    }
    setCustomTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setToneAttributes((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Do's and Don'ts Management
  const handleAddRule = () => {
    const newRule: DoDontRule = {
      id: `rule-${Date.now()}`,
      doText: "",
      dontText: "",
    };
    setDosAndDonts((prev) => [...prev, newRule]);
  };

  const handleUpdateRule = (id: string, field: "doText" | "dontText", value: string) => {
    setDosAndDonts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveRule = (id: string) => {
    setDosAndDonts((prev) => prev.filter((r) => r.id !== id));
  };

  // Save to Database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveBrandIdentity(projectId, {
        brandVoice,
        toneAttributes,
        dosAndDonts,
        targetAudienceNotes,
      });
      toast.success("Brand voice guidelines saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save brand voice guidelines");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Brand Voice & Communication Tone
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Establish the personality, tone attributes, and editorial rules for consistent messaging.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {autoSaveStatus === "saving" && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" /> Auto-saving...
            </span>
          )}
          {autoSaveStatus === "saved" && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Auto-saved
            </span>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-xs text-xs h-8"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Brand Voice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tone Archetype / Summary */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Primary Brand Voice Archetype & Summary
              </label>
              <span className="text-[11px] text-zinc-400">e.g. Bold Innovator, Trusted Advisor</span>
            </div>
            <Input
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              placeholder="e.g. Authoritative yet approachable, speaking with clarity and human warmth..."
              className="text-xs bg-white dark:bg-zinc-900"
            />
            <p className="text-[11px] text-zinc-500">
              Summarize how your brand sounds in one concise statement across all customer touchpoints.
            </p>
          </div>

          {/* Tone Attributes & Chips */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                Tone of Voice Attributes
              </label>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Select 3-5 core attributes that characterize your content style.
              </p>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {TONE_PRESETS.map((preset) => {
                const isSelected = toneAttributes.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleTogglePreset(preset)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <form onSubmit={handleAddCustomTag} className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <Input
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Add custom tone attribute (e.g. Quirky, Methodical)..."
                className="text-xs bg-white dark:bg-zinc-900 flex-1"
              />
              <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </form>

            {/* Selected Tags Display */}
            {toneAttributes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {toneAttributes.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1.5 text-[11px] py-1 px-2.5 bg-zinc-100 dark:bg-zinc-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Do's and Don'ts Editorial Guidelines */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Editorial Do's & Don'ts
                </label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Clear, actionable rules for copywriters, designers, and marketers.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddRule}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" /> Add Rule
              </Button>
            </div>

            <div className="space-y-3">
              {dosAndDonts.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                    <span>Guideline #{idx + 1}</span>
                    {dosAndDonts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule.id)}
                        className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Do
                      </span>
                      <Input
                        value={rule.doText}
                        onChange={(e) => handleUpdateRule(rule.id, "doText", e.target.value)}
                        placeholder="e.g. Use clear headings that outline user value"
                        className="text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <X className="w-3 h-3" /> Don't
                      </span>
                      <Input
                        value={rule.dontText}
                        onChange={(e) => handleUpdateRule(rule.id, "dontText", e.target.value)}
                        placeholder="e.g. Write vague clickbait headlines"
                        className="text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Audience Notes */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
              Audience Context & Communication Nuances
            </label>
            <Textarea
              value={targetAudienceNotes}
              onChange={(e) => setTargetAudienceNotes(e.target.value)}
              placeholder="e.g. When addressing technical buyers, highlight reliability and benchmarks. When speaking to creatives, emphasize flexibility and visual precision..."
              className="text-xs bg-white dark:bg-zinc-900 min-h-[90px]"
            />
          </div>
        </div>

        {/* Right Column: Live Voice Card Specimen */}
        <div className="lg:col-span-4 space-y-5">
          <div className="sticky top-6 space-y-4">
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-purple-950/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Voice Specimen Preview
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Live Preview
                </Badge>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-1">
                  Brand Archetype
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {brandVoice || "Thoughtful & Authoritative"}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-1.5">
                  Tone Attributes
                </span>
                <div className="flex flex-wrap gap-1">
                  {toneAttributes.length > 0 ? (
                    toneAttributes.map((attr) => (
                      <span
                        key={`preview-${attr}`}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300"
                      >
                        {attr}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No attributes chosen yet</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-100 dark:border-zinc-800/80">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-1">
                  Sample Copy in Tone
                </span>
                <blockquote className="text-xs italic text-zinc-600 dark:text-zinc-400 border-l-2 border-indigo-500 pl-3 py-1 my-1">
                  "We believe that great software should feel calm, responsive, and effortlessly intuitive."
                </blockquote>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 space-y-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                Quick Tip
              </span>
              <p className="text-[11px] leading-relaxed">
                Consistency in voice builds audience trust. Keep sentences focused on one core idea and test copy against your Do's and Don'ts rules before publishing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
