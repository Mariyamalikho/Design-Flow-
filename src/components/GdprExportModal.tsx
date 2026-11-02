import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  FileArchive,
  FileCode,
  Loader2,
  FolderKanban,
  CheckCircle2,
  StickyNote,
  Sparkles,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import {
  gatherAllUserData,
  exportAllUserDataAsZip,
  exportAllUserDataAsJson,
  type UserDataDump,
} from "@/lib/privacyUtils";

export interface GdprExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GdprExportModal: React.FC<GdprExportModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [summary, setSummary] = useState<UserDataDump["summary"] | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoadingSummary(true);
      gatherAllUserData()
        .then(({ dump }) => {
          setSummary(dump.summary);
        })
        .catch(() => {
          toast.error("Failed to calculate workspace data summary");
        })
        .finally(() => {
          setIsLoadingSummary(false);
        });
    }
  }, [open]);

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      await exportAllUserDataAsZip();
      toast.success("Complete GDPR workspace archive exported (.zip)");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate ZIP export");
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleExportJson = async () => {
    setIsExportingJson(true);
    try {
      await exportAllUserDataAsJson();
      toast.success("Workspace data exported (.json)");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate JSON export");
    } finally {
      setIsExportingJson(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Privacy &amp; Data Portability</DialogTitle>
              <DialogDescription className="text-xs">
                Export all your DesignFlow data in accordance with GDPR Article 20.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Privacy Note Box */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              <span>100% Client-Side Local Storage</span>
            </div>
            <p className="leading-relaxed">
              DesignFlow does not store your projects, briefs, or assets on external servers. All information lives directly inside your device&apos;s browser IndexedDB database.
            </p>
          </div>

          {/* Data Summary Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Current Workspace Inventory
            </h4>

            {isLoadingSummary ? (
              <div className="flex items-center justify-center py-6 text-xs text-zinc-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Calculating stored workspace entities...
              </div>
            ) : summary ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <FolderKanban className="w-4 h-4 mx-auto text-indigo-500 mb-1" />
                  <div className="text-base font-bold">{summary.totalProjects}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Projects</div>
                </div>

                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                  <div className="text-base font-bold">{summary.totalTasks}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Tasks</div>
                </div>

                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <StickyNote className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                  <div className="text-base font-bold">{summary.totalNotes}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Notes</div>
                </div>

                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <Sparkles className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                  <div className="text-base font-bold">{summary.totalCanvasNodes}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Ideas</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportJson}
            disabled={isExportingJson || isExportingZip}
            className="w-full sm:w-auto text-xs gap-1.5"
            aria-label="Export Data JSON"
          >
            {isExportingJson ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span>Export JSON Only</span>
          </Button>

          <Button
            type="button"
            onClick={handleExportZip}
            disabled={isExportingZip || isExportingJson}
            className="w-full sm:w-auto text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            aria-label="Export Complete Archive with Media"
          >
            {isExportingZip ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compressing Workspace...</span>
              </>
            ) : (
              <>
                <FileArchive className="w-3.5 h-3.5" />
                <span>Export Complete ZIP Archive</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GdprExportModal;
