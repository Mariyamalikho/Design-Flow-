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

  it("verifies OpenGraph and Twitter card social preview metadata are configured", () => {
    const htmlPath = path.resolve(__dirname, "../../index.html");
    const html = fs.readFileSync(htmlPath, "utf8");

    // OpenGraph protocol tags
    expect(html).toContain('<meta property="og:type" content="website" />');
    expect(html).toContain('<meta property="og:url" content="https://mariyamalikho.github.io/Design-Flow-/" />');
    expect(html).toContain('<meta property="og:title" content="DesignFlow - The Local-First Creative Direction Studio" />');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('<meta property="og:image" content="https://mariyamalikho.github.io/Design-Flow-/og-image.svg" />');
    expect(html).toContain('<meta property="og:image:width" content="1200" />');
    expect(html).toContain('<meta property="og:image:height" content="630" />');
    expect(html).toContain('<meta property="og:site_name" content="DesignFlow" />');

    // Twitter card tags
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<meta name="twitter:url" content="https://mariyamalikho.github.io/Design-Flow-/" />');
    expect(html).toContain('<meta name="twitter:title" content="DesignFlow - The Local-First Creative Direction Studio" />');
    expect(html).toContain('name="twitter:description"');
    expect(html).toContain('<meta name="twitter:image" content="https://mariyamalikho.github.io/Design-Flow-/og-image.svg" />');
  });

  it("verifies og-image asset exists in public directory and has valid dimensions", () => {
    const ogImagePath = path.resolve(__dirname, "../../public/og-image.svg");
    expect(fs.existsSync(ogImagePath)).toBe(true);

    const svgContent = fs.readFileSync(ogImagePath, "utf8");
    expect(svgContent).toContain('viewBox="0 0 1200 630"');
    expect(svgContent).toContain('width="1200"');
    expect(svgContent).toContain('height="630"');
    expect(svgContent).toContain("DesignFlow");
  });
});
