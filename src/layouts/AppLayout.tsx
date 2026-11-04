import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { CommandPaletteModal } from "@/components/CommandPaletteModal";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { GdprExportModal } from "@/components/GdprExportModal";
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from "@/components/OnboardingModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAppStore } from "@/store/useAppStore";
import { safeLocalStorage } from "@/lib/storageUtils";

export function AppLayout() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const { isGdprModalOpen, setGdprModalOpen, isOnboardingModalOpen, setOnboardingModalOpen } =
    useAppStore();

  // Register global Cmd+K / Ctrl+K keyboard shortcut
  useKeyboardShortcuts();

  // Prompt onboarding walkthrough for first-time visitors
  useEffect(() => {
    const hasCompleted = safeLocalStorage.getItem<string | null>(
      ONBOARDING_STORAGE_KEY,
      null
    );
    if (!hasCompleted) {
      setOnboardingModalOpen(true);
    }
  }, [setOnboardingModalOpen]);

  return (
    <div className="h-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl opacity-50 pointer-events-none"></div>
        <TopNav />
        <div className="flex-1 overflow-y-auto z-10 relative">
          <Outlet />
        </div>
      </main>

      {/* Global Command Palette */}
      <CommandPaletteModal
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Quick Action: Create Project Modal */}
      <CreateProjectModal
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
      />

      {/* GDPR Data Portability Export Modal */}
      <GdprExportModal
        open={isGdprModalOpen}
        onOpenChange={setGdprModalOpen}
      />

      {/* Welcome Onboarding Walkthrough Modal */}
      <OnboardingModal
        open={isOnboardingModalOpen}
        onOpenChange={setOnboardingModalOpen}
      />
    </div>
  );
}
