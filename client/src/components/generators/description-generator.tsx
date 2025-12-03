import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { PlatformSelector } from "../platform-selector";
import { ContentCard } from "../content-card";
import { LoadingCard } from "../loading-card";
import { Badge } from "@/components/ui/badge";
import {
  generateDescriptionSchema,
  tones,
  platformLimits,
  type GenerateDescriptionRequest,
  type GeneratedDescription,
  type Platform,
} from "@shared/schema";

interface DescriptionGeneratorProps {
  onGenerate: (data: GenerateDescriptionRequest) => void;
  results: GeneratedDescription[] | null;
  isLoading: boolean;
  onSaveDraft?: (content: string) => void;
}

const toneLabels: Record<string, string> = {
  professional: "Professional",
  casual: "Casual & Friendly",
  energetic: "Energetic & Exciting",
  educational: "Educational",
  humorous: "Humorous",
  inspirational: "Inspirational",
};

const platformLabels: Record<Platform, string> = {
  youtube: "YouTube",
  rumble: "Rumble",
  bitchute: "BitChute",
  odysee: "Odysee",
  tiktok: "TikTok",
  instagram: "Instagram",
};

export function DescriptionGenerator({
  onGenerate,
  results,
  isLoading,
  onSaveDraft,
}: DescriptionGeneratorProps) {
  const form = useForm<GenerateDescriptionRequest>({
    resolver: zodResolver(generateDescriptionSchema),
    defaultValues: {
      title: "",
      topic: "",
      tone: "professional",
      platforms: ["youtube"],
      keywords: "",
      includeHashtags: true,
      includeCallToAction: true,
    },
  });

  const onSubmit = (data: GenerateDescriptionRequest) => {
    onGenerate(data);
  };

  const selectedPlatforms = form.watch("platforms");

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 10 Camera Settings That Will Transform Your Videos"
                    {...field}
                    data-testid="input-desc-title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Topic *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Professional camera settings for content creators"
                    {...field}
                    data-testid="input-desc-topic"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-desc-tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tones.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {toneLabels[tone]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platforms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Platforms *</FormLabel>
                <FormControl>
                  <PlatformSelector
                    selected={field.value as Platform[]}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                {selectedPlatforms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPlatforms.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {platformLabels[p as Platform]}: max {platformLimits[p as Platform].description} chars
                      </Badge>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords (comma-separated)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., camera tips, video production, filmmaking"
                    {...field}
                    data-testid="input-desc-keywords"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="includeHashtags"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Include Hashtags</FormLabel>
                    <FormDescription className="text-xs">
                      Add relevant hashtags
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-hashtags"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includeCallToAction"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Call to Action</FormLabel>
                    <FormDescription className="text-xs">
                      Add subscribe/like reminder
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-cta"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-generate-descriptions">
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? "Generating Descriptions..." : "Generate Descriptions"}
          </Button>
        </form>
      </Form>

      {isLoading && <LoadingCard message="Writing optimized descriptions..." />}

      {results && !isLoading && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">
            Generated Descriptions ({results.length})
          </h3>
          {results.map((desc, index) => (
            <ContentCard
              key={index}
              title={`${platformLabels[desc.platform]} Description`}
              content={desc.description}
              metadata={{
                Characters: desc.characterCount,
                Limit: platformLimits[desc.platform].description,
              }}
              badges={desc.hashtags.slice(0, 5).map((tag) => ({
                label: tag,
                variant: "outline" as const,
              }))}
              onSave={onSaveDraft}
            />
          ))}
        </div>
      )}
    </div>
  );
}
