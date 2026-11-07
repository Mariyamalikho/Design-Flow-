import { db, type Project } from "./db";

export async function createDetailedStarterProject(): Promise<number> {
  if (!db?.projects || typeof db.projects.add !== "function") return 0;
  const now = new Date();

  // 1. Create realistic, detailed creative project
  const projectId = await db.projects.add({
    title: "Nordic Architecture & Editorial Identity",
    description:
      "Comprehensive visual direction, architectural typography system, tactile moodboard curation, and earth-toned WCAG 2.1 AA compliant color tokens for a Copenhagen-based sustainable architecture studio.",
    status: "active",
    tags: ["Architecture", "Editorial", "Branding", "Typography", "Art Direction"],
    createdAt: now,
    updatedAt: now,
  });

  // 2. Curate detailed moodboard items (high-res photography & tactile notes)
  await db.moodboardItems.bulkAdd([
    {
      projectId,
      type: "image",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      title: "Monolithic Concrete & Timber Pavilion",
      scale: "large",
      order: 0,
      createdAt: now,
    },
    {
      projectId,
      type: "note",
      content: "Spatial Concept: Balancing monolithic raw structural geometry with warm tactile textures and natural morning daylight.",
      color: "bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800",
      scale: "medium",
      order: 1,
      createdAt: now,
    },
    {
      projectId,
      type: "image",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      title: "Warm Daylight & Tactile Interior Materiality",
      scale: "medium",
      order: 2,
      createdAt: now,
    },
    {
      projectId,
      type: "image",
      url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
      title: "Nordic Oak & Limestone Texture Studies",
      scale: "medium",
      order: 3,
      createdAt: now,
    },
    {
      projectId,
      type: "note",
      content: "Material Palette: Unpolished travertine limestone, blackened structural steel, quarter-sawn white oak, and raw Belgian linen.",
      color: "bg-stone-100 text-stone-900 border-stone-200 dark:bg-stone-900 dark:text-stone-100 dark:border-stone-800",
      scale: "medium",
      order: 4,
      createdAt: now,
    },
    {
      projectId,
      type: "image",
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      title: "Linear Shadow Geometry & Asymmetric Glass",
      scale: "small",
      order: 5,
      createdAt: now,
    },
  ]);

  // 3. Configure rich brand identity
  await db.brandIdentities.add({
    projectId,
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    headingWeight: 600,
    bodyWeight: 400,
    headingSize: 36,
    bodySize: 16,
    headingLineHeight: 1.2,
    bodyLineHeight: 1.6,
    letterSpacing: "normal",
    tagline: "Architecture defined by light, material honesty, and structural quiet.",
    missionStatement:
      "We design sustainable, tactile architectural spaces that foster lasting connection between community, climate, and craft.",
    visionStatement:
      "Setting the international benchmark for low-embodied-carbon environments without compromising aesthetic purity.",
    brandVoice: "Understated yet authoritative; poetic in observation, rigorous in technical clarity.",
    toneAttributes: ["Tactile", "Considered", "Direct", "Structural", "Timeless"],
    dosAndDonts: [
      {
        id: "rule-1",
        doText: "Champion genuine materiality and unadorned architectural volumes.",
        dontText: "Apply superficial decorative veneers or artificial embellishments.",
      },
      {
        id: "rule-2",
        doText: "Prioritize natural passive ventilation, solar orientation, and tactile surfaces.",
        dontText: "Rely solely on synthetic HVAC systems without climate-responsive design.",
      },
    ],
    coreValues: [
      {
        id: "val-1",
        title: "Material Honesty",
        description: "Express structural stone, timber, and steel in their authentic unvarnished states.",
      },
      {
        id: "val-2",
        title: "Carbon Responsibility",
        description: "Target net-zero lifecycle carbon through circular construction and local sourcing.",
      },
      {
        id: "val-3",
        title: "Atmospheric Presence",
        description: "Craft interior volumes calibrated for tranquility, acoustical warmth, and light.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  // 4. Seed tactile color palette
  await db.paletteColors.bulkAdd([
    { projectId, hex: "#18181b", name: "Obsidian Charcoal", createdAt: now },
    { projectId, hex: "#e7e5e4", name: "Warm Limestone", createdAt: now },
    { projectId, hex: "#c2410c", name: "Terracotta Earth", createdAt: now },
    { projectId, hex: "#475569", name: "Weathered Slate", createdAt: now },
    { projectId, hex: "#14532d", name: "Forest Canopy", createdAt: now },
    { projectId, hex: "#fafaf9", name: "Pure Chalk", createdAt: now },
  ]);

  // 5. Seed project deliverables
  await db.tasks.bulkAdd([
    {
      projectId,
      title: "Finalize editorial type scale & line height ratios",
      description: "Lock heading hierarchy for architectural monographs and signage system.",
      status: "done",
      priority: "high",
      createdAt: now,
    },
    {
      projectId,
      title: "Curate tactile material moodboard & texture photography",
      description: "Gather reference imagery for travertine stone, blackened steel, and white oak.",
      status: "in-progress",
      priority: "high",
      createdAt: now,
    },
    {
      projectId,
      title: "Audit color contrast compliance under WCAG 2.1 AA",
      description: "Verify text legibility of obsidian charcoal on limestone surfaces.",
      status: "in-progress",
      priority: "medium",
      createdAt: now,
    },
    {
      projectId,
      title: "Export client-ready PDF brand guidelines presentation deck",
      description: "Generate multi-page handoff presentation with typography pairings and palettes.",
      status: "todo",
      priority: "medium",
      createdAt: now,
    },
  ]);

  return projectId;
}

export async function ensureStarterProject(): Promise<number | null> {
  try {
    if (typeof window === "undefined" || !db?.projects || typeof db.projects.count !== "function") return null;
    const count = await db.projects.count();
    if (count === 0) {
      return await createDetailedStarterProject();
    }
    const firstProject = await db.projects.orderBy("id").first();
    return firstProject?.id ?? null;
  } catch (error) {
    console.warn("Failed to check or seed starter project:", error);
    return null;
  }
}
