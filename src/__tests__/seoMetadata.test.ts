import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Lighthouse SEO & Performance Audit Validation", () => {
  it("verifies index.html has required metadata and preconnects", () => {
    const htmlPath = path.resolve(__dirname, "../../index.html");
    const html = fs.readFileSync(htmlPath, "utf8");

    // Title should be branded and descriptive
    expect(html).toContain("<title>DesignFlow - Creative Workspace &amp; Brand Platform</title>");

    // Meta description for SEO
    expect(html).toContain('name="description"');
    expect(html).toContain("client-first creative workspace");

    // Viewport tag for mobile accessibility
    expect(html).toContain('name="viewport"');
    expect(html).toContain("width=device-width, initial-scale=1.0");

    // Theme color meta tag
    expect(html).toContain('name="theme-color"');

    // Preconnect hints for external fonts
    expect(html).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
    expect(html).toContain('rel="preconnect" href="https://fonts.gstatic.com"');

    // Noscript fallback
    expect(html).toContain("<noscript>");
  });
});
