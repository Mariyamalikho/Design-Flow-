import * as z from "zod";

export const clientInfoSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  contactName: z.string().optional(),
  companyBackground: z.string().min(10, "Please provide a detailed background (min 10 characters)"),
});

export const targetAudienceSchema = z.object({
  primaryAudience: z.string().min(10, "Please describe the primary audience (min 10 characters)"),
  audiencePainPoints: z.string().optional(),
  competitors: z.string().optional(),
});

// Placeholders for steps 3 and 4
export const brandPersonalitySchema = z.object({
  // To be implemented on Day 31
});

export const deliverablesSchema = z.object({
  // To be implemented on Day 31
});

export const briefWizardSchema = z.object({
  ...clientInfoSchema.shape,
  ...targetAudienceSchema.shape,
  ...brandPersonalitySchema.shape,
  ...deliverablesSchema.shape,
});

export type BriefWizardFormValues = z.infer<typeof briefWizardSchema>;
