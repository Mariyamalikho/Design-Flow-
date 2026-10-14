import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  POPULAR_GOOGLE_FONTS,
  loadGoogleFont,
  loadGoogleFonts,
  isFontLoaded,
} from "../fontUtils";

vi.mock("webfontloader", () => ({
  default: {
    load: vi.fn(({ active }: { active: () => void }) => {
      if (active) active();
    }),
  },
}));

describe("fontUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POPULAR_GOOGLE_FONTS Catalogue", () => {
    it("contains curated fonts across diverse categories", () => {
      expect(POPULAR_GOOGLE_FONTS.length).toBeGreaterThan(10);
      const categories = new Set(POPULAR_GOOGLE_FONTS.map((f) => f.category));
      expect(categories.has("sans-serif")).toBe(true);
      expect(categories.has("serif")).toBe(true);
      expect(categories.has("display")).toBe(true);
      expect(categories.has("monospace")).toBe(true);
    });

    it("each font has required metadata properties", () => {
      POPULAR_GOOGLE_FONTS.forEach((font) => {
        expect(font.family).toBeDefined();
        expect(font.family.length).toBeGreaterThan(0);
        expect(["sans-serif", "serif", "display", "monospace"]).toContain(font.category);
        expect(Array.isArray(font.weights)).toBe(true);
        expect(font.weights.length).toBeGreaterThan(0);
      });
    });
  });

  describe("loadGoogleFont", () => {
    it("loads font using WebFont.load and registers as loaded", async () => {
      const result = await loadGoogleFont("Inter");
      expect(result).toBe(true);
      expect(isFontLoaded("Inter")).toBe(true);
    });

    it("returns immediate promise if font already loaded", async () => {
      const initial = await loadGoogleFont("Roboto");
      expect(initial).toBe(true);
      const subsequent = await loadGoogleFont("Roboto");
      expect(subsequent).toBe(true);
    });

    it("loads multiple fonts concurrently with loadGoogleFonts", async () => {
      const results = await loadGoogleFonts(["Playfair Display", "JetBrains Mono"]);
      expect(results).toEqual([true, true]);
      expect(isFontLoaded("Playfair Display")).toBe(true);
      expect(isFontLoaded("JetBrains Mono")).toBe(true);
    });
  });
});
