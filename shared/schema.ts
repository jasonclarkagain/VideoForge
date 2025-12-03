import { z } from "zod";
import { pgTable, text, timestamp, integer, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

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

// Scheduled content status
export const scheduleStatuses = ["planned", "in_progress", "published", "cancelled"] as const;
export type ScheduleStatus = typeof scheduleStatuses[number];

// ============= DRIZZLE TABLES =============

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  drafts: many(contentDrafts),
  scheduledContent: many(scheduledContent),
}));

// Content drafts table
export const contentDrafts = pgTable("content_drafts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  content: text("content").notNull(),
  platform: text("platform"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentDraftsRelations = relations(contentDrafts, ({ one }) => ({
  project: one(projects, {
    fields: [contentDrafts.projectId],
    references: [projects.id],
  }),
}));

// Scheduled content table (for content calendar)
export const scheduledContent = pgTable("scheduled_content", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull().default("planned"),
  draftId: integer("draft_id").references(() => contentDrafts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scheduledContentRelations = relations(scheduledContent, ({ one }) => ({
  project: one(projects, {
    fields: [scheduledContent.projectId],
    references: [projects.id],
  }),
  draft: one(contentDrafts, {
    fields: [scheduledContent.draftId],
    references: [contentDrafts.id],
  }),
  performance: one(contentPerformance, {
    fields: [scheduledContent.id],
    references: [contentPerformance.scheduledContentId],
  }),
}));

// Content performance table (for analytics)
export const contentPerformance = pgTable("content_performance", {
  id: serial("id").primaryKey(),
  scheduledContentId: integer("scheduled_content_id").notNull().references(() => scheduledContent.id, { onDelete: "cascade" }),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  clickThroughRate: text("click_through_rate"),
  avgWatchTime: text("avg_watch_time"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentPerformanceRelations = relations(contentPerformance, ({ one }) => ({
  scheduledContent: one(scheduledContent, {
    fields: [contentPerformance.scheduledContentId],
    references: [scheduledContent.id],
  }),
}));

// ============= ZOD SCHEMAS & TYPES =============

// Project schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Content draft schemas
export const insertDraftSchema = createInsertSchema(contentDrafts).omit({
  id: true,
  createdAt: true,
});

export type ContentDraft = typeof contentDrafts.$inferSelect;
export type InsertContentDraft = z.infer<typeof insertDraftSchema>;

// Scheduled content schemas
export const insertScheduledContentSchema = createInsertSchema(scheduledContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ScheduledContent = typeof scheduledContent.$inferSelect;
export type InsertScheduledContent = z.infer<typeof insertScheduledContentSchema>;

// Content performance schemas
export const insertPerformanceSchema = createInsertSchema(contentPerformance).omit({
  id: true,
  createdAt: true,
});

export type ContentPerformance = typeof contentPerformance.$inferSelect;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;

// ============= GENERATION REQUEST SCHEMAS =============

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

// Batch generation schema
export const generateBatchSchema = z.object({
  topics: z.array(z.string().min(1)).min(1, "At least one topic is required").max(10, "Maximum 10 topics"),
  tone: z.enum(tones),
  platforms: z.array(z.enum(platforms)).min(1, "Select at least one platform"),
  generateTitles: z.boolean().default(true),
  generateDescriptions: z.boolean().default(true),
  generateThumbnails: z.boolean().default(false),
});

export type GenerateBatchRequest = z.infer<typeof generateBatchSchema>;

// A/B test generation schema
export const generateABTestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  tone: z.enum(tones),
  platforms: z.array(z.enum(platforms)).min(1, "Select at least one platform"),
  testType: z.enum(["titles", "thumbnails"]),
  variantCount: z.number().min(2).max(5).default(3),
});

export type GenerateABTestRequest = z.infer<typeof generateABTestSchema>;

// ============= GENERATION RESPONSE TYPES =============

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

export interface BatchGenerationResult {
  topic: string;
  titles?: GeneratedTitle[];
  descriptions?: GeneratedDescription[];
  thumbnails?: GeneratedThumbnail[];
}

export interface ABTestVariant {
  variant: string;
  content: GeneratedTitle | GeneratedThumbnail;
  hypothesis: string;
  targetAudience: string;
}

export interface ABTestResult {
  testType: "titles" | "thumbnails";
  variants: ABTestVariant[];
  recommendation: string;
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
