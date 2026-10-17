import type { BrandIdentity } from "./db";

export interface DoDontRule {
  id: string;
  doText: string;
  dontText: string;
}

export interface CoreValueItem {
  id: string;
  title: string;
  description: string;
}

export function getDefaultBrandIdentity(projectId: number): Omit<BrandIdentity, "id" | "createdAt" | "updatedAt"> {
  return {
    projectId,
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    headingWeight: 700,
    bodyWeight: 400,
    headingSize: 36,
    bodySize: 16,
    headingLineHeight: 1.2,
    bodyLineHeight: 1.6,
    letterSpacing: "normal",
    brandVoice: "Direct, Empathetic & Thoughtful",
    toneAttributes: ["Direct", "Empathetic", "Visionary"],
    dosAndDonts: [
      {
        id: "rule-1",
        doText: "Write with clear, intentional language and active voice.",
        dontText: "Rely on dense corporate jargon or passive phrasing.",
      },
      {
        id: "rule-2",
        doText: "Focus on human benefits and real user outcomes.",
        dontText: "List dry technical specifications without clear context.",
      },
    ],
    tagline: "Design faster. Collaborate effortlessly.",
    missionStatement: "To empower creative teams with unified design engineering tools that turn raw concepts into production-ready software.",
    visionStatement: "A digital world where beautiful software and accessible user experiences are effortlessly created by teams of all sizes.",
    coreValues: [
      {
        id: "val-1",
        title: "Radical Craftsmanship",
        description: "Obsess over the details and deliver intentional work that exceeds expectations.",
      },
      {
        id: "val-2",
        title: "Human-First Empathy",
        description: "Design technology that adapts gracefully to people, reducing friction and stress.",
      },
    ],
  };
}

export function validateToneAttributes(attributes: string[]): { isValid: boolean; warning?: string } {
  if (!attributes || attributes.length === 0) {
    return { isValid: false, warning: "Selecting at least one tone attribute is recommended." };
  }
  if (attributes.length > 8) {
    return { isValid: true, warning: "Having more than 8 tone attributes can dilute brand clarity." };
  }
  return { isValid: true };
}

export function formatToneAttributesList(attributes: string[]): string {
  if (!attributes || attributes.length === 0) return "Neutral";
  if (attributes.length === 1) return attributes[0];
  if (attributes.length === 2) return `${attributes[0]} & ${attributes[1]}`;
  return `${attributes.slice(0, -1).join(", ")}, & ${attributes[attributes.length - 1]}`;
}

export function countValidDosAndDonts(rules: { doText: string; dontText: string }[]): number {
  return rules.filter((r) => r.doText.trim().length > 0 && r.dontText.trim().length > 0).length;
}
