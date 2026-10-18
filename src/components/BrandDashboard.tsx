import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { BrandDeckModal } from "./BrandDeckModal";
import { 
  loadGoogleFont, 
  getFullFontFamilyString, 
  calculateTypeScaleRatio,
  pxToRem 
} from "@/lib/fontUtils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { 
  Compass, 
  MessageSquare, 
  Type, 
  Palette, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Target, 
  Eye, 
  Award, 
  XCircle,
  Copy,
  Printer,
  Sliders,
  ArrowRight
} from "lucide-react";

interface BrandDashboardProps {
  projectId: number;
  onNavigateTab?: (tab: "pairing" | "catalogue" | "voice" | "mission") => void;
}

export function BrandDashboard({ projectId, onNavigateTab }: BrandDashboardProps) {
  const project = useLiveQuery(() => db.projects.get(projectId), [projectId]);
  const brandIdentity = useLiveQuery(
    () => db.brandIdentities.where("projectId").equals(projectId).first(),
    [projectId]
  );
  const paletteColors = useLiveQuery(
    () => db.paletteColors.where("projectId").equals(projectId).toArray(),
    [projectId]
  );
  const assetsCount = useLiveQuery(
    () => db.assets.where("projectId").equals(projectId).count(),
    [projectId]
  );
  const moodboardCount = useLiveQuery(
    () => db.moodboardItems.where("projectId").equals(projectId).count(),
    [projectId]
  );

  const headingFont = brandIdentity?.headingFont || "Playfair Display";
  const bodyFont = brandIdentity?.bodyFont || "Inter";
  const headingWeight = brandIdentity?.headingWeight || 700;
  const bodyWeight = brandIdentity?.bodyWeight || 400;
  const headingSize = brandIdentity?.headingSize || 36;
  const bodySize = brandIdentity?.bodySize || 16;
  const headingLineHeight = brandIdentity?.headingLineHeight || 1.2;
  const bodyLineHeight = brandIdentity?.bodyLineHeight || 1.6;

  // Preload fonts to eliminate FOUT
  useEffect(() => {
    loadGoogleFont(headingFont, [headingWeight]);
    loadGoogleFont(bodyFont, [bodyWeight]);
  }, [headingFont, headingWeight, bodyFont, bodyWeight]);

  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex} to clipboard!`);
  };

  const handlePrint = () => {
    setIsDeckModalOpen(true);
  };

  // Completeness score
  const itemsCompleted = [
    Boolean(brandIdentity?.missionStatement),
    Boolean(brandIdentity?.visionStatement),
    Boolean(brandIdentity?.coreValues && brandIdentity.coreValues.length > 0),
    Boolean(brandIdentity?.brandVoice),
    Boolean(brandIdentity?.toneAttributes && brandIdentity.toneAttributes.length > 0),
    Boolean(brandIdentity?.headingFont),
    Boolean(paletteColors && paletteColors.length > 0),
  ];
  const completionPercentage = Math.round(
    (itemsCompleted.filter(Boolean).length / itemsCompleted.length) * 100
  );

  const typeRatio = calculateTypeScaleRatio(headingSize, bodySize);

  return (
    <div className="space-y-8 font-rendered">
      {/* Brand Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 text-white p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Master Brand Guidelines
              </span>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs text-zinc-300 font-medium">
                {project?.title || "Brand System"}
              </span>
            </div>

            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50"
              style={{ fontFamily: getFullFontFamilyString(headingFont) }}
            >
              {brandIdentity?.tagline || project?.description || "Design elevates everyday software experiences."}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              {brandIdentity?.missionStatement || 
                "A unified single source of truth for brand voice, visual aesthetics, typography hierarchy, and color palettes."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-9 gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/10"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Export Deck
            </Button>
            {onNavigateTab && (
              <Button
                size="sm"
                onClick={() => onNavigateTab("pairing")}
                className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              >
                Customize System <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Identity Completeness Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-[11px]">Brand Completeness:</span>
            <div className="w-36 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-zinc-300 font-semibold">
              {completionPercentage}%
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono">
            <span>{paletteColors?.length || 0} Colors</span>
            <span>·</span>
            <span>2 Typefaces</span>
            <span>·</span>
            <span>{assetsCount || 0} Assets</span>
            <span>·</span>
            <span>{moodboardCount || 0} Moodboard Items</span>
          </div>
        </div>
      </div>

      {/* Grid: Mission & Vision + Brand Voice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission & Vision Card */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              Mission, Vision & Core Values
            </h3>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("mission")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Edit <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Mission Statement
              </span>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {brandIdentity?.missionStatement || 
                  "To build intuitive software experiences that simplify complex workflows for creators everywhere."}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Long-Term Vision
              </span>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {brandIdentity?.visionStatement || 
                  "A world where software and accessible digital experiences are effortlessly built without technical barriers."}
              </p>
            </div>

            {brandIdentity?.coreValues && brandIdentity.coreValues.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Core Brand Values
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {brandIdentity.coreValues.map((val) => (
                    <div 
                      key={val.id} 
                      className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-1"
                    >
                      <strong className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                        {val.title}
                      </strong>
                      <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2">
                        {val.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Brand Voice & Editorial Rules Card */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Voice, Tone & Editorial Rules
            </h3>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("voice")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Edit <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold block">
                Primary Brand Archetype
              </span>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {brandIdentity?.brandVoice || "Thoughtful, Authoritative & Human"}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Tone Attributes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(brandIdentity?.toneAttributes && brandIdentity.toneAttributes.length > 0 
                  ? brandIdentity.toneAttributes 
                  : ["Direct", "Empathetic", "Visionary"]
                ).map((attr) => (
                  <Badge 
                    key={attr} 
                    variant="secondary"
                    className="text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900"
                  >
                    {attr}
                  </Badge>
                ))}
              </div>
            </div>

            {brandIdentity?.dosAndDonts && brandIdentity.dosAndDonts.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Key Editorial Guidelines
                </span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {brandIdentity.dosAndDonts.map((rule) => (
                    <div 
                      key={rule.id}
                      className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 grid grid-cols-2 gap-2 text-xs"
                    >
                      <div className="text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{rule.doText || "Be clear"}</span>
                      </div>
                      <div className="text-rose-700 dark:text-rose-400 flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{rule.dontText || "Avoid jargon"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color Palette Section */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Brand Color System
            </h3>
            <Badge variant="outline" className="text-[10px] font-mono">
              {paletteColors?.length || 0} Colors
            </Badge>
          </div>
          <span className="text-[11px] text-zinc-400">Click swatch to copy HEX code</span>
        </div>

        {paletteColors && paletteColors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {paletteColors.map((color) => (
              <div
                key={color.id || color.hex}
                onClick={() => copyHex(color.hex)}
                className="group cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 hover:shadow-md transition-all space-y-2 text-center"
              >
                <div 
                  className="w-full h-16 rounded-lg shadow-inner border border-black/5 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: color.hex }}
                >
                  <Copy className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    {color.hex.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-400 capitalize block truncate">
                    {color.name || "Brand Color"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
            <Palette className="w-8 h-8 mx-auto text-zinc-400 opacity-40" />
            <p className="text-xs text-zinc-500">No custom colors saved yet.</p>
            <p className="text-[11px] text-zinc-400">Add colors in the Colors tab to populate your master palette.</p>
          </div>
        )}
      </div>

      {/* Typography & Specimen Section */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Typography Hierarchy & Pairing Specimen
            </h3>
            <Badge variant="outline" className="text-[10px] font-mono">
              Scale: {typeRatio}x
            </Badge>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("pairing")}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Adjust in Studio <Sliders className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Font Specimen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Primary Heading Font
              </span>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {headingWeight} Weight
              </Badge>
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {headingFont}
            </h4>
            <p className="text-[11px] text-zinc-400">
              Size: {headingSize}px ({pxToRem(headingSize)}) · Line Height: {headingLineHeight}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Secondary Body Font
              </span>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {bodyWeight} Weight
              </Badge>
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {bodyFont}
            </h4>
            <p className="text-[11px] text-zinc-400">
              Size: {bodySize}px ({pxToRem(bodySize)}) · Line Height: {bodyLineHeight}
            </p>
          </div>
        </div>

        {/* Live Specimen Article Preview */}
        <div className="p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold block">
            Brand Specimen
          </span>
          <h2
            className="text-zinc-900 dark:text-zinc-50 font-smooth-swap"
            style={{
              fontFamily: getFullFontFamilyString(headingFont),
              fontWeight: headingWeight,
              fontSize: `${Math.min(headingSize, 38)}px`,
              lineHeight: headingLineHeight,
            }}
          >
            {brandIdentity?.tagline || "Crafting digital experiences with precision."}
          </h2>
          <p
            className="text-zinc-700 dark:text-zinc-300 max-w-2xl font-smooth-swap leading-relaxed"
            style={{
              fontFamily: getFullFontFamilyString(bodyFont),
              fontWeight: bodyWeight,
              fontSize: `${bodySize}px`,
              lineHeight: bodyLineHeight,
            }}
          >
            {brandIdentity?.missionStatement ||
              "Design systems establish clear visual patterns, scale brand consistency across every viewport, and reduce cognitive friction for users."}
          </p>
        </div>
      </div>

      {/* Agency Brand Guidelines Deck Modal Preview & PDF Export */}
      <BrandDeckModal
        projectId={projectId}
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
      />
    </div>
  );
}
