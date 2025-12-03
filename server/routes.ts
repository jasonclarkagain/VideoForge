import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  generateScriptSchema,
  generateTitleSchema,
  generateDescriptionSchema,
  generateThumbnailSchema,
  generateIdeasSchema,
  generateBatchSchema,
  generateABTestSchema,
  insertProjectSchema,
  insertDraftSchema,
  insertScheduledContentSchema,
  insertPerformanceSchema,
} from "@shared/schema";
import {
  generateScript,
  generateTitles,
  generateDescriptions,
  generateThumbnails,
  generateIdeas,
  generateBatch,
  generateABTest,
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      const project = await storage.getProject(id);
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

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      const project = await storage.updateProject(id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      const deleted = await storage.deleteProject(id);
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
      const projectId = parseInt(req.query.projectId as string);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Valid project ID is required" });
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid draft ID" });
      }
      const deleted = await storage.deleteDraft(id);
      if (!deleted) {
        return res.status(404).json({ error: "Draft not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting draft:", error);
      res.status(500).json({ error: "Failed to delete draft" });
    }
  });

  // Scheduled content routes (Calendar)
  app.get("/api/scheduled", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const content = await storage.getScheduledContent(projectId);
      res.json(content);
    } catch (error) {
      console.error("Error fetching scheduled content:", error);
      res.status(500).json({ error: "Failed to fetch scheduled content" });
    }
  });

  app.get("/api/scheduled/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scheduled content ID" });
      }
      const content = await storage.getScheduledContentById(id);
      if (!content) {
        return res.status(404).json({ error: "Scheduled content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching scheduled content:", error);
      res.status(500).json({ error: "Failed to fetch scheduled content" });
    }
  });

  app.post("/api/scheduled", async (req, res) => {
    try {
      const result = insertScheduledContentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const content = await storage.createScheduledContent(result.data);
      res.status(201).json(content);
    } catch (error) {
      console.error("Error creating scheduled content:", error);
      res.status(500).json({ error: "Failed to create scheduled content" });
    }
  });

  app.patch("/api/scheduled/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scheduled content ID" });
      }
      const content = await storage.updateScheduledContent(id, req.body);
      if (!content) {
        return res.status(404).json({ error: "Scheduled content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error updating scheduled content:", error);
      res.status(500).json({ error: "Failed to update scheduled content" });
    }
  });

  app.delete("/api/scheduled/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scheduled content ID" });
      }
      const deleted = await storage.deleteScheduledContent(id);
      if (!deleted) {
        return res.status(404).json({ error: "Scheduled content not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scheduled content:", error);
      res.status(500).json({ error: "Failed to delete scheduled content" });
    }
  });

  // Performance routes (Analytics)
  app.get("/api/performance/:scheduledContentId", async (req, res) => {
    try {
      const scheduledContentId = parseInt(req.params.scheduledContentId);
      if (isNaN(scheduledContentId)) {
        return res.status(400).json({ error: "Invalid scheduled content ID" });
      }
      const performance = await storage.getPerformance(scheduledContentId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  app.post("/api/performance", async (req, res) => {
    try {
      const result = insertPerformanceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const performance = await storage.createPerformance(result.data);
      res.status(201).json(performance);
    } catch (error) {
      console.error("Error creating performance record:", error);
      res.status(500).json({ error: "Failed to create performance record" });
    }
  });

  app.patch("/api/performance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid performance ID" });
      }
      const performance = await storage.updatePerformance(id, req.body);
      if (!performance) {
        return res.status(404).json({ error: "Performance record not found" });
      }
      res.json(performance);
    } catch (error) {
      console.error("Error updating performance:", error);
      res.status(500).json({ error: "Failed to update performance record" });
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

  // Batch generation route
  app.post("/api/generate/batch", async (req, res) => {
    try {
      const result = generateBatchSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const batchResults = await generateBatch(result.data);
      res.json(batchResults);
    } catch (error) {
      console.error("Error generating batch content:", error);
      res.status(500).json({ error: "Failed to generate batch content. Please try again." });
    }
  });

  // A/B Test generation route
  app.post("/api/generate/ab-test", async (req, res) => {
    try {
      const result = generateABTestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      const abTestResult = await generateABTest(result.data);
      res.json(abTestResult);
    } catch (error) {
      console.error("Error generating A/B test:", error);
      res.status(500).json({ error: "Failed to generate A/B test. Please try again." });
    }
  });

  // Export route
  app.get("/api/export/drafts", async (req, res) => {
    try {
      const projectId = parseInt(req.query.projectId as string);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Valid project ID is required" });
      }
      const drafts = await storage.getDrafts(projectId);
      const project = await storage.getProject(projectId);
      
      // Generate CSV
      const headers = ["Type", "Content", "Platform", "Created At"];
      const rows = drafts.map(d => [
        d.type,
        `"${d.content.replace(/"/g, '""')}"`,
        d.platform || "",
        d.createdAt?.toISOString() || ""
      ]);
      
      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${project?.name || 'drafts'}-export.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting drafts:", error);
      res.status(500).json({ error: "Failed to export drafts" });
    }
  });

  app.get("/api/export/scheduled", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const content = await storage.getScheduledContent(projectId);
      
      // Generate CSV
      const headers = ["Title", "Description", "Platform", "Scheduled Date", "Status", "Created At"];
      const rows = content.map(c => [
        `"${c.title.replace(/"/g, '""')}"`,
        `"${(c.description || "").replace(/"/g, '""')}"`,
        c.platform,
        c.scheduledDate?.toISOString() || "",
        c.status,
        c.createdAt?.toISOString() || ""
      ]);
      
      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="scheduled-content-export.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting scheduled content:", error);
      res.status(500).json({ error: "Failed to export scheduled content" });
    }
  });

  return httpServer;
}
