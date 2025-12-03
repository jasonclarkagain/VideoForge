import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
import {
  generateTitleSchema,
  tones,
  type GenerateTitleRequest,
  type GeneratedTitle,
  type Platform,
} from "@shared/schema";

interface TitleGeneratorProps {
  onGenerate: (data: GenerateTitleRequest) => void;
  results: GeneratedTitle[] | null;
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

export function TitleGenerator({
  onGenerate,
  results,
  isLoading,
  onSaveDraft,
}: TitleGeneratorProps) {
  const form = useForm<GenerateTitleRequest>({
    resolver: zodResolver(generateTitleSchema),
    defaultValues: {
      topic: "",
      tone: "professional",
      platforms: ["youtube"],
      keywords: "",
      count: 5,
    },
  });

  const onSubmit = (data: GenerateTitleRequest) => {
    onGenerate(data);
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Topic *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Best camera settings for cinematic video"
                    {...field}
                    data-testid="input-title-topic"
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
                    <SelectTrigger data-testid="select-title-tone">
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
                    placeholder="e.g., camera settings, cinematic, video production"
                    {...field}
                    data-testid="input-title-keywords"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Titles: {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                    className="py-2"
                    data-testid="slider-title-count"
                  />
                </FormControl>
                <FormDescription>Generate between 1 and 10 title variations</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-generate-titles">
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? "Generating Titles..." : "Generate Titles"}
          </Button>
        </form>
      </Form>

      {isLoading && <LoadingCard message="Creating catchy titles..." />}

      {results && !isLoading && results.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">
            Generated Titles ({results.length})
          </h3>
          {results.map((title, index) => (
            <ContentCard
              key={index}
              title={`Option ${index + 1}`}
              content={title.title}
              metadata={{
                Characters: title.characterCount,
              }}
              badges={[
                {
                  label: `SEO: ${title.seoScore}%`,
                  variant: "secondary",
                },
              ]}
              onSave={onSaveDraft}
            />
          ))}
        </div>
      )}
    </div>
  );
}
