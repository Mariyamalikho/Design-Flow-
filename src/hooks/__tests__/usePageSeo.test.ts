import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePageSeo } from "../usePageSeo";

describe("usePageSeo Hook", () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = "Original Title";
    // Clear custom test tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.remove();
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.remove();
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.remove();
    const jsonLd = document.getElementById("page-dynamic-jsonld");
    if (jsonLd) jsonLd.remove();
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it("updates document title, meta description, and canonical link", () => {
    const { unmount } = renderHook(() =>
      usePageSeo({
        title: "Test Page Title | DesignFlow",
        description: "Test page description for SEO crawlability.",
        canonicalPath: "/test-route",
        keywords: "test, seo, design",
      })
    );

    expect(document.title).toBe("Test Page Title | DesignFlow");

    const desc = document.querySelector('meta[name="description"]');
    expect(desc?.getAttribute("content")).toBe("Test page description for SEO crawlability.");

    const keywords = document.querySelector('meta[name="keywords"]');
    expect(keywords?.getAttribute("content")).toBe("test, seo, design");

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute("href")).toBe(
      "https://mariyamalikho.github.io/Design-Flow-/test-route"
    );

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute("content")).toBe("Test Page Title | DesignFlow");

    unmount();
    expect(document.title).toBe("Original Title");
  });

  it("injects and cleans up dynamic JSON-LD structured schema", () => {
    const testSchema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: "Dynamic Studio",
    };

    const { unmount } = renderHook(() =>
      usePageSeo({
        title: "Schema Test",
        description: "Testing schema injection",
        schema: testSchema,
      })
    );

    const scriptTag = document.getElementById("page-dynamic-jsonld") as HTMLScriptElement | null;
    expect(scriptTag).not.toBeNull();
    expect(scriptTag?.type).toBe("application/ld+json");
    expect(JSON.parse(scriptTag?.textContent || "{}")).toEqual(testSchema);

    unmount();
    expect(document.getElementById("page-dynamic-jsonld")).toBeNull();
  });

  it("does not mutate document when enabled is false", () => {
    renderHook(() =>
      usePageSeo({
        title: "Should Not Apply",
        description: "Should not apply",
        enabled: false,
      })
    );

    expect(document.title).toBe("Original Title");
    expect(document.querySelector('meta[name="description"]')).toBeNull();
  });
});
