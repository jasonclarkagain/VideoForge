import type { Project, InsertProject, ContentDraft, InsertContentDraft } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;

  // Draft operations
  getDrafts(projectId: string): Promise<ContentDraft[]>;
  getDraft(id: string): Promise<ContentDraft | undefined>;
  createDraft(draft: InsertContentDraft): Promise<ContentDraft>;
  deleteDraft(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private drafts: Map<string, ContentDraft>;

  constructor() {
    this.projects = new Map();
    this.drafts = new Map();
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async deleteProject(id: string): Promise<boolean> {
    // Also delete associated drafts
    const draftIds = Array.from(this.drafts.values())
      .filter((d) => d.projectId === id)
      .map((d) => d.id);
    
    for (const draftId of draftIds) {
      this.drafts.delete(draftId);
    }
    
    return this.projects.delete(id);
  }

  // Draft operations
  async getDrafts(projectId: string): Promise<ContentDraft[]> {
    return Array.from(this.drafts.values())
      .filter((d) => d.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDraft(id: string): Promise<ContentDraft | undefined> {
    return this.drafts.get(id);
  }

  async createDraft(insertDraft: InsertContentDraft): Promise<ContentDraft> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const draft: ContentDraft = {
      ...insertDraft,
      id,
      createdAt: now,
    };
    this.drafts.set(id, draft);
    return draft;
  }

  async deleteDraft(id: string): Promise<boolean> {
    return this.drafts.delete(id);
  }
}

export const storage = new MemStorage();
