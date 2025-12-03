import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/form";
import { PlatformSelector } from "../platform-selector";
import { ContentCard } from "../content-card";
import { LoadingCard } from "../loading-card";
import {
  generateScriptSchema,
  tones,
  scriptLengths,
  type GenerateScriptRequest,
  type GeneratedScript,
  type Platform,
} from "@shared/schema";

interface ScriptGeneratorProps {
  onGenerate: (data: GenerateScriptRequest) => void;
  result: GeneratedScript | null;
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

const lengthLabels: Record<string, string> = {
  short: "Short (1-3 min)",
  medium: "Medium (5-10 min)",
  long: "Long (15+ min)",
};

export function ScriptGenerator({
  onGenerate,
  result,
  isLoading,
  onSaveDraft,
}: ScriptGeneratorProps) {
  const form = useForm<GenerateScriptRequest>({
    resolver: zodResolver(generateScriptSchema),
    defaultValues: {
      topic: "",
      targetAudience: "",
      tone: "professional",
      length: "medium",
      platforms: ["youtube"],
      keywords: "",
      additionalNotes: "",
    },
  });

  const onSubmit = (data: GenerateScriptRequest) => {
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
                    placeholder="e.g., How to start a successful YouTube channel in 2024"
                    {...field}
                    data-testid="input-script-topic"
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
                    placeholder="e.g., Beginner content creators, ages 18-35"
                    {...field}
                    data-testid="input-script-audience"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-script-tone">
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
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script Length</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-script-length">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {scriptLengths.map((length) => (
                        <SelectItem key={length} value={length}>
                          {lengthLabels[length]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    placeholder="e.g., YouTube growth, content strategy, viral videos"
                    {...field}
                    data-testid="input-script-keywords"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any specific points to cover, style preferences, or other requirements..."
                    className="resize-none min-h-[80px]"
                    {...field}
                    data-testid="input-script-notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-generate-script">
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? "Generating Script..." : "Generate Script"}
          </Button>
        </form>
      </Form>

      {isLoading && <LoadingCard message="Crafting your video script..." />}

      {result && !isLoading && (
        <div className="space-y-4">
          <ContentCard
            title="Generated Script"
            content={result.script}
            metadata={{
              "Est. Duration": result.estimatedDuration,
              Sections: result.sections.length.toString(),
            }}
            badges={result.sections.map((s) => ({ label: s, variant: "outline" as const }))}
            onSave={onSaveDraft}
            monospace
          />
        </div>
      )}
    </div>
  );
}
