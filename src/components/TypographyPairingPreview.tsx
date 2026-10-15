import { useState, useEffect } from "react";
import { 
  POPULAR_GOOGLE_FONTS, 
  TYPOGRAPHY_PRESETS,
  loadGoogleFont, 
  pxToRem,
  calculateTypeScaleRatio,
  getRecommendedPairing,
  type TypographyPreset
} from "@/lib/fontUtils";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeftRight, 
  Sparkles, 
  Type, 
  LayoutTemplate, 
  Loader2,
  Sliders,
  Sun,
  Moon,
  RotateCcw
} from "lucide-react";

interface TypographyPairingPreviewProps {
  initialHeadingFont?: string;
  initialBodyFont?: string;
  onSelectPairing?: (headingFont: string, bodyFont: string) => void;
}

export function TypographyPairingPreview({
  initialHeadingFont = "Playfair Display",
  initialBodyFont = "Inter",
  onSelectPairing
}: TypographyPairingPreviewProps) {
  // Font Selections
  const [headingFont, setHeadingFont] = useState(initialHeadingFont);
  const [bodyFont, setBodyFont] = useState(initialBodyFont);
  const [headingWeight, setHeadingWeight] = useState(700);
  const [bodyWeight, setBodyWeight] = useState(400);

  // Size & Layout Sliders
  const [headingSize, setHeadingSize] = useState(36);
  const [bodySize, setBodySize] = useState(16);
  const [headingLineHeight, setHeadingLineHeight] = useState(1.2);
  const [bodyLineHeight, setBodyLineHeight] = useState(1.6);
  const [letterSpacing, setLetterSpacing] = useState("normal"); // tight, normal, wide

  // Preview States
  const [previewMode, setPreviewMode] = useState<"card" | "hero" | "specimen">("hero");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark" | "cream">("light");
  const [loadingFonts, setLoadingFonts] = useState<Record<string, boolean>>({});

  // Sample Text
  const [headlineText, setHeadlineText] = useState("Crafting timeless digital brand identities.");
  const [bodyText, setBodyText] = useState(
    "Design systems bridge the space between aesthetic vision and engineering execution. Deliberate typography establishes hierarchy, optimizes readability across viewports, and shapes the emotional resonance of every screen."
  );

  // Dynamic Font Loading
  useEffect(() => {
    const loadFont = async (font: string) => {
      setLoadingFonts((prev) => ({ ...prev, [font]: true }));
      await loadGoogleFont(font);
      setLoadingFonts((prev) => ({ ...prev, [font]: false }));
    };

    loadFont(headingFont);
    loadFont(bodyFont);
  }, [headingFont, bodyFont]);

  // Current Font Metadata
  const currentHeadingMeta = POPULAR_GOOGLE_FONTS.find((f) => f.family === headingFont);
  const currentBodyMeta = POPULAR_GOOGLE_FONTS.find((f) => f.family === bodyFont);
  const recommendedForHeading = getRecommendedPairing(headingFont);

  // Swap Fonts
  const handleSwap = () => {
    const tempFont = headingFont;
    const tempWeight = headingWeight;
    setHeadingFont(bodyFont);
    setHeadingWeight(bodyWeight);
    setBodyFont(tempFont);
    setBodyWeight(tempWeight);
  };

  // Apply Preset
  const handleApplyPreset = (preset: TypographyPreset) => {
    setHeadingFont(preset.headingFont);
    setBodyFont(preset.bodyFont);
    setHeadingWeight(preset.headingWeight);
    setBodyWeight(preset.bodyWeight);
    if (onSelectPairing) {
      onSelectPairing(preset.headingFont, preset.bodyFont);
    }
  };

  // Apply Recommended Pairing
  const handleApplyRecommended = () => {
    if (recommendedForHeading) {
      setBodyFont(recommendedForHeading.family);
      setBodyWeight(recommendedForHeading.weights[0] || 400);
    }
  };

  // Reset Sliders
  const handleResetSliders = () => {
    setHeadingSize(36);
    setBodySize(16);
    setHeadingLineHeight(1.2);
    setBodyLineHeight(1.6);
    setLetterSpacing("normal");
  };

  const typeRatio = calculateTypeScaleRatio(headingSize, bodySize);

  const getTrackingClass = () => {
    if (letterSpacing === "tight") return "-tracking-wider";
    if (letterSpacing === "wide") return "tracking-widest";
    return "tracking-normal";
  };

  return (
    <div className="space-y-6">
      {/* Top Presets Bar */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Curated Type Pairings
          </span>
          <span className="text-[11px] text-zinc-400">Click to preview preset combinations</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TYPOGRAPHY_PRESETS.map((preset) => {
            const isActive = headingFont === preset.headingFont && bodyFont === preset.bodyFont;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all border flex items-center gap-1.5 ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] opacity-70 font-mono">
                  ({preset.headingFont.split(" ")[0]} + {preset.bodyFont.split(" ")[0]})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Grid: Dropdowns & Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Left: Dropdown Selectors */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-500" />
              Font Selection
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwap}
              className="h-7 text-xs gap-1.5"
              title="Swap Heading and Body fonts"
            >
              <ArrowLeftRight className="w-3 h-3" /> Swap
            </Button>
          </div>

          {/* Heading Font Dropdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Heading Font Family
              </label>
              {loadingFonts[headingFont] && (
                <span className="text-[10px] text-indigo-500 flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Loading...
                </span>
              )}
            </div>
            <select
              value={headingFont}
              onChange={(e) => {
                const newFont = e.target.value;
                setHeadingFont(newFont);
                const meta = POPULAR_GOOGLE_FONTS.find((f) => f.family === newFont);
                if (meta && !meta.weights.includes(headingWeight)) {
                  setHeadingWeight(meta.weights[meta.weights.length - 1] || 700);
                }
              }}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {POPULAR_GOOGLE_FONTS.map((font) => (
                <option key={`heading-${font.family}`} value={font.family}>
                  {font.family} ({font.category})
                </option>
              ))}
            </select>

            {/* Heading Weight Selector */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-zinc-400 shrink-0">Weight:</span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {currentHeadingMeta?.weights.map((w) => (
                  <button
                    key={`hw-${w}`}
                    onClick={() => setHeadingWeight(w)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      headingWeight === w
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Body Font Dropdown */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Body Font Family
              </label>
              {loadingFonts[bodyFont] && (
                <span className="text-[10px] text-indigo-500 flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Loading...
                </span>
              )}
            </div>
            <select
              value={bodyFont}
              onChange={(e) => {
                const newFont = e.target.value;
                setBodyFont(newFont);
                const meta = POPULAR_GOOGLE_FONTS.find((f) => f.family === newFont);
                if (meta && !meta.weights.includes(bodyWeight)) {
                  setBodyWeight(meta.weights[0] || 400);
                }
              }}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {POPULAR_GOOGLE_FONTS.map((font) => (
                <option key={`body-${font.family}`} value={font.family}>
                  {font.family} ({font.category})
                </option>
              ))}
            </select>

            {/* Body Weight Selector */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-zinc-400 shrink-0">Weight:</span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {currentBodyMeta?.weights.map((w) => (
                  <button
                    key={`bw-${w}`}
                    onClick={() => setBodyWeight(w)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      bodyWeight === w
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Pairing Action */}
          {recommendedForHeading && recommendedForHeading.family !== bodyFont && (
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-indigo-900 dark:text-indigo-300 block">
                  Recommended Pairing
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                  {recommendedForHeading.family} ({recommendedForHeading.category})
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleApplyRecommended}
                className="h-7 text-[11px] bg-white dark:bg-zinc-900 border-indigo-200 hover:border-indigo-300"
              >
                Apply
              </Button>
            </div>
          )}
        </div>

        {/* Right: Size & Layout Sliders */}
        <div className="lg:col-span-7 space-y-4 lg:border-l lg:border-zinc-100 lg:dark:border-zinc-800 lg:pl-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Scale & Metrics Sliders
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] text-zinc-500">
                Scale: {typeRatio}x
              </Badge>
              <button
                onClick={handleResetSliders}
                className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1"
                title="Reset sliders"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Slider
              label="Heading Font Size"
              value={headingSize}
              onChange={setHeadingSize}
              min={18}
              max={64}
              step={1}
              valueDisplay={`${headingSize}px (${pxToRem(headingSize)})`}
            />

            <Slider
              label="Body Font Size"
              value={bodySize}
              onChange={setBodySize}
              min={12}
              max={24}
              step={1}
              valueDisplay={`${bodySize}px (${pxToRem(bodySize)})`}
            />

            <Slider
              label="Heading Line Height"
              value={headingLineHeight}
              onChange={setHeadingLineHeight}
              min={1.0}
              max={1.8}
              step={0.05}
              valueDisplay={`${headingLineHeight.toFixed(2)}`}
            />

            <Slider
              label="Body Line Height"
              value={bodyLineHeight}
              onChange={setBodyLineHeight}
              min={1.2}
              max={2.2}
              step={0.05}
              valueDisplay={`${bodyLineHeight.toFixed(2)}`}
            />
          </div>

          {/* Letter Spacing & View Mode Controls */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[11px]">Letter Spacing:</span>
              {(["tight", "normal", "wide"] as const).map((space) => (
                <button
                  key={space}
                  onClick={() => setLetterSpacing(space)}
                  className={`px-2 py-1 rounded text-[11px] capitalize transition-colors ${
                    letterSpacing === space
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {space}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-[11px] mr-1">Theme:</span>
              <button
                onClick={() => setPreviewTheme("light")}
                className={`p-1.5 rounded ${previewTheme === "light" ? "bg-zinc-200 dark:bg-zinc-700" : "text-zinc-400"}`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewTheme("dark")}
                className={`p-1.5 rounded ${previewTheme === "dark" ? "bg-zinc-200 dark:bg-zinc-700" : "text-zinc-400"}`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewTheme("cream")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  previewTheme === "cream" ? "bg-amber-100 text-amber-900" : "text-zinc-400"
                }`}
                title="Warm Cream"
              >
                Cream
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Pairing Preview Canvas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-indigo-500" />
              Live Typography Pairing Canvas
            </h4>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {headingFont} + {bodyFont}
            </Badge>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            {(["hero", "card", "specimen"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  previewMode === mode
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Display */}
        <div
          className={`rounded-2xl p-8 transition-colors border shadow-xs min-h-[380px] flex flex-col justify-center ${
            previewTheme === "dark"
              ? "bg-zinc-950 text-zinc-50 border-zinc-800"
              : previewTheme === "cream"
              ? "bg-[#faf7f2] text-zinc-900 border-[#ece5da]"
              : "bg-white text-zinc-900 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:border-zinc-800"
          }`}
        >
          {previewMode === "hero" && (
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                style={{ fontFamily: `"${bodyFont}", sans-serif` }}
              >
                <Sparkles className="w-3 h-3" /> Digital Brand Platform
              </span>

              <h1
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setHeadlineText(e.currentTarget.textContent || "")}
                className={`${getTrackingClass()} transition-all outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1`}
                style={{
                  fontFamily: `"${headingFont}", sans-serif`,
                  fontWeight: headingWeight,
                  fontSize: `${headingSize}px`,
                  lineHeight: headingLineHeight,
                }}
              >
                {headlineText}
              </h1>

              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setBodyText(e.currentTarget.textContent || "")}
                className="opacity-80 max-w-2xl mx-auto transition-all outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1"
                style={{
                  fontFamily: `"${bodyFont}", sans-serif`,
                  fontWeight: bodyWeight,
                  fontSize: `${bodySize}px`,
                  lineHeight: bodyLineHeight,
                }}
              >
                {bodyText}
              </p>

              <div 
                className="pt-2 flex items-center justify-center gap-3"
                style={{ fontFamily: `"${bodyFont}", sans-serif` }}
              >
                <button className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-xs">
                  Get Started Free
                </button>
                <button className="px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors">
                  Documentation &rarr;
                </button>
              </div>
            </div>
          )}

          {previewMode === "card" && (
            <div className="max-w-xl mx-auto w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>
                  Case Study
                </Badge>
                <span className="text-xs opacity-50 font-mono">5 min read</span>
              </div>

              <h2
                contentEditable
                suppressContentEditableWarning
                className={`${getTrackingClass()} outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1`}
                style={{
                  fontFamily: `"${headingFont}", sans-serif`,
                  fontWeight: headingWeight,
                  fontSize: `${Math.round(headingSize * 0.75)}px`,
                  lineHeight: headingLineHeight,
                }}
              >
                {headlineText}
              </h2>

              <p
                contentEditable
                suppressContentEditableWarning
                className="opacity-80 outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1"
                style={{
                  fontFamily: `"${bodyFont}", sans-serif`,
                  fontWeight: bodyWeight,
                  fontSize: `${bodySize}px`,
                  lineHeight: bodyLineHeight,
                }}
              >
                {bodyText}
              </p>

              <div 
                className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs opacity-75"
                style={{ fontFamily: `"${bodyFont}", sans-serif` }}
              >
                <span>DesignFlow Engineering</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer">
                  Read article &rarr;
                </span>
              </div>
            </div>
          )}

          {previewMode === "specimen" && (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  Display Heading ({headingFont} {headingWeight})
                </span>
                <h1
                  style={{
                    fontFamily: `"${headingFont}", sans-serif`,
                    fontWeight: headingWeight,
                    fontSize: `${headingSize}px`,
                    lineHeight: headingLineHeight,
                  }}
                  className={getTrackingClass()}
                >
                  {headlineText}
                </h1>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  Subheading ({headingFont} {Math.max(400, headingWeight - 100)})
                </span>
                <h2
                  style={{
                    fontFamily: `"${headingFont}", sans-serif`,
                    fontWeight: Math.max(400, headingWeight - 100),
                    fontSize: `${Math.round(headingSize * 0.65)}px`,
                    lineHeight: 1.3,
                  }}
                  className={getTrackingClass()}
                >
                  Systematic typographic hierarchy in user experiences
                </h2>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  Body Copy ({bodyFont} {bodyWeight})
                </span>
                <p
                  style={{
                    fontFamily: `"${bodyFont}", sans-serif`,
                    fontWeight: bodyWeight,
                    fontSize: `${bodySize}px`,
                    lineHeight: bodyLineHeight,
                  }}
                  className="opacity-80"
                >
                  {bodyText}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  Caption & Small ({bodyFont} 500)
                </span>
                <p
                  style={{
                    fontFamily: `"${bodyFont}", sans-serif`,
                    fontWeight: 500,
                    fontSize: `${Math.max(11, bodySize - 4)}px`,
                  }}
                  className="opacity-60"
                >
                  Figure 1.0 — Proportional type scaling ensures legibility across mobile and desktop interfaces.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
