import { describe, it, expect } from "vitest";
import { getContrastRatio, checkWCAGCompliance } from "../colorUtils";

describe("WCAG 2.1 AA Contrast Compliance Audit", () => {
  describe("Light Mode Theme Palettes", () => {
    const bgLight = "#ffffff";

    it("verifies primary text has AAA contrast on light background", () => {
      const zinc900 = "#18181b";
      const compliance = checkWCAGCompliance(zinc900, bgLight);
      expect(compliance.ratio).toBeGreaterThanOrEqual(7.0);
      expect(compliance.AAA_normal).toBe(true);
    });

    it("verifies secondary text (zinc-600) meets WCAG AA 4.5:1 minimum", () => {
      const zinc600 = "#52525b";
      const compliance = checkWCAGCompliance(zinc600, bgLight);
      expect(compliance.ratio).toBeGreaterThanOrEqual(4.5);
      expect(compliance.AA_normal).toBe(true);
    });

    it("verifies light mode status badge text meets WCAG AA standards", () => {
      // High priority badge text (rose-700)
      const rose700 = "#be123c";
      expect(checkWCAGCompliance(rose700, "#fff1f2").ratio).toBeGreaterThanOrEqual(4.5);

      // Low priority badge text (emerald-700)
      const emerald700 = "#047857";
      expect(checkWCAGCompliance(emerald700, "#ecfdf5").ratio).toBeGreaterThanOrEqual(4.5);

      // Medium priority badge text (amber-800 on amber-50)
      const amber800 = "#92400e";
      expect(checkWCAGCompliance(amber800, "#fffbeb").ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Dark Mode Theme Palettes", () => {
    const bgDark = "#18181b"; // zinc-900 dark background
    const bgDarkest = "#09090b"; // zinc-950

    it("verifies primary text (zinc-50) has AAA contrast on dark backgrounds", () => {
      const zinc50 = "#fafafa";
      expect(checkWCAGCompliance(zinc50, bgDark).ratio).toBeGreaterThanOrEqual(7.0);
      expect(checkWCAGCompliance(zinc50, bgDarkest).ratio).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies secondary text (zinc-400) meets WCAG AA 4.5:1 on dark backgrounds", () => {
      const zinc400 = "#a1a1aa";
      const compliance = checkWCAGCompliance(zinc400, bgDark);
      expect(compliance.ratio).toBeGreaterThanOrEqual(4.5);
      expect(compliance.AA_normal).toBe(true);
    });

    it("verifies dark mode status badge text meets WCAG AA standards", () => {
      // Dark High priority badge text (rose-400 on dark background)
      const rose400 = "#fb7185";
      expect(checkWCAGCompliance(rose400, bgDark).ratio).toBeGreaterThanOrEqual(4.5);

      // Dark Medium priority badge text (amber-400 on dark background)
      const amber400 = "#fbbf24";
      expect(checkWCAGCompliance(amber400, bgDark).ratio).toBeGreaterThanOrEqual(4.5);

      // Dark Low priority badge text (emerald-400 on dark background)
      const emerald400 = "#34d399";
      expect(checkWCAGCompliance(emerald400, bgDark).ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
