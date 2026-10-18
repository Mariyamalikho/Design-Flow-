/**
 * Centralized Client-Side Export Utilities for DesignFlow
 * Handles file downloads, DOM element to image conversions, and document generation.
 */

export interface ExportImageOptions {
  filename?: string;
  format?: "png" | "jpeg";
  quality?: number;
  scale?: number;
  backgroundColor?: string | null;
  useCORS?: boolean;
}

/**
 * Triggers a native browser file download for a Blob object and revokes the URL.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a native browser download for a base64 Data URL.
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Captures an HTML DOM element and converts it to a high-DPI image Data URL.
 */
export async function exportElementToImage(
  element: HTMLElement,
  options: ExportImageOptions = {}
): Promise<string> {
  const {
    format = "png",
    quality = 0.95,
    scale = 2,
    backgroundColor = null,
    useCORS = true
  } = options;

  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default || html2canvasModule;

  const canvas = await html2canvas(element, {
    scale,
    useCORS,
    allowTaint: false,
    backgroundColor,
    logging: false
  });

  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Captures an HTML element and immediately triggers a downloadable image file.
 */
export async function exportElementToFile(
  element: HTMLElement,
  filename: string,
  options: ExportImageOptions = {}
): Promise<void> {
  const dataUrl = await exportElementToImage(element, options);
  downloadDataUrl(dataUrl, filename);
}

// Re-export PDF utilities for centralized access
export {
  exportDeckToPdf,
  blobToDataUrl,
  buildDeckFileName,
  formatRgbString
} from "./brandPdfUtils";
