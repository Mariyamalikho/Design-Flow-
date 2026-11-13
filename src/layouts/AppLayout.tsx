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
import { ensureStarterProject } from "@/lib/seedProject";
import { TopLoadingBar } from "@/components/ui/TopLoadingBar";

export function AppLayout() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const { isGdprModalOpen, setGdprModalOpen, isOnboardingModalOpen, setOnboardingModalOpen } =
    useAppStore();

  // Register global Cmd+K / Ctrl+K keyboard shortcut
  useKeyboardShortcuts();

  // Initialize detailed starter project if database is fresh
  useEffect(() => {
    ensureStarterProject();
  }, []);

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
      {/* Skip to Content for Screen Readers and Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white dark:focus:bg-zinc-100 dark:focus:text-zinc-900 focus:rounded-md focus:shadow-lg focus:text-xs focus:font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Skip to main content
      </a>

      <TopLoadingBar />
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TopNav />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto z-10 relative focus:outline-none"
        >
          <Outlet />
        </main>
      </div>

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
