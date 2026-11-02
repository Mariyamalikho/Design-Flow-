import { describe, it, expect, vi, beforeEach } from "vitest";
import { safeLocalStorage, getSystemPreferredTheme } from "../storageUtils";

describe("safeLocalStorage & System Theme Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns default fallback when key does not exist on fresh load", () => {
    const value = safeLocalStorage.getItem("non-existent-key", "default-fallback");
    expect(value).toBe("default-fallback");

    const jsonValue = safeLocalStorage.getItemJSON("missing-json", { enabled: true });
    expect(jsonValue).toEqual({ enabled: true });
  });

  it("safely stores and retrieves string and JSON items", () => {
    safeLocalStorage.setItem("test-key", "test-val");
    expect(safeLocalStorage.getItem("test-key", "fallback")).toBe("test-val");

    safeLocalStorage.setItemJSON("user-prefs", { theme: "dark", compact: true });
    expect(safeLocalStorage.getItemJSON("user-prefs", {})).toEqual({
      theme: "dark",
      compact: true,
    });
  });

  it("removes items and clears storage safely", () => {
    safeLocalStorage.setItem("item-to-remove", "hello");
    expect(safeLocalStorage.getItem("item-to-remove", "")).toBe("hello");

    safeLocalStorage.removeItem("item-to-remove");
    expect(safeLocalStorage.getItem("item-to-remove", "cleared")).toBe("cleared");

    safeLocalStorage.setItem("key-1", "val-1");
    safeLocalStorage.setItem("key-2", "val-2");
    safeLocalStorage.clear();
    expect(safeLocalStorage.getItem("key-1", "empty")).toBe("empty");
    expect(safeLocalStorage.getItem("key-2", "empty")).toBe("empty");
  });

  it("handles corrupted JSON gracefully without throwing", () => {
    localStorage.setItem("corrupted-key", "{ bad-json :::");
    const result = safeLocalStorage.getItemJSON("corrupted-key", { defaultVal: 123 });
    expect(result).toEqual({ defaultVal: 123 });
  });

  it("gracefully catches errors when localStorage access throws (incognito/restricted)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: Access denied");
    });

    const val = safeLocalStorage.getItem("some-key", "safe-value");
    expect(val).toBe("safe-value");
  });

  it("detects system preferred theme safely", () => {
    const theme = getSystemPreferredTheme();
    expect(["light", "dark"]).toContain(theme);
  });
});
