import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FlaskConical, Loader2, Copy, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PlatformSelector } from "@/components/platform-selector";
import type { ABTestResult, Platform, Tone, GeneratedTitle, GeneratedThumbnail } from "@shared/schema";
import { tones } from "@shared/schema";

export function ABTesting() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["youtube"]);
  const [testType, setTestType] = useState<"titles" | "thumbnails">("titles");
  const [variantCount, setVariantCount] = useState(3);
  const [result, setResult] = useState<ABTestResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: {
      topic: string;
      tone: Tone;
      platforms: Platform[];
      testType: "titles" | "thumbnails";
      variantCount: number;
    }) => {
      const response = await apiRequest("POST", "/api/generate/ab-test", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "A/B Test Generated!",
        description: `Created ${data.variants.length} test variants.`,
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

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your A/B test.",
        variant: "destructive",
      });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform Required",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      topic: topic.trim(),
      tone,
      platforms: selectedPlatforms,
      testType,
      variantCount,
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getContentText = (content: GeneratedTitle | GeneratedThumbnail): string => {
    if ("title" in content) {
      return content.title;
    }
    return content.textOverlay;
  };

  const variantColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" data-testid="text-ab-title">A/B Testing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate test variants to optimize your content performance
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Form Section */}
        <Card className="w-80 flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-lg">Test Configuration</CardTitle>
            <CardDescription>
              Create variants to test different approaches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="Enter your video topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                data-testid="input-ab-topic"
              />
            </div>

            <div className="space-y-2">
              <Label>Test Type</Label>
              <Tabs value={testType} onValueChange={(v) => setTestType(v as "titles" | "thumbnails")}>
                <TabsList className="w-full">
                  <TabsTrigger value="titles" className="flex-1" data-testid="tab-titles">
                    Titles
                  </TabsTrigger>
                  <TabsTrigger value="thumbnails" className="flex-1" data-testid="tab-thumbnails">
                    Thumbnails
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger data-testid="select-ab-tone">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Number of Variants</Label>
                <span className="text-sm font-medium">{variantCount}</span>
              </div>
              <Slider
                value={[variantCount]}
                onValueChange={(v) => setVariantCount(v[0])}
                min={2}
                max={5}
                step={1}
                data-testid="slider-variants"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              data-testid="button-generate-ab"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Generate Variants
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {!result ? (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Create A/B Test Variants</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Enter a topic and configure your test to generate multiple variants for comparison.
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Variants Grid */}
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
                  {result.variants.map((variant, index) => (
                    <Card key={index} className="relative" data-testid={`variant-${variant.variant}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${variantColors[index]}`} />
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Variant {variant.variant}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(getContentText(variant.content), `variant-${index}`)}
                          >
                            {copiedIndex === `variant-${index}` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {"title" in variant.content ? (
                          <>
                            <p className="text-sm font-medium">{variant.content.title}</p>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-[10px]">
                                {variant.content.characterCount} chars
                              </Badge>
                              <Badge variant="secondary" className="text-[10px]">
                                SEO: {variant.content.seoScore}
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium">{variant.content.textOverlay}</p>
                            <p className="text-xs text-muted-foreground">{variant.content.concept}</p>
                            <p className="text-xs">Colors: {variant.content.colorScheme}</p>
                          </>
                        )}
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Hypothesis:</span> {variant.hypothesis}
                          </p>
                          <Badge variant="outline" className="mt-2 text-[10px]">
                            Target: {variant.targetAudience}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Recommendation Card */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Recommendation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{result.recommendation}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
