import { z } from "zod";

// Platform types
export const platforms = ["youtube", "rumble", "bitchute", "odysee", "tiktok", "instagram"] as const;
export type Platform = typeof platforms[number];

// Content types
export const contentTypes = ["script", "title", "description", "thumbnail", "idea"] as const;
export type ContentType = typeof contentTypes[number];

// Tone options for content generation
export const tones = ["professional", "casual", "energetic", "educational", "humorous", "inspirational"] as const;
export type Tone = typeof tones[number];

// Script length options
export const scriptLengths = ["short", "medium", "long"] as const;
export type ScriptLength = typeof scriptLengths[number];

// Project schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertProjectSchema = projectSchema.pick({
  name: true,
  description: true,
});

export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Content draft schema
export const contentDraftSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum(contentTypes),
  content: z.string(),
  platform: z.enum(platforms).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string(),
});

export const insertDraftSchema = contentDraftSchema.pick({
  projectId: true,
  type: true,
  content: true,
  platform: true,
  metadata: true,
});

export type ContentDraft = z.infer<typeof contentDraftSchema>;
export type InsertContentDraft = z.infer<typeof insertDraftSchema>;

// Generation request schemas
export const generateScriptSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  targetAudience: z.string().optional(),
  tone: z.enum(tones),
  length: z.enum(scriptLengths),
  platforms: z.array(z.enum(platforms)).min(1, "Select at least one platform"),
  keywords: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type GenerateScriptRequest = z.infer<typeof generateScriptSchema>;

export const generateTitleSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  tone: z.enum(tones),
  platforms: z.array(z.enum(platforms)).min(1, "Select at least one platform"),
  keywords: z.string().optional(),
  count: z.number().min(1).max(10).default(5),
});

export type GenerateTitleRequest = z.infer<typeof generateTitleSchema>;

export const generateDescriptionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  topic: z.string().min(1, "Topic is required"),
  tone: z.enum(tones),
  platforms: z.array(z.enum(platforms)).min(1, "Select at least one platform"),
  keywords: z.string().optional(),
  includeHashtags: z.boolean().default(true),
  includeCallToAction: z.boolean().default(true),
});

export type GenerateDescriptionRequest = z.infer<typeof generateDescriptionSchema>;

export const generateThumbnailSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  title: z.string().optional(),
  style: z.string().optional(),
  count: z.number().min(1).max(5).default(3),
});

export type GenerateThumbnailRequest = z.infer<typeof generateThumbnailSchema>;

export const generateIdeasSchema = z.object({
  niche: z.string().min(1, "Niche is required"),
  targetAudience: z.string().optional(),
  count: z.number().min(1).max(20).default(10),
  trending: z.boolean().default(false),
});

export type GenerateIdeasRequest = z.infer<typeof generateIdeasSchema>;

// Generation response types
export interface GeneratedScript {
  script: string;
  estimatedDuration: string;
  sections: string[];
}

export interface GeneratedTitle {
  title: string;
  characterCount: number;
  seoScore: number;
}

export interface GeneratedDescription {
  description: string;
  hashtags: string[];
  characterCount: number;
  platform: Platform;
}

export interface GeneratedThumbnail {
  concept: string;
  textOverlay: string;
  colorScheme: string;
  elements: string[];
}

export interface GeneratedIdea {
  title: string;
  description: string;
  potentialViews: string;
  difficulty: "easy" | "medium" | "hard";
}

// Platform character limits
export const platformLimits: Record<Platform, { title: number; description: number }> = {
  youtube: { title: 100, description: 5000 },
  rumble: { title: 150, description: 2000 },
  bitchute: { title: 100, description: 3000 },
  odysee: { title: 200, description: 5000 },
  tiktok: { title: 150, description: 2200 },
  instagram: { title: 0, description: 2200 },
};
