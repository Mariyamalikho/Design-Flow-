import { describe, it, expect } from "vitest";
import {
  getDefaultBrandIdentity,
  validateToneAttributes,
  formatToneAttributesList,
  countValidDosAndDonts,
} from "../brandUtils";

describe("brandUtils", () => {
  describe("getDefaultBrandIdentity", () => {
    it("returns well-formed default brand identity with typography and brand voice", () => {
      const defaults = getDefaultBrandIdentity(101);
      expect(defaults.projectId).toBe(101);
      expect(defaults.headingFont).toBe("Playfair Display");
      expect(defaults.bodyFont).toBe("Inter");
      expect(defaults.headingWeight).toBe(700);
      expect(defaults.bodyWeight).toBe(400);
      expect(defaults.brandVoice).toBeDefined();
      expect(Array.isArray(defaults.toneAttributes)).toBe(true);
      expect(defaults.toneAttributes?.length).toBeGreaterThan(0);
      expect(defaults.dosAndDonts?.length).toBeGreaterThan(0);
      expect(defaults.missionStatement).toBeDefined();
      expect(defaults.visionStatement).toBeDefined();
      expect(defaults.coreValues?.length).toBeGreaterThan(0);
    });
  });

  describe("validateToneAttributes", () => {
    it("returns invalid when array is empty", () => {
      const result = validateToneAttributes([]);
      expect(result.isValid).toBe(false);
      expect(result.warning).toBeDefined();
    });

    it("returns valid when attributes are within normal range", () => {
      const result = validateToneAttributes(["Empathetic", "Direct", "Visionary"]);
      expect(result.isValid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it("returns warning when attributes exceed recommended count", () => {
      const result = validateToneAttributes([
        "A", "B", "C", "D", "E", "F", "G", "H", "I"
      ]);
      expect(result.isValid).toBe(true);
      expect(result.warning).toContain("dilute");
    });
  });

  describe("formatToneAttributesList", () => {
    it("handles empty list", () => {
      expect(formatToneAttributesList([])).toBe("Neutral");
    });

    it("formats single attribute", () => {
      expect(formatToneAttributesList(["Empathetic"])).toBe("Empathetic");
    });

    it("formats two attributes with ampersand", () => {
      expect(formatToneAttributesList(["Direct", "Empathetic"])).toBe("Direct & Empathetic");
    });

    it("formats three or more attributes with Oxford comma and ampersand", () => {
      expect(formatToneAttributesList(["Direct", "Empathetic", "Bold"])).toBe("Direct, Empathetic, & Bold");
    });
  });

  describe("countValidDosAndDonts", () => {
    it("counts only rules with non-empty doText and dontText", () => {
      const rules = [
        { doText: "Be clear", dontText: "Use jargon" },
        { doText: "Be polite", dontText: "" },
        { doText: "", dontText: "Spam users" },
        { doText: "   ", dontText: "   " },
        { doText: "Test code", dontText: "Ship bugs" },
      ];
      expect(countValidDosAndDonts(rules)).toBe(2);
    });
  });
});
