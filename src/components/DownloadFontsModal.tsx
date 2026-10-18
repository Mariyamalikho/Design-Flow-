import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Monitor, 
  Code2, 
  Terminal
} from "lucide-react";

interface DownloadFontsModalProps {
  isOpen: boolean;
  onClose: () => void;
  headingFont: string;
  bodyFont: string;
  headingWeight?: number;
  bodyWeight?: number;
}

export function DownloadFontsModal({
  isOpen,
  onClose,
  headingFont = "Playfair Display",
  bodyFont = "Inter",
  headingWeight = 700,
  bodyWeight = 400
}: DownloadFontsModalProps) {
  const [activeTab, setActiveTab] = useState<"desktop" | "web" | "tailwind">("desktop");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getGoogleFontsUrl = (family: string) => {
    return `https://fonts.google.com/specimen/${encodeURIComponent(family.replace(/ /g, "+"))}`;
  };

  const getDirectDownloadUrl = (family: string) => {
    return `https://fonts.google.com/download?family=${encodeURIComponent(family.replace(/ /g, "+"))}`;
  };

  const htmlEmbedSnippet = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont.replace(/ /g, "+"))}:wght@${headingWeight}&family=${encodeURIComponent(bodyFont.replace(/ /g, "+"))}:wght@${bodyWeight}&display=swap" rel="stylesheet">`;

  const cssImportSnippet = `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont.replace(/ /g, "+"))}:wght@${headingWeight}&family=${encodeURIComponent(bodyFont.replace(/ /g, "+"))}:wght@${bodyWeight}&display=swap');

:root {
  --font-heading: '${headingFont}', serif;
  --font-body: '${bodyFont}', sans-serif;
}`;

  const tailwindSnippet = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['"${headingFont}"', 'serif'],
        body: ['"${bodyFont}"', 'sans-serif'],
      },
    },
  },
};`;

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    toast.success("Snippet copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Download & Install Brand Fonts
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Official Google Fonts packages, desktop setup instructions, and frontend embed codes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-2">
          {/* Active Font Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Heading Font */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Heading Font
                </span>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  Weight {headingWeight}
                </Badge>
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {headingFont}
                </h4>
                <p className="text-[11px] text-zinc-500">Official Google Font</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={getDirectDownloadUrl(headingFont)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download ZIP
                </a>
                <a
                  href={getGoogleFontsUrl(headingFont)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Specimen
                </a>
              </div>
            </div>

            {/* Body Font */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Body Font
                </span>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  Weight {bodyWeight}
                </Badge>
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {bodyFont}
                </h4>
                <p className="text-[11px] text-zinc-500">Official Google Font</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={getDirectDownloadUrl(bodyFont)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download ZIP
                </a>
                <a
                  href={getGoogleFontsUrl(bodyFont)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Specimen
                </a>
              </div>
            </div>
          </div>

          {/* Tab Controls: Desktop vs Web Code vs Tailwind */}
          <div className="space-y-3">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("desktop")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "desktop"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop Installation
              </button>
              <button
                onClick={() => setActiveTab("web")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "web"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" /> Web Embed (HTML / CSS)
              </button>
              <button
                onClick={() => setActiveTab("tailwind")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "tailwind"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Tailwind CSS Config
              </button>
            </div>

            {/* Tab 1: Desktop OS Instructions */}
            {activeTab === "desktop" && (
              <div className="space-y-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Download Font Archives</p>
                    <p className="text-zinc-500">Click the "Download ZIP" buttons above to obtain the official TrueType/OpenType files from Google Fonts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Install On Your Operating System</p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-400 pt-1">
                      <li><strong>macOS:</strong> Unzip the archive, double-click the font files, and click <em>"Install Font"</em> in Font Book.</li>
                      <li><strong>Windows:</strong> Unzip, select all <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">.ttf</code> files, right click, and choose <em>"Install for all users"</em>.</li>
                      <li><strong>Linux:</strong> Move fonts to <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">~/.local/share/fonts/</code> and run <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">fc-cache -f -v</code>.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Ready in Design Apps</p>
                    <p className="text-zinc-500">Restart Figma, Photoshop, Illustrator, Sketch, or Keynote. The fonts will now be available in all font pickers.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Web Code */}
            {activeTab === "web" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">HTML &lt;link&gt; Tag</span>
                    <button
                      onClick={() => handleCopy("html", htmlEmbedSnippet)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                    >
                      {copiedKey === "html" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === "html" ? "Copied" : "Copy HTML"}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 text-[11px] font-mono overflow-x-auto border border-zinc-800">
                    <code>{htmlEmbedSnippet}</code>
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">CSS @import & Variables</span>
                    <button
                      onClick={() => handleCopy("css", cssImportSnippet)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                    >
                      {copiedKey === "css" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === "css" ? "Copied" : "Copy CSS"}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 text-[11px] font-mono overflow-x-auto border border-zinc-800">
                    <code>{cssImportSnippet}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 3: Tailwind Config */}
            {activeTab === "tailwind" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">tailwind.config.js</span>
                  <button
                    onClick={() => handleCopy("tailwind", tailwindSnippet)}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                  >
                    {copiedKey === "tailwind" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "tailwind" ? "Copied" : "Copy Config"}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 text-[11px] font-mono overflow-x-auto border border-zinc-800">
                  <code>{tailwindSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
