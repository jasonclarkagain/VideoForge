import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Palette, Type, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  generateThumbnailSchema,
  type GenerateThumbnailRequest,
  type GeneratedThumbnail,
} from "@shared/schema";

interface ThumbnailGeneratorProps {
  onGenerate: (data: GenerateThumbnailRequest) => void;
  results: GeneratedThumbnail[] | null;
  isLoading: boolean;
  onSaveDraft?: (content: string) => void;
}

export function ThumbnailGenerator({
  onGenerate,
  results,
  isLoading,
  onSaveDraft,
}: ThumbnailGeneratorProps) {
  const form = useForm<GenerateThumbnailRequest>({
    resolver: zodResolver(generateThumbnailSchema),
    defaultValues: {
      topic: "",
      title: "",
      style: "",
      count: 3,
    },
  });

  const onSubmit = (data: GenerateThumbnailRequest) => {
    onGenerate(data);
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
                    placeholder="e.g., iPhone 16 Pro Max Review"
                    {...field}
                    data-testid="input-thumbnail-topic"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Title (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Is This The BEST Phone Ever?"
                    {...field}
                    data-testid="input-thumbnail-title"
                  />
                </FormControl>
                <FormDescription>
                  Helps generate more relevant text overlay suggestions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Style Preference</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Modern, minimalist with bold text"
                    {...field}
                    data-testid="input-thumbnail-style"
                  />
                </FormControl>
                <FormDescription>
                  Describe your preferred visual style
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Concepts: {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                    className="py-2"
                    data-testid="slider-thumbnail-count"
                  />
                </FormControl>
                <FormDescription>Generate between 1 and 5 thumbnail concepts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-generate-thumbnails">
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? "Generating Concepts..." : "Generate Thumbnail Concepts"}
          </Button>
        </form>
      </Form>

      {isLoading && <LoadingCard message="Designing thumbnail concepts..." />}

      {results && !isLoading && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">
            Thumbnail Concepts ({results.length})
          </h3>
          {results.map((thumbnail, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  Concept {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Main Concept
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {thumbnail.concept}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    Text Overlay
                  </div>
                  <p className="text-sm font-mono bg-muted/50 p-2 rounded pl-6">
                    "{thumbnail.textOverlay}"
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    Color Scheme
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {thumbnail.colorScheme}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Visual Elements</div>
                  <div className="flex flex-wrap gap-1.5 pl-0">
                    {thumbnail.elements.map((element, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {element}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => onSaveDraft?.(JSON.stringify(thumbnail, null, 2))}
                  data-testid={`button-save-thumbnail-${index}`}
                >
                  Save Concept
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
