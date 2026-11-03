import { create } from "zustand";
import { safeLocalStorage, getSystemPreferredTheme } from "@/lib/storageUtils";

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  isGdprModalOpen: boolean;
  setGdprModalOpen: (open: boolean) => void;
}

const getInitialTheme = (): "light" | "dark" => {
  const saved = safeLocalStorage.getItem<string | null>("designflow-theme", null);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return getSystemPreferredTheme();
};

const initialTheme = getInitialTheme();

// Apply initial theme class to HTML element on module load
if (typeof window !== "undefined" && window.document?.documentElement) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(initialTheme);
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  theme: initialTheme,
  setTheme: (theme) => {
    if (typeof window !== "undefined" && window.document?.documentElement) {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
    safeLocalStorage.setItem("designflow-theme", theme);
    set({ theme });
  },
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  isGdprModalOpen: false,
  setGdprModalOpen: (open) => set({ isGdprModalOpen: open }),
}));
