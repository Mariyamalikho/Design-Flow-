/**
 * Safe client-side storage utility that gracefully handles:
 * - Empty storage on fresh installations
 * - Restricted/blocked storage in private/incognito browsing modes
 * - Corrupted JSON values
 * - SSR or non-browser environments
 */

export const safeLocalStorage = {
  getItem<T = string>(key: string, defaultValue: T): T {
    if (typeof window === "undefined" || !window.localStorage) {
      return defaultValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined) {
        return defaultValue;
      }
      return item as unknown as T;
    } catch (error) {
      // Storage access blocked or restricted (e.g. sandboxed iframe or private browsing)
      console.warn(`[safeLocalStorage] Unable to read key "${key}":`, error);
      return defaultValue;
    }
  },

  getItemJSON<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined" || !window.localStorage) {
      return defaultValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[safeLocalStorage] Failed to parse JSON for key "${key}":`, error);
      return defaultValue;
    }
  },

  setItem(key: string, value: string): boolean {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`[safeLocalStorage] Unable to set key "${key}":`, error);
      return false;
    }
  },

  setItemJSON<T>(key: string, value: T): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[safeLocalStorage] Failed to serialize JSON for key "${key}":`, error);
      return false;
    }
  },

  removeItem(key: string): boolean {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[safeLocalStorage] Unable to remove key "${key}":`, error);
      return false;
    }
  },

  clear(): boolean {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.warn("[safeLocalStorage] Unable to clear storage:", error);
      return false;
    }
  },
};

/**
 * Determines system preferred color scheme safely.
 */
export function getSystemPreferredTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }
  return "light";
}

export default safeLocalStorage;
