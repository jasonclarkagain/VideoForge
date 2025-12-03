import { 
  projects, 
  contentDrafts, 
  scheduledContent,
  contentPerformance,
  type Project, 
  type InsertProject, 
  type ContentDraft, 
  type InsertContentDraft,
  type ScheduledContent,
  type InsertScheduledContent,
  type ContentPerformance,
  type InsertPerformance,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Draft operations
  getDrafts(projectId: number): Promise<ContentDraft[]>;
  getDraft(id: number): Promise<ContentDraft | undefined>;
  createDraft(draft: InsertContentDraft): Promise<ContentDraft>;
  deleteDraft(id: number): Promise<boolean>;

  // Scheduled content operations (calendar)
  getScheduledContent(projectId?: number): Promise<ScheduledContent[]>;
  getScheduledContentById(id: number): Promise<ScheduledContent | undefined>;
  createScheduledContent(content: InsertScheduledContent): Promise<ScheduledContent>;
  updateScheduledContent(id: number, updates: Partial<InsertScheduledContent>): Promise<ScheduledContent | undefined>;
  deleteScheduledContent(id: number): Promise<boolean>;

  // Performance operations (analytics)
  getPerformance(scheduledContentId: number): Promise<ContentPerformance[]>;
  createPerformance(perf: InsertPerformance): Promise<ContentPerformance>;
  updatePerformance(id: number, updates: Partial<InsertPerformance>): Promise<ContentPerformance | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  // Draft operations
  async getDrafts(projectId: number): Promise<ContentDraft[]> {
    return await db
      .select()
      .from(contentDrafts)
      .where(eq(contentDrafts.projectId, projectId))
      .orderBy(desc(contentDrafts.createdAt));
  }

  async getDraft(id: number): Promise<ContentDraft | undefined> {
    const [draft] = await db.select().from(contentDrafts).where(eq(contentDrafts.id, id));
    return draft || undefined;
  }

  async createDraft(insertDraft: InsertContentDraft): Promise<ContentDraft> {
    const [draft] = await db
      .insert(contentDrafts)
      .values(insertDraft)
      .returning();
    return draft;
  }

  async deleteDraft(id: number): Promise<boolean> {
    const result = await db.delete(contentDrafts).where(eq(contentDrafts.id, id)).returning();
    return result.length > 0;
  }

  // Scheduled content operations
  async getScheduledContent(projectId?: number): Promise<ScheduledContent[]> {
    if (projectId) {
      return await db
        .select()
        .from(scheduledContent)
        .where(eq(scheduledContent.projectId, projectId))
        .orderBy(desc(scheduledContent.scheduledDate));
    }
    return await db
      .select()
      .from(scheduledContent)
      .orderBy(desc(scheduledContent.scheduledDate));
  }

  async getScheduledContentById(id: number): Promise<ScheduledContent | undefined> {
    const [content] = await db.select().from(scheduledContent).where(eq(scheduledContent.id, id));
    return content || undefined;
  }

  async createScheduledContent(content: InsertScheduledContent): Promise<ScheduledContent> {
    const [scheduled] = await db
      .insert(scheduledContent)
      .values(content)
      .returning();
    return scheduled;
  }

  async updateScheduledContent(id: number, updates: Partial<InsertScheduledContent>): Promise<ScheduledContent | undefined> {
    const [content] = await db
      .update(scheduledContent)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(scheduledContent.id, id))
      .returning();
    return content || undefined;
  }

  async deleteScheduledContent(id: number): Promise<boolean> {
    const result = await db.delete(scheduledContent).where(eq(scheduledContent.id, id)).returning();
    return result.length > 0;
  }

  // Performance operations
  async getPerformance(scheduledContentId: number): Promise<ContentPerformance[]> {
    return await db
      .select()
      .from(contentPerformance)
      .where(eq(contentPerformance.scheduledContentId, scheduledContentId))
      .orderBy(desc(contentPerformance.recordedAt));
  }

  async createPerformance(perf: InsertPerformance): Promise<ContentPerformance> {
    const [performance] = await db
      .insert(contentPerformance)
      .values(perf)
      .returning();
    return performance;
  }

  async updatePerformance(id: number, updates: Partial<InsertPerformance>): Promise<ContentPerformance | undefined> {
    const [performance] = await db
      .update(contentPerformance)
      .set(updates)
      .where(eq(contentPerformance.id, id))
      .returning();
    return performance || undefined;
  }
}

export const storage = new DatabaseStorage();
