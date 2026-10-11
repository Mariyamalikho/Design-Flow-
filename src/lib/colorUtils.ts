export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return rgbToHex(r * 255, g * 255, b * 255);
}

export async function extractColorsFromImage(imageUrl: string, maxColors = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(["#000000"]);

      // Downsample for fast processing
      const width = 100;
      const height = Math.round((img.height / img.width) * 100) || 100;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height).data;
      
      const colorCounts: { [key: string]: number } = {};

      for (let i = 0; i < imageData.length; i += 4 * 5) { // sample every 5th pixel
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue; // Skip transparency

        // Quantize colors to reduce noise
        const qR = Math.round(r / 32) * 32;
        const qG = Math.round(g / 32) * 32;
        const qB = Math.round(b / 32) * 32;

        const hex = rgbToHex(Math.min(255, qR), Math.min(255, qG), Math.min(255, qB));
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sortedColors = Object.keys(colorCounts)
        .sort((a, b) => colorCounts[b] - colorCounts[a])
        .slice(0, maxColors);

      resolve(sortedColors.length ? sortedColors : ["#6366f1", "#ec4899", "#3b82f6"]);
    };
    img.onerror = () => resolve(["#6366f1", "#ec4899", "#3b82f6"]);
    img.src = imageUrl;
  });
}

export function generateHarmoniousPalette(baseHex: string) {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return { complementary: "#000000", analogous: [], triadic: [] };

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const complementary = hslToHex((h + 180) % 360, s, l);
  const analogous = [
    hslToHex((h + 30) % 360, s, l),
    hslToHex((h + 330) % 360, s, l),
  ];
  const triadic = [
    hslToHex((h + 120) % 360, s, l),
    hslToHex((h + 240) % 360, s, l),
  ];

  return {
    complementary,
    analogous,
    triadic
  };
}

