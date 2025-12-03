import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  generateScriptSchema,
  generateTitleSchema,
  generateDescriptionSchema,
  generateThumbnailSchema,
  generateIdeasSchema,
  insertProjectSchema,
  insertDraftSchema,
} from "@shared/schema";
import {
  generateScript,
  generateTitles,
  generateDescriptions,
  generateThumbnails,
  generateIdeas,
} from "./openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const project = await storage.createProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Draft routes
  app.get("/api/drafts", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }
      const drafts = await storage.getDrafts(projectId);
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      res.status(500).json({ error: "Failed to fetch drafts" });
    }
  });

  app.post("/api/drafts", async (req, res) => {
    try {
      const result = insertDraftSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const draft = await storage.createDraft(result.data);
      res.status(201).json(draft);
    } catch (error) {
      console.error("Error creating draft:", error);
      res.status(500).json({ error: "Failed to create draft" });
    }
  });

  app.delete("/api/drafts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDraft(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Draft not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting draft:", error);
      res.status(500).json({ error: "Failed to delete draft" });
    }
  });

  // Content generation routes
  app.post("/api/generate/script", async (req, res) => {
    try {
      const result = generateScriptSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const script = await generateScript(result.data);
      res.json(script);
    } catch (error) {
      console.error("Error generating script:", error);
      res.status(500).json({ error: "Failed to generate script. Please try again." });
    }
  });

  app.post("/api/generate/titles", async (req, res) => {
    try {
      const result = generateTitleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const titles = await generateTitles(result.data);
      res.json(titles);
    } catch (error) {
      console.error("Error generating titles:", error);
      res.status(500).json({ error: "Failed to generate titles. Please try again." });
    }
  });

  app.post("/api/generate/descriptions", async (req, res) => {
    try {
      const result = generateDescriptionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const descriptions = await generateDescriptions(result.data);
      res.json(descriptions);
    } catch (error) {
      console.error("Error generating descriptions:", error);
      res.status(500).json({ error: "Failed to generate descriptions. Please try again." });
    }
  });

  app.post("/api/generate/thumbnails", async (req, res) => {
    try {
      const result = generateThumbnailSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const thumbnails = await generateThumbnails(result.data);
      res.json(thumbnails);
    } catch (error) {
      console.error("Error generating thumbnails:", error);
      res.status(500).json({ error: "Failed to generate thumbnails. Please try again." });
    }
  });

  app.post("/api/generate/ideas", async (req, res) => {
    try {
      const result = generateIdeasSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const ideas = await generateIdeas(result.data);
      res.json(ideas);
    } catch (error) {
      console.error("Error generating ideas:", error);
      res.status(500).json({ error: "Failed to generate ideas. Please try again." });
    }
  });

  return httpServer;
}
