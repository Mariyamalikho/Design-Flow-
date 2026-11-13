import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Lighthouse SEO & Performance Audit Validation", () => {
  it("verifies index.html has required metadata, favicon links, and preconnects", () => {
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

    // Browser tab icons & favicon
    expect(html).toContain('rel="icon" type="image/svg+xml" href="/favicon.svg"');
    expect(html).toContain('rel="shortcut icon" href="/favicon.svg"');
    expect(html).toContain('rel="apple-touch-icon" href="/favicon.svg"');

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

  it("verifies index.html has canonical, keywords, robots, webmanifest, and JSON-LD schema", () => {
    const htmlPath = path.resolve(__dirname, "../../index.html");
    const html = fs.readFileSync(htmlPath, "utf8");

    expect(html).toContain('rel="canonical" href="https://mariyamalikho.github.io/Design-Flow-/"');
    expect(html).toContain('rel="manifest" href="/site.webmanifest"');
    expect(html).toContain('name="keywords"');
    expect(html).toContain('name="robots"');
    expect(html).toContain('name="author"');

    // JSON-LD Schema markup
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"@type": "WebApplication"');
    expect(html).toContain('"@type": "Organization"');
    expect(html).toContain('"@type": "WebSite"');
    expect(html).toContain('"name": "DesignFlow"');
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

  it("verifies browser tab favicon asset exists and contains DesignFlow branding", () => {
    const faviconPath = path.resolve(__dirname, "../../public/favicon.svg");
    expect(fs.existsSync(faviconPath)).toBe(true);

    const svgContent = fs.readFileSync(faviconPath, "utf8");
    expect(svgContent).toContain('viewBox="0 0 64 64"');
    expect(svgContent).toContain("url(#brandGrad)");
  });

  it("verifies sitemap.xml exists in public directory with core studio routes", () => {
    const sitemapPath = path.resolve(__dirname, "../../public/sitemap.xml");
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
    expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemapContent).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(sitemapContent).toContain("https://mariyamalikho.github.io/Design-Flow-/");
    expect(sitemapContent).toContain("https://mariyamalikho.github.io/Design-Flow-/projects");
    expect(sitemapContent).toContain("https://mariyamalikho.github.io/Design-Flow-/identity");
    expect(sitemapContent).toContain("https://mariyamalikho.github.io/Design-Flow-/moodboards");
    expect(sitemapContent).toContain("https://mariyamalikho.github.io/Design-Flow-/canvas");
    expect(sitemapContent).toContain("https://mariyamalikho.github.io/Design-Flow-/tasks");
    expect(sitemapContent).toContain("https://mariyamalikho.github.io/Design-Flow-/notes");
    expect(sitemapContent).toContain("https://mariyamalikho.github.io/Design-Flow-/briefs");
  });

  it("verifies robots.txt exists and links to sitemap index", () => {
    const robotsPath = path.resolve(__dirname, "../../public/robots.txt");
    expect(fs.existsSync(robotsPath)).toBe(true);

    const robotsContent = fs.readFileSync(robotsPath, "utf8");
    expect(robotsContent).toContain("User-agent: *");
    expect(robotsContent).toContain("Allow: /");
    expect(robotsContent).toContain("Sitemap: https://mariyamalikho.github.io/Design-Flow-/sitemap.xml");
  });

  it("verifies site.webmanifest exists and contains valid PWA properties", () => {
    const manifestPath = path.resolve(__dirname, "../../public/site.webmanifest");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    expect(manifest.name).toContain("DesignFlow");
    expect(manifest.short_name).toBe("DesignFlow");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toBeInstanceOf(Array);
  });
});
