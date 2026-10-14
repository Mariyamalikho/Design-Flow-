import WebFont from "webfontloader";

export interface GoogleFontMeta {
  family: string;
  category: "sans-serif" | "serif" | "display" | "monospace";
  weights: number[];
  popularPairing?: string;
}

export const POPULAR_GOOGLE_FONTS: GoogleFontMeta[] = [
  // Sans-Serif
  { family: "Inter", category: "sans-serif", weights: [400, 500, 600, 700], popularPairing: "Playfair Display" },
  { family: "Plus Jakarta Sans", category: "sans-serif", weights: [400, 500, 600, 700], popularPairing: "Lora" },
  { family: "Outfit", category: "sans-serif", weights: [400, 500, 600, 700], popularPairing: "Merriweather" },
  { family: "Montserrat", category: "sans-serif", weights: [400, 500, 600, 700], popularPairing: "EB Garamond" },
  { family: "Poppins", category: "sans-serif", weights: [400, 500, 600, 700], popularPairing: "Cinzel" },
  { family: "Space Grotesk", category: "sans-serif", weights: [400, 500, 600, 700], popularPairing: "Space Mono" },
  { family: "DM Sans", category: "sans-serif", weights: [400, 500, 700], popularPairing: "Prata" },
  { family: "Roboto", category: "sans-serif", weights: [400, 500, 700], popularPairing: "Roboto Serif" },

  // Serif
  { family: "Playfair Display", category: "serif", weights: [400, 600, 700], popularPairing: "Inter" },
  { family: "Lora", category: "serif", weights: [400, 500, 600], popularPairing: "Plus Jakarta Sans" },
  { family: "Merriweather", category: "serif", weights: [400, 700], popularPairing: "Outfit" },
  { family: "Cormorant Garamond", category: "serif", weights: [400, 600, 700], popularPairing: "Montserrat" },
  { family: "Cinzel", category: "serif", weights: [400, 600, 700], popularPairing: "Poppins" },
  { family: "Prata", category: "serif", weights: [400], popularPairing: "DM Sans" },

  // Display
  { family: "Syne", category: "display", weights: [500, 700, 800], popularPairing: "Inter" },
  { family: "Bebas Neue", category: "display", weights: [400], popularPairing: "Roboto" },
  { family: "Righteous", category: "display", weights: [400], popularPairing: "Montserrat" },
  { family: "Unbounded", category: "display", weights: [400, 600, 800], popularPairing: "Space Grotesk" },

  // Monospace
  { family: "JetBrains Mono", category: "monospace", weights: [400, 500, 700], popularPairing: "Inter" },
  { family: "Space Mono", category: "monospace", weights: [400, 700], popularPairing: "Space Grotesk" },
  { family: "Fira Code", category: "monospace", weights: [400, 500, 600], popularPairing: "Plus Jakarta Sans" },
];

const loadedFontsSet = new Set<string>();

/**
 * Dynamically injects and loads Google Fonts using WebFontLoader with fallback
 */
export function loadGoogleFont(fontFamily: string, weights = [400, 600, 700]): Promise<boolean> {
  if (loadedFontsSet.has(fontFamily)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    try {
      const weightSpec = weights.length ? `:${weights.join(",")}` : "";
      WebFont.load({
        google: {
          families: [`${fontFamily}${weightSpec}`],
        },
        active: () => {
          loadedFontsSet.add(fontFamily);
          resolve(true);
        },
        inactive: () => {
          // Fallback via dynamic link tag
          injectGoogleFontLink(fontFamily, weights);
          loadedFontsSet.add(fontFamily);
          resolve(true);
        },
        timeout: 3000,
      });
    } catch {
      injectGoogleFontLink(fontFamily, weights);
      loadedFontsSet.add(fontFamily);
      resolve(true);
    }
  });
}

function injectGoogleFontLink(fontFamily: string, weights: number[]) {
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weights.join(";")}&display=swap`;
  const existingLink = document.querySelector(`link[href*="${encodeURIComponent(fontFamily)}"]`);
  if (!existingLink) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
  }
}

export function loadGoogleFonts(fontFamilies: string[]): Promise<boolean[]> {
  return Promise.all(fontFamilies.map((font) => loadGoogleFont(font)));
}

export function isFontLoaded(fontFamily: string): boolean {
  return loadedFontsSet.has(fontFamily);
}
