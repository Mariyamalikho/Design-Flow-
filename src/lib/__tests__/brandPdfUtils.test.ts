import { describe, it, expect } from "vitest";
import { 
  formatRgbString, 
  buildDeckFileName, 
  blobToDataUrl 
} from "../brandPdfUtils";

describe("brandPdfUtils", () => {
  describe("formatRgbString", () => {
    it("formats standard 6-digit hex codes to RGB format", () => {
      expect(formatRgbString("#ffffff")).toBe("RGB(255, 255, 255)");
      expect(formatRgbString("#000000")).toBe("RGB(0, 0, 0)");
      expect(formatRgbString("#6366f1")).toBe("RGB(99, 102, 241)");
    });

    it("falls back gracefully for invalid hex values", () => {
      expect(formatRgbString("not-a-color")).toBe("RGB(0, 0, 0)");
      expect(formatRgbString("")).toBe("RGB(0, 0, 0)");
    });
  });

  describe("buildDeckFileName", () => {
    it("creates sanitized pdf filenames from project titles", () => {
      expect(buildDeckFileName("Acme Brand Identity")).toBe("acme-brand-identity-brand-guidelines.pdf");
      expect(buildDeckFileName("DesignFlow 2.0 & Mobile")).toBe("designflow-2-0-mobile-brand-guidelines.pdf");
    });

    it("provides clean fallback for empty or undefined titles", () => {
      expect(buildDeckFileName(undefined)).toBe("brand-brand-guidelines.pdf");
      expect(buildDeckFileName("")).toBe("brand-brand-guidelines.pdf");
    });
  });

  describe("blobToDataUrl", () => {
    it("converts a text/plain blob into a data URL", async () => {
      const blob = new Blob(["hello designflow"], { type: "text/plain" });
      const dataUrl = await blobToDataUrl(blob);
      expect(dataUrl).toContain("data:text/plain;base64,");
    });
  });
});
