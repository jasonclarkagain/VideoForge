import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, X, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PlatformSelector } from "@/components/platform-selector";
import type { BatchGenerationResult, Platform, Tone } from "@shared/schema";
import { tones, platforms } from "@shared/schema";

export function BatchGenerate() {
  const { toast } = useToast();
  const [topics, setTopics] = useState<string[]>([""]);
  const [tone, setTone] = useState<Tone>("professional");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["youtube"]);
  const [generateTitles, setGenerateTitles] = useState(true);
  const [generateDescriptions, setGenerateDescriptions] = useState(true);
  const [generateThumbnails, setGenerateThumbnails] = useState(false);
  const [results, setResults] = useState<BatchGenerationResult[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: {
      topics: string[];
      tone: Tone;
      platforms: Platform[];
      generateTitles: boolean;
      generateDescriptions: boolean;
      generateThumbnails: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/generate/batch", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.results);
      toast({
        title: "Batch Generation Complete!",
        description: `Generated content for ${data.results.length} topics.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addTopic = () => {
    if (topics.length < 10) {
      setTopics([...topics, ""]);
    }
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleGenerate = () => {
    const validTopics = topics.filter((t) => t.trim());
    if (validTopics.length === 0) {
      toast({
        title: "No Topics",
        description: "Please add at least one topic.",
        variant: "destructive",
      });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platforms",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }
    
    generateMutation.mutate({
      topics: validTopics,
      tone,
      platforms: selectedPlatforms,
      generateTitles,
      generateDescriptions,
      generateThumbnails,
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" data-testid="text-batch-title">Batch Content Generation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate content for multiple videos at once
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Form Section */}
        <Card className="w-96 flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-lg">Topics</CardTitle>
            <CardDescription>
              Add up to 10 video topics to generate content for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Topic ${index + 1}`}
                      value={topic}
                      onChange={(e) => updateTopic(index, e.target.value)}
                      data-testid={`input-topic-${index}`}
                    />
                    {topics.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTopic(index)}
                        data-testid={`button-remove-topic-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {topics.length < 10 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={addTopic}
                data-testid="button-add-topic"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            )}

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  <SelectTrigger data-testid="select-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platforms</Label>
                <PlatformSelector
                  selected={selectedPlatforms}
                  onChange={setSelectedPlatforms}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gen-titles">Generate Titles</Label>
                  <Switch
                    id="gen-titles"
                    checked={generateTitles}
                    onCheckedChange={setGenerateTitles}
                    data-testid="switch-titles"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="gen-descriptions">Generate Descriptions</Label>
                  <Switch
                    id="gen-descriptions"
                    checked={generateDescriptions}
                    onCheckedChange={setGenerateDescriptions}
                    data-testid="switch-descriptions"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="gen-thumbnails">Generate Thumbnails</Label>
                  <Switch
                    id="gen-thumbnails"
                    checked={generateThumbnails}
                    onCheckedChange={setGenerateThumbnails}
                    data-testid="switch-thumbnails"
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              data-testid="button-generate-batch"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate All"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Generated Content</CardTitle>
            <CardDescription>
              {results 
                ? `${results.length} topic(s) processed`
                : "Content will appear here after generation"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)] overflow-hidden">
            {!results ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Configure your topics and click "Generate All" to start</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <Accordion type="multiple" className="pr-4">
                  {results.map((result, index) => (
                    <AccordionItem key={index} value={`topic-${index}`} data-testid={`result-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-medium">{result.topic}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {result.titles && result.titles.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Titles</h4>
                              <div className="space-y-2">
                                {result.titles.map((title, tIndex) => (
                                  <div
                                    key={tIndex}
                                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                                  >
                                    <div>
                                      <p className="text-sm">{title.title}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[10px]">
                                          {title.characterCount} chars
                                        </Badge>
                                        <Badge variant="secondary" className="text-[10px]">
                                          SEO: {title.seoScore}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => copyToClipboard(title.title, `title-${index}-${tIndex}`)}
                                    >
                                      {copiedIndex === `title-${index}-${tIndex}` ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.descriptions && result.descriptions.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Descriptions</h4>
                              <div className="space-y-2">
                                {result.descriptions.map((desc, dIndex) => (
                                  <div
                                    key={dIndex}
                                    className="p-2 rounded-md bg-muted/50"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <Badge variant="outline">{desc.platform}</Badge>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard(desc.description, `desc-${index}-${dIndex}`)}
                                      >
                                        {copiedIndex === `desc-${index}-${dIndex}` ? (
                                          <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{desc.description}</p>
                                    {desc.hashtags && desc.hashtags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {desc.hashtags.map((tag, hIndex) => (
                                          <Badge key={hIndex} variant="secondary" className="text-[10px]">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.thumbnails && result.thumbnails.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Thumbnail Concepts</h4>
                              <div className="space-y-2">
                                {result.thumbnails.map((thumb, thIndex) => (
                                  <div key={thIndex} className="p-2 rounded-md bg-muted/50">
                                    <p className="text-sm font-medium">{thumb.textOverlay}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{thumb.concept}</p>
                                    <p className="text-xs mt-1">Colors: {thumb.colorScheme}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
