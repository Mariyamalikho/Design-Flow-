import { describe, it, expect } from "vitest";
import {
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hslToHex,
  getLuminance,
  getContrastRatio,
  checkWCAGCompliance,
  generateHarmoniousPalette,
} from "../colorUtils";

describe("Color Math Utilities", () => {
  describe("RGB <-> HEX conversions", () => {
    it("converts RGB to HEX correctly", () => {
      expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
      expect(rgbToHex(0, 0, 0)).toBe("#000000");
      expect(rgbToHex(99, 102, 241)).toBe("#6366f1");
    });

    it("converts HEX to RGB correctly", () => {
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#6366f1")).toEqual({ r: 99, g: 102, b: 241 });
      expect(hexToRgb("invalid")).toBeNull();
    });
  });

  describe("RGB <-> HSL conversions", () => {
    it("converts RGB to HSL correctly", () => {
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
      expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
    });

    it("converts HSL to HEX correctly", () => {
      expect(hslToHex(0, 0, 100)).toBe("#ffffff");
      expect(hslToHex(0, 0, 0)).toBe("#000000");
      expect(hslToHex(0, 100, 50)).toBe("#ff0000");
    });
  });

  describe("WCAG Relative Luminance", () => {
    it("calculates relative luminance for extremes accurately", () => {
      expect(getLuminance("#000000")).toBe(0);
      expect(getLuminance("#ffffff")).toBeCloseTo(1, 4);
    });

    it("returns 0 for invalid hex", () => {
      expect(getLuminance("invalid")).toBe(0);
    });
  });

  describe("WCAG Contrast Ratio Calculation", () => {
    it("calculates maximum contrast ratio (21:1) for black and white", () => {
      const ratio = getContrastRatio("#ffffff", "#000000");
      expect(ratio).toBe(21);
    });

    it("calculates minimum contrast ratio (1:1) for identical colors", () => {
      const ratio = getContrastRatio("#ffffff", "#ffffff");
      expect(ratio).toBe(1);
    });

    it("calculates intermediate contrast correctly", () => {
      // #767676 on #ffffff is standard ~4.54:1 (barely passing AA normal text)
      const ratio = getContrastRatio("#767676", "#ffffff");
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeLessThan(4.6);
    });
  });

  describe("WCAG Compliance Checker", () => {
    it("passes all thresholds for Black text on White background", () => {
      const result = checkWCAGCompliance("#000000", "#ffffff");
      expect(result.ratio).toBe(21);
      expect(result.AA_normal).toBe(true);
      expect(result.AA_large).toBe(true);
      expect(result.AAA_normal).toBe(true);
      expect(result.AAA_large).toBe(true);
    });

    it("fails normal text but passes large text for borderline contrast (~3.5:1)", () => {
      // #888888 on #ffffff has contrast of ~3.54:1
      const result = checkWCAGCompliance("#888888", "#ffffff");
      expect(result.AA_normal).toBe(false);
      expect(result.AA_large).toBe(true);
      expect(result.AAA_normal).toBe(false);
      expect(result.AAA_large).toBe(false);
    });

    it("fails all thresholds for low contrast colors", () => {
      const result = checkWCAGCompliance("#cccccc", "#ffffff");
      expect(result.AA_normal).toBe(false);
      expect(result.AA_large).toBe(false);
      expect(result.AAA_normal).toBe(false);
      expect(result.AAA_large).toBe(false);
    });
  });

  describe("Harmonious Palette Generation", () => {
    it("generates complementary, analogous, and triadic colors", () => {
      const palette = generateHarmoniousPalette("#ff0000"); // Red
      expect(palette.complementary).toBe("#00ffff"); // Cyan
      expect(palette.analogous).toHaveLength(2);
      expect(palette.triadic).toHaveLength(2);
    });
  });
});

