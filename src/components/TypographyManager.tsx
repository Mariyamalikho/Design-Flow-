import { useState, useEffect, useMemo } from "react";
import { 
  POPULAR_GOOGLE_FONTS, 
  loadGoogleFont, 
  type GoogleFontMeta 
} from "@/lib/fontUtils";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  Type, 
  Search, 
  Sparkles, 
  Check, 
  Loader2 
} from "lucide-react";

interface TypographyManagerProps {
  projectId: number;
}

export function TypographyManager({ projectId: _projectId }: TypographyManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewText, setPreviewText] = useState("Design elevates everyday software experiences.");
  const [loadedFonts, setLoadedFonts] = useState<Record<string, boolean>>({});
  const [loadingFont, setLoadingFont] = useState<string | null>(null);

  // Preload top fonts on mount
  useEffect(() => {
    const starterFonts = ["Inter", "Playfair Display", "Plus Jakarta Sans", "Syne"];
    starterFonts.forEach((font) => {
      loadGoogleFont(font).then(() => {
        setLoadedFonts((prev) => ({ ...prev, [font]: true }));
      });
    });
  }, []);

  const handleLoadFont = async (fontFamily: string) => {
    if (loadedFonts[fontFamily]) return;
    setLoadingFont(fontFamily);
    await loadGoogleFont(fontFamily);
    setLoadedFonts((prev) => ({ ...prev, [fontFamily]: true }));
    setLoadingFont(null);
  };

  const filteredFonts = useMemo(() => {
    return POPULAR_GOOGLE_FONTS.filter((font) => {
      const matchesSearch = font.family.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || font.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Type className="w-5 h-5 text-indigo-500" />
            Brand Typography & Font System
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Browse and test Google Fonts dynamically with WebFontLoader, preview type pairings, and inspect weights.
          </p>
        </div>
      </div>

      {/* Controls: Search, Category Filters, Preview Text Input */}
      <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search Google Fonts (e.g. Inter, Playfair)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs bg-white dark:bg-zinc-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["all", "sans-serif", "serif", "display", "monospace"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {cat.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Text Input */}
        <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
            Preview Text:
          </span>
          <Input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type sample text to preview fonts..."
            className="text-xs bg-white dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Fonts Grid */}
      {filteredFonts.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Type className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-40" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No matching fonts found</p>
          <p className="text-xs text-zinc-500 mt-1">Try searching for a different font family or select 'All'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFonts.map((font: GoogleFontMeta) => {
            const isLoaded = loadedFonts[font.family];
            const isLoading = loadingFont === font.family;

            return (
              <div
                key={font.family}
                onMouseEnter={() => handleLoadFont(font.family)}
                className="group p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {font.family}
                      </h4>
                      <span className="text-[10px] text-zinc-400 capitalize">
                        {font.category} · {font.weights.length} weights
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge 
                        variant="secondary" 
                        className="text-[9px] uppercase tracking-wider font-mono capitalize"
                      >
                        {font.category}
                      </Badge>

                      {isLoaded ? (
                        <span className="text-emerald-600 dark:text-emerald-400 p-1" title="Font Loaded via WebFontLoader">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                      ) : (
                        <button
                          onClick={() => handleLoadFont(font.family)}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          Load
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rendered Live Sample */}
                  <div className="pt-2">
                    <p 
                      className="text-base text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2 transition-all"
                      style={{ 
                        fontFamily: isLoaded ? `"${font.family}", sans-serif` : "inherit"
                      }}
                    >
                      {previewText || "The quick brown fox jumps over the lazy dog."}
                    </p>
                  </div>
                </div>

                {/* Footer with Pairing Hint */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  {font.popularPairing && (
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Pairs with: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{font.popularPairing}</strong>
                    </span>
                  )}
                  <span className="font-mono text-[10px]">
                    {font.weights.join(", ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
