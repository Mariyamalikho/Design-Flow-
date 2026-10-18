import { useMemo } from "react";
import type { Project, BrandIdentity, PaletteColor } from "@/lib/db";
import { 
  getFullFontFamilyString, 
  calculateTypeScaleRatio, 
  pxToRem 
} from "@/lib/fontUtils";
import { formatRgbString } from "@/lib/brandPdfUtils";
import { getContrastRatio, checkWCAGCompliance } from "@/lib/colorUtils";
import { 
  Sparkles, 
  Target, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Type, 
  Palette, 
  Layers, 
  Compass, 
  MessageSquare,
  ImageIcon
} from "lucide-react";

export interface LocalDeckAsset {
  id: number;
  name: string;
  dataUrl: string;
}

export interface BrandGuidelinesPdfTemplateProps {
  project?: Project;
  brandIdentity?: BrandIdentity;
  paletteColors?: PaletteColor[];
  localAssets?: LocalDeckAsset[];
  activeSlideIndex?: number | "all";
}

export function BrandGuidelinesPdfTemplate({
  project,
  brandIdentity,
  paletteColors = [],
  localAssets = [],
  activeSlideIndex = "all"
}: BrandGuidelinesPdfTemplateProps) {
  const headingFont = brandIdentity?.headingFont || "Playfair Display";
  const bodyFont = brandIdentity?.bodyFont || "Inter";
  const headingWeight = brandIdentity?.headingWeight || 700;
  const bodyWeight = brandIdentity?.bodyWeight || 400;
  const headingSize = brandIdentity?.headingSize || 36;
  const bodySize = brandIdentity?.bodySize || 16;
  const headingLineHeight = brandIdentity?.headingLineHeight || 1.2;
  const bodyLineHeight = brandIdentity?.bodyLineHeight || 1.6;

  const typeRatio = useMemo(
    () => calculateTypeScaleRatio(headingSize, bodySize),
    [headingSize, bodySize]
  );

  const headingFamily = getFullFontFamilyString(headingFont);
  const bodyFamily = getFullFontFamilyString(bodyFont);

  // Fallback demo colors if empty
  const colors = paletteColors.length > 0 
    ? paletteColors 
    : [
        { hex: "#0f172a", name: "Deep Slate (Primary)", projectId: 0, createdAt: new Date() },
        { hex: "#6366f1", name: "Indigo Velvet (Secondary)", projectId: 0, createdAt: new Date() },
        { hex: "#ec4899", name: "Electric Rose (Accent)", projectId: 0, createdAt: new Date() },
        { hex: "#f8fafc", name: "Studio Light (Surface)", projectId: 0, createdAt: new Date() },
      ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  const shouldRenderSlide = (index: number) => {
    return activeSlideIndex === "all" || activeSlideIndex === index;
  };

  return (
    <div className="space-y-12 print:space-y-0 text-zinc-900 bg-transparent">
      {/* =========================================================================
          SLIDE 1: COVER SLIDE
          ========================================================================= */}
      {shouldRenderSlide(0) && (
        <section 
          className="brand-deck-slide w-full max-w-[1000px] aspect-[297/210] bg-zinc-950 text-white rounded-2xl p-12 sm:p-14 flex flex-col justify-between shadow-2xl relative overflow-hidden print:overflow-visible mx-auto border border-zinc-800"
          style={{ fontFamily: bodyFamily }}
        >
          {/* Subtle background ambient glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header Folio */}
          <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 pb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">
                DesignFlow · Brand System
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
              Deck Folio 01 / 06
            </span>
          </div>

          {/* Cover Hero Center */}
          <div className="relative z-10 space-y-6 my-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono tracking-wider text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              OFFICIAL BRAND GUIDELINES & IDENTITY SPECIFICATION
            </div>

            {/* Optional injected local project logo */}
            {localAssets.length > 0 && (
              <div className="mb-2">
                <img 
                  src={localAssets[0].dataUrl} 
                  alt="Brand Emblem" 
                  className="h-16 w-auto max-w-xs object-contain rounded-lg border border-zinc-800 bg-zinc-900/50 p-2"
                />
              </div>
            )}

            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.1]"
              style={{ fontFamily: headingFamily, fontWeight: headingWeight }}
            >
              {project?.title || "Brand Identity"}
            </h1>

            <p 
              className="text-base sm:text-lg text-zinc-300 max-w-2xl font-light leading-relaxed"
              style={{ fontFamily: headingFamily }}
            >
              "{brandIdentity?.tagline || project?.description || "Design elevates everyday software experiences."}"
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800 pt-5 text-xs text-zinc-400">
            <div>
              <span className="text-zinc-500">Document:</span> Master Brand Guidelines v1.0
            </div>
            <div className="flex items-center gap-6">
              <span><span className="text-zinc-500">Edition:</span> {currentDate}</span>
              <span><span className="text-zinc-500">Status:</span> Approved Agency Spec</span>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SLIDE 2: BRAND STRATEGY & FOUNDATION
          ========================================================================= */}
      {shouldRenderSlide(1) && (
        <section 
          className="brand-deck-slide w-full max-w-[1000px] aspect-[297/210] bg-white text-zinc-900 rounded-2xl p-12 sm:p-14 flex flex-col justify-between shadow-xl relative overflow-hidden print:overflow-visible mx-auto border border-zinc-200"
          style={{ fontFamily: bodyFamily }}
        >
          {/* Header Folio */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs uppercase tracking-widest font-mono text-zinc-500">
                02 · Strategy & Purpose
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              {project?.title || "Brand System"} · Page 02
            </span>
          </div>

          {/* Main Grid: Mission, Vision, Values */}
          <div className="my-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mission Statement */}
              <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Target className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                    Mission Statement
                  </span>
                </div>
                <p 
                  className="text-base text-zinc-800 leading-relaxed italic"
                  style={{ fontFamily: headingFamily }}
                >
                  "{brandIdentity?.missionStatement || "Empowering product designers and engineering teams to craft delightful, consistent user experiences without friction."}"
                </p>
              </div>

              {/* Vision Statement */}
              <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Eye className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                    Vision Statement
                  </span>
                </div>
                <p 
                  className="text-base text-zinc-800 leading-relaxed italic"
                  style={{ fontFamily: headingFamily }}
                >
                  "{brandIdentity?.visionStatement || "To become the global benchmark for local-first design operations and cohesive brand stewardship."}"
                </p>
              </div>
            </div>

            {/* Core Values Section */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                Guiding Core Values
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(brandIdentity?.coreValues && brandIdentity.coreValues.length > 0 
                  ? brandIdentity.coreValues 
                  : [
                      { id: "1", title: "Radical Simplicity", description: "Clarity over complexity in every design touchpoint and communication." },
                      { id: "2", title: "Craft & Precision", description: "Obsession with typography, spacing, color science, and tactile responsiveness." },
                      { id: "3", title: "Empowered Ownership", description: "Giving teams the autonomy and tools to build with pride and velocity." }
                    ]
                ).map((val, idx) => (
                  <div key={val.id || idx} className="p-4 rounded-lg border border-zinc-200 bg-white shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-semibold text-zinc-900">{val.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Folio */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-5 text-[11px] text-zinc-400 font-mono">
            <span>Brand Strategy Foundation</span>
            <span>Agency Guidelines · Confidential</span>
          </div>
        </section>
      )}

      {/* =========================================================================
          SLIDE 3: BRAND VOICE & EDITORIAL
          ========================================================================= */}
      {shouldRenderSlide(2) && (
        <section 
          className="brand-deck-slide w-full max-w-[1000px] aspect-[297/210] bg-white text-zinc-900 rounded-2xl p-12 sm:p-14 flex flex-col justify-between shadow-xl relative overflow-hidden print:overflow-visible mx-auto border border-zinc-200"
          style={{ fontFamily: bodyFamily }}
        >
          {/* Header Folio */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs uppercase tracking-widest font-mono text-zinc-500">
                03 · Voice & Editorial Tone
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              {project?.title || "Brand System"} · Page 03
            </span>
          </div>

          {/* Voice Body */}
          <div className="my-auto space-y-6">
            {/* Archetype & Tone Attributes */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                  Brand Archetype
                </span>
                <span className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  {brandIdentity?.brandVoice || "The Creator"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(brandIdentity?.toneAttributes && brandIdentity.toneAttributes.length > 0 
                  ? brandIdentity.toneAttributes 
                  : ["Refined", "Direct", "Confident", "Human", "Articulate"]
                ).map((attr) => (
                  <span 
                    key={attr}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-zinc-200 text-zinc-800 shadow-2xs"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            </div>

            {/* Editorial Do's & Don'ts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Do's */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                    Editorial Do's
                  </span>
                </div>
                <div className="space-y-2">
                  {(brandIdentity?.dosAndDonts && brandIdentity.dosAndDonts.length > 0 
                    ? brandIdentity.dosAndDonts 
                    : [
                        { id: "1", doText: "Lead with outcomes and clear human value.", dontText: "Never use vague enterprise jargon or buzzwords." },
                        { id: "2", doText: "Be concise, confident, and direct in tone.", dontText: "Avoid rambling passive voice or apologies." }
                      ]
                  ).map((item, idx) => (
                    <div key={item.id || idx} className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2">
                      <span className="font-mono text-emerald-600 font-bold">✓</span>
                      <span>{item.doText}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Don'ts */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                    Editorial Don'ts
                  </span>
                </div>
                <div className="space-y-2">
                  {(brandIdentity?.dosAndDonts && brandIdentity.dosAndDonts.length > 0 
                    ? brandIdentity.dosAndDonts 
                    : [
                        { id: "1", doText: "Lead with outcomes and clear human value.", dontText: "Never use vague enterprise jargon or buzzwords." },
                        { id: "2", doText: "Be concise, confident, and direct in tone.", dontText: "Avoid rambling passive voice or apologies." }
                      ]
                  ).map((item, idx) => (
                    <div key={item.id || idx} className="p-3 rounded-lg bg-rose-50/60 border border-rose-200/80 text-xs text-rose-950 flex items-start gap-2">
                      <span className="font-mono text-rose-600 font-bold">✕</span>
                      <span>{item.dontText}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {brandIdentity?.targetAudienceNotes && (
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
                <span className="font-semibold text-zinc-800">Target Audience Note: </span>
                {brandIdentity.targetAudienceNotes}
              </div>
            )}
          </div>

          {/* Footer Folio */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-5 text-[11px] text-zinc-400 font-mono">
            <span>Voice & Editorial Principles</span>
            <span>Agency Guidelines · Confidential</span>
          </div>
        </section>
      )}

      {/* =========================================================================
          SLIDE 4: COLOR SYSTEM & ACCESSIBILITY
          ========================================================================= */}
      {shouldRenderSlide(3) && (
        <section 
          className="brand-deck-slide w-full max-w-[1000px] aspect-[297/210] bg-white text-zinc-900 rounded-2xl p-12 sm:p-14 flex flex-col justify-between shadow-xl relative overflow-hidden print:overflow-visible mx-auto border border-zinc-200"
          style={{ fontFamily: bodyFamily }}
        >
          {/* Header Folio */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs uppercase tracking-widest font-mono text-zinc-500">
                04 · Color System & Hierarchy
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              {project?.title || "Brand System"} · Page 04
            </span>
          </div>

          {/* Color Swatches Grid */}
          <div className="my-auto space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {colors.slice(0, 4).map((color, idx) => {
                const contrastOnWhite = getContrastRatio(color.hex, "#ffffff");
                const wcag = checkWCAGCompliance(color.hex, "#ffffff");
                const isCompliant = wcag.AA_normal;

                return (
                  <div 
                    key={color.id || color.hex || idx}
                    className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs flex flex-col"
                  >
                    <div 
                      className="h-28 sm:h-32 w-full p-3 flex flex-col justify-between transition-transform"
                      style={{ backgroundColor: color.hex }}
                    >
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs self-start">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="p-4 bg-white space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-900 truncate">
                          {color.name || `Color Swatch ${idx + 1}`}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 mt-1">
                          <span className="font-bold uppercase">{color.hex}</span>
                          <span className="text-zinc-400">{formatRgbString(color.hex)}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500">vs White: {contrastOnWhite}:1</span>
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${
                          isCompliant ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {isCompliant ? "WCAG AA" : "Accent Only"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Accessibility & Contrast Note */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-zinc-800">Contrast Policy: </span>
                All body text pairs require a minimum 4.5:1 ratio against backgrounds to maintain WCAG 2.1 AA readability standards.
              </div>
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider shrink-0">
                WCAG 2.1 AA Compliant
              </span>
            </div>
          </div>

          {/* Footer Folio */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-5 text-[11px] text-zinc-400 font-mono">
            <span>Color Specification & Swatches</span>
            <span>Agency Guidelines · Confidential</span>
          </div>
        </section>
      )}

      {/* =========================================================================
          SLIDE 5: TYPOGRAPHY SYSTEM & HIERARCHY
          ========================================================================= */}
      {shouldRenderSlide(4) && (
        <section 
          className="brand-deck-slide w-full max-w-[1000px] aspect-[297/210] bg-white text-zinc-900 rounded-2xl p-12 sm:p-14 flex flex-col justify-between shadow-xl relative overflow-hidden print:overflow-visible mx-auto border border-zinc-200"
          style={{ fontFamily: bodyFamily }}
        >
          {/* Header Folio */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs uppercase tracking-widest font-mono text-zinc-500">
                05 · Typography Hierarchy & Scale
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              {project?.title || "Brand System"} · Page 05
            </span>
          </div>

          {/* Specimen & Hierarchy */}
          <div className="my-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Heading Font Specimen */}
              <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                    Primary Heading Font
                  </span>
                  <span className="text-xs font-mono text-indigo-600 font-medium">
                    Weight {headingWeight}
                  </span>
                </div>
                <h3 
                  className="text-2xl sm:text-3xl font-bold text-zinc-900"
                  style={{ fontFamily: headingFamily, fontWeight: headingWeight }}
                >
                  {headingFont}
                </h3>
                <p 
                  className="text-xs text-zinc-600 tracking-wider leading-relaxed"
                  style={{ fontFamily: headingFamily }}
                >
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                  abcdefghijklmnopqrstuvwxyz<br />
                  0123456789 (!?@#$%&*.,;)
                </p>
              </div>

              {/* Body Font Specimen */}
              <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                    Primary Body Font
                  </span>
                  <span className="text-xs font-mono text-indigo-600 font-medium">
                    Weight {bodyWeight}
                  </span>
                </div>
                <h3 
                  className="text-2xl sm:text-3xl font-medium text-zinc-900"
                  style={{ fontFamily: bodyFamily, fontWeight: bodyWeight }}
                >
                  {bodyFont}
                </h3>
                <p 
                  className="text-xs text-zinc-600 tracking-wider leading-relaxed"
                  style={{ fontFamily: bodyFamily }}
                >
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                  abcdefghijklmnopqrstuvwxyz<br />
                  0123456789 (!?@#$%&*.,;)
                </p>
              </div>
            </div>

            {/* Hierarchical Type Scale Table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Font Family</th>
                    <th className="px-4 py-2">Size (px / rem)</th>
                    <th className="px-4 py-2">Line Height</th>
                    <th className="px-4 py-2">Preview Sample</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="px-4 py-2 font-mono font-bold text-indigo-600">Heading 1</td>
                    <td className="px-4 py-2 font-medium">{headingFont}</td>
                    <td className="px-4 py-2 font-mono text-zinc-500">{headingSize}px ({pxToRem(headingSize)})</td>
                    <td className="px-4 py-2 font-mono text-zinc-500">{headingLineHeight}</td>
                    <td className="px-4 py-2 font-bold truncate max-w-xs" style={{ fontFamily: headingFamily }}>
                      Transform Everyday Work
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono font-bold text-indigo-600">Heading 2</td>
                    <td className="px-4 py-2 font-medium">{headingFont}</td>
                    <td className="px-4 py-2 font-mono text-zinc-500">
                      {Math.round(headingSize / typeRatio)}px ({pxToRem(Math.round(headingSize / typeRatio))})
                    </td>
                    <td className="px-4 py-2 font-mono text-zinc-500">1.3</td>
                    <td className="px-4 py-2 font-semibold truncate max-w-xs" style={{ fontFamily: headingFamily }}>
                      Craft Intuitive Interfaces
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono font-bold text-zinc-700">Body Regular</td>
                    <td className="px-4 py-2 font-medium">{bodyFont}</td>
                    <td className="px-4 py-2 font-mono text-zinc-500">{bodySize}px ({pxToRem(bodySize)})</td>
                    <td className="px-4 py-2 font-mono text-zinc-500">{bodyLineHeight}</td>
                    <td className="px-4 py-2 text-zinc-600 truncate max-w-xs" style={{ fontFamily: bodyFamily }}>
                      Consistent typographic hierarchy guides the eye with precision.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Folio */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-5 text-[11px] text-zinc-400 font-mono">
            <span>Typographic Architecture (Scale Ratio: {typeRatio}:1)</span>
            <span>Agency Guidelines · Confidential</span>
          </div>
        </section>
      )}

      {/* =========================================================================
          SLIDE 6: VISUAL DIRECTION & LOCAL ASSETS
          ========================================================================= */}
      {shouldRenderSlide(5) && (
        <section 
          className="brand-deck-slide w-full max-w-[1000px] aspect-[297/210] bg-white text-zinc-900 rounded-2xl p-12 sm:p-14 flex flex-col justify-between shadow-xl relative overflow-hidden print:overflow-visible mx-auto border border-zinc-200"
          style={{ fontFamily: bodyFamily }}
        >
          {/* Header Folio */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs uppercase tracking-widest font-mono text-zinc-500">
                06 · Visual Direction & Imagery Assets
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              {project?.title || "Brand System"} · Page 06
            </span>
          </div>

          {/* Injected Local Assets Gallery */}
          <div className="my-auto space-y-6">
            {localAssets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {localAssets.slice(0, 6).map((asset, idx) => (
                  <div 
                    key={asset.id || idx}
                    className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs group relative bg-zinc-50"
                  >
                    <div className="aspect-4/3 w-full overflow-hidden bg-zinc-100">
                      <img 
                        src={asset.dataUrl} 
                        alt={asset.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2.5 bg-white border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-zinc-800 truncate max-w-[140px]">
                        {asset.name}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 uppercase">
                        Asset #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback aesthetic placeholder when no local assets uploaded yet */
              <div className="p-8 rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  Moodboard & Visual Direction Library
                </h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  Images added to your project assets or moodboard are automatically injected into this brand deck slide as high-fidelity imagery specimens.
                </p>
              </div>
            )}

            {/* Visual Direction Notes */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
              <span className="font-semibold text-zinc-800 block">Photography & Texture Direction:</span>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Aim for authentic lighting, human interaction, structured architectural framing, and minimal synthetic filters to uphold brand credibility.
              </p>
            </div>
          </div>

          {/* Footer Folio */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-5 text-[11px] text-zinc-400 font-mono">
            <span>Visual Imagery & Brand Moodboard</span>
            <span>Agency Guidelines · Confidential</span>
          </div>
        </section>
      )}
    </div>
  );
}
