import { hexToRgb } from "./colorUtils";

/**
 * Converts a Blob or File object into a self-contained base64 Data URL.
 * Critical for embedding local Dexie assets reliably into PDF renders without CORS/taint issues.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to data URL"));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error("FileReader error during blob conversion"));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Formats a HEX string into a readable RGB string: "RGB(255, 255, 255)"
 */
export function formatRgbString(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "RGB(0, 0, 0)";
  return `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Generates a clean, sanitized PDF filename for brand guidelines deck.
 */
export function buildDeckFileName(projectTitle?: string): string {
  const sanitized = (projectTitle || "Brand")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-");
  return `${sanitized}-brand-guidelines.pdf`;
}

export interface ExportDeckOptions {
  filename?: string;
  onProgress?: (current: number, total: number) => void;
  scale?: number;
}

/**
 * Renders an agency deck container with multiple .brand-deck-slide elements
 * into a multi-page A4 Landscape PDF using html2canvas and jsPDF.
 */
export async function exportDeckToPdf(
  deckContainer: HTMLElement,
  options: ExportDeckOptions = {}
): Promise<void> {
  const {
    filename = "brand-guidelines.pdf",
    onProgress,
    scale = 2
  } = options;

  // Query individual slide elements or fall back to container itself
  const slideNodes = Array.from(deckContainer.querySelectorAll<HTMLElement>(".brand-deck-slide"));
  const slides = slideNodes.length > 0 ? slideNodes : [deckContainer];
  const total = slides.length;

  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import("jspdf"),
    import("html2canvas")
  ]);
  const html2canvas = html2canvasModule.default || html2canvasModule;

  // A4 Landscape dimensions in millimeters: 297mm x 210mm
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true
  });

  for (let i = 0; i < total; i++) {
    const slide = slides[i];
    if (onProgress) {
      onProgress(i + 1, total);
    }

    const canvas = await html2canvas(slide, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1400,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    if (i > 0) {
      pdf.addPage("a4", "landscape");
    }

    pdf.addImage(imgData, "JPEG", 0, 0, 297, 210, undefined, "FAST");
  }

  pdf.save(filename);
}
