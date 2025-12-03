import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, TrendingUp, Lightbulb, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCard } from "../loading-card";
import {
  generateIdeasSchema,
  type GenerateIdeasRequest,
  type GeneratedIdea,
} from "@shared/schema";

interface IdeasGeneratorProps {
  onGenerate: (data: GenerateIdeasRequest) => void;
  results: GeneratedIdea[] | null;
  isLoading: boolean;
  onSaveDraft?: (content: string) => void;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function IdeasGenerator({
  onGenerate,
  results,
  isLoading,
  onSaveDraft,
}: IdeasGeneratorProps) {
  const form = useForm<GenerateIdeasRequest>({
    resolver: zodResolver(generateIdeasSchema),
    defaultValues: {
      niche: "",
      targetAudience: "",
      count: 10,
      trending: false,
    },
  });

  const onSubmit = (data: GenerateIdeasRequest) => {
    onGenerate(data);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="niche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Niche *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Tech reviews, Cooking tutorials, Fitness"
                    {...field}
                    data-testid="input-ideas-niche"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Young professionals, Gaming enthusiasts"
                    {...field}
                    data-testid="input-ideas-audience"
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
                <FormLabel>Number of Ideas: {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                    className="py-2"
                    data-testid="slider-ideas-count"
                  />
                </FormControl>
                <FormDescription>Generate between 1 and 20 video ideas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trending"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Focus on Trending Topics
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Generate ideas based on current trends
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-trending"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-generate-ideas">
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? "Brainstorming Ideas..." : "Generate Ideas"}
          </Button>
        </form>
      </Form>

      {isLoading && <LoadingCard message="Brainstorming video ideas..." />}

      {results && !isLoading && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">
            Video Ideas ({results.length})
          </h3>
          <div className="grid gap-3">
            {results.map((idea, index) => (
              <Card key={index} className="overflow-hidden hover-elevate cursor-pointer transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <h4 className="font-medium text-sm">{idea.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {idea.description}
                      </p>
                      <div className="flex items-center gap-3 pl-6 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {idea.potentialViews}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${difficultyColors[idea.difficulty]}`}
                        >
                          {idea.difficulty.charAt(0).toUpperCase() + idea.difficulty.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSaveDraft?.(idea.title)}
                      data-testid={`button-save-idea-${index}`}
                    >
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
