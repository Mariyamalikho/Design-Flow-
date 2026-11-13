import { useEffect } from "react";

export interface PageSeoOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  ogType?: "website" | "article";
  schema?: Record<string, unknown>;
  enabled?: boolean;
}

const BASE_URL = "https://mariyamalikho.github.io/Design-Flow-";

export function usePageSeo({
  title,
  description,
  canonicalPath = "",
  keywords,
  ogType = "website",
  schema,
  enabled = true,
}: PageSeoOptions) {
  useEffect(() => {
    if (!enabled) return;

    // 1. Update Document Title
    const previousTitle = document.title;
    document.title = title;

    // Helper to get or create a meta tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Helper to get or create a link tag
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // 2. Description and keywords
    setMetaTag("name", "description", description);
    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }

    // 3. Canonical URL
    const cleanPath = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
    const fullCanonicalUrl = canonicalPath === "/" ? `${BASE_URL}/` : `${BASE_URL}${cleanPath}`;
    setLinkTag("canonical", fullCanonicalUrl);

    // 4. OpenGraph tags
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", fullCanonicalUrl);
    setMetaTag("property", "og:type", ogType);

    // 5. Twitter Card tags
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:url", fullCanonicalUrl);

    // 6. Dynamic JSON-LD structured schema
    let scriptTag: HTMLScriptElement | null = null;
    if (schema) {
      scriptTag = document.getElementById("page-dynamic-jsonld") as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "page-dynamic-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema, null, 2);
    }

    return () => {
      if (!enabled) return;
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
      document.title = previousTitle;
    };
  }, [title, description, canonicalPath, keywords, ogType, schema, enabled]);
}
