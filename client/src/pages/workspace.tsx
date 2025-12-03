import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileText, Type, AlignLeft, Image, Lightbulb, FolderOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScriptGenerator } from "@/components/generators/script-generator";
import { TitleGenerator } from "@/components/generators/title-generator";
import { DescriptionGenerator } from "@/components/generators/description-generator";
import { ThumbnailGenerator } from "@/components/generators/thumbnail-generator";
import { IdeasGenerator } from "@/components/generators/ideas-generator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type {
  GenerateScriptRequest,
  GenerateTitleRequest,
  GenerateDescriptionRequest,
  GenerateThumbnailRequest,
  GenerateIdeasRequest,
  GeneratedScript,
  GeneratedTitle,
  GeneratedDescription,
  GeneratedThumbnail,
  GeneratedIdea,
  Project,
} from "@shared/schema";

interface WorkspaceProps {
  selectedProjectId: string | null;
  projects: Project[];
}

export function Workspace({ selectedProjectId, projects }: WorkspaceProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scripts");

  // Generation results state
  const [scriptResult, setScriptResult] = useState<GeneratedScript | null>(null);
  const [titleResults, setTitleResults] = useState<GeneratedTitle[] | null>(null);
  const [descriptionResults, setDescriptionResults] = useState<GeneratedDescription[] | null>(null);
  const [thumbnailResults, setThumbnailResults] = useState<GeneratedThumbnail[] | null>(null);
  const [ideasResults, setIdeasResults] = useState<GeneratedIdea[] | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Script generation mutation
  const generateScriptMutation = useMutation({
    mutationFn: async (data: GenerateScriptRequest) => {
      const response = await apiRequest("POST", "/api/generate/script", data);
      return response.json();
    },
    onSuccess: (data) => {
      setScriptResult(data);
      toast({
        title: "Script Generated!",
        description: "Your video script is ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate script. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Title generation mutation
  const generateTitlesMutation = useMutation({
    mutationFn: async (data: GenerateTitleRequest) => {
      const response = await apiRequest("POST", "/api/generate/titles", data);
      return response.json();
    },
    onSuccess: (data) => {
      setTitleResults(data.titles);
      toast({
        title: "Titles Generated!",
        description: `Created ${data.titles.length} title options.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate titles. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Description generation mutation
  const generateDescriptionsMutation = useMutation({
    mutationFn: async (data: GenerateDescriptionRequest) => {
      const response = await apiRequest("POST", "/api/generate/descriptions", data);
      return response.json();
    },
    onSuccess: (data) => {
      setDescriptionResults(data.descriptions);
      toast({
        title: "Descriptions Generated!",
        description: `Created descriptions for ${data.descriptions.length} platform(s).`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate descriptions. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Thumbnail generation mutation
  const generateThumbnailsMutation = useMutation({
    mutationFn: async (data: GenerateThumbnailRequest) => {
      const response = await apiRequest("POST", "/api/generate/thumbnails", data);
      return response.json();
    },
    onSuccess: (data) => {
      setThumbnailResults(data.thumbnails);
      toast({
        title: "Thumbnails Generated!",
        description: `Created ${data.thumbnails.length} thumbnail concepts.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate thumbnails. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Ideas generation mutation
  const generateIdeasMutation = useMutation({
    mutationFn: async (data: GenerateIdeasRequest) => {
      const response = await apiRequest("POST", "/api/generate/ideas", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIdeasResults(data.ideas);
      toast({
        title: "Ideas Generated!",
        description: `Brainstormed ${data.ideas.length} video ideas.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: { projectId: string; type: string; content: string }) => {
      const response = await apiRequest("POST", "/api/drafts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drafts"] });
      toast({
        title: "Draft Saved!",
        description: "Content saved to your project.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveDraft = (type: string) => (content: string) => {
    if (!selectedProjectId) {
      toast({
        title: "No Project Selected",
        description: "Please select or create a project first.",
        variant: "destructive",
      });
      return;
    }
    saveDraftMutation.mutate({ projectId: selectedProjectId, type, content });
  };

  const tabs = [
    { id: "scripts", label: "Scripts", icon: FileText },
    { id: "titles", label: "Titles", icon: Type },
    { id: "descriptions", label: "Descriptions", icon: AlignLeft },
    { id: "thumbnails", label: "Thumbnails", icon: Image },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4" data-testid="workspace-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-workspace-title">
              {selectedProject ? selectedProject.name : "Content Workspace"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-workspace-description">
              {selectedProject
                ? selectedProject.description || "Generate content for your video"
                : "Select or create a project to get started"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-6">
          <TabsList className="h-12 bg-transparent p-0 gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative h-12 rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 max-w-3xl mx-auto">
            <TabsContent value="scripts" className="mt-0">
              <ScriptGenerator
                onGenerate={(data) => generateScriptMutation.mutate(data)}
                result={scriptResult}
                isLoading={generateScriptMutation.isPending}
                onSaveDraft={handleSaveDraft("script")}
              />
            </TabsContent>

            <TabsContent value="titles" className="mt-0">
              <TitleGenerator
                onGenerate={(data) => generateTitlesMutation.mutate(data)}
                results={titleResults}
                isLoading={generateTitlesMutation.isPending}
                onSaveDraft={handleSaveDraft("title")}
              />
            </TabsContent>

            <TabsContent value="descriptions" className="mt-0">
              <DescriptionGenerator
                onGenerate={(data) => generateDescriptionsMutation.mutate(data)}
                results={descriptionResults}
                isLoading={generateDescriptionsMutation.isPending}
                onSaveDraft={handleSaveDraft("description")}
              />
            </TabsContent>

            <TabsContent value="thumbnails" className="mt-0">
              <ThumbnailGenerator
                onGenerate={(data) => generateThumbnailsMutation.mutate(data)}
                results={thumbnailResults}
                isLoading={generateThumbnailsMutation.isPending}
                onSaveDraft={handleSaveDraft("thumbnail")}
              />
            </TabsContent>

            <TabsContent value="ideas" className="mt-0">
              <IdeasGenerator
                onGenerate={(data) => generateIdeasMutation.mutate(data)}
                results={ideasResults}
                isLoading={generateIdeasMutation.isPending}
                onSaveDraft={handleSaveDraft("idea")}
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
