import { useState } from "react";
import { Copy, Check, Pencil, Save, X } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ContentCardProps {
  title: string;
  content: string;
  metadata?: Record<string, string | number>;
  badges?: { label: string; variant?: "default" | "secondary" | "outline" }[];
  onSave?: (content: string) => void;
  monospace?: boolean;
}

export function ContentCard({
  title,
  content,
  metadata,
  badges,
  onSave,
  monospace = false,
}: ContentCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedContent : content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    onSave?.(editedContent);
    setIsEditing(false);
    toast({
      title: "Saved!",
      description: "Content has been updated",
    });
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button variant="ghost" size="icon" onClick={handleCancel} data-testid="button-cancel-edit">
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSave} data-testid="button-save-edit">
                  <Save className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} data-testid="button-edit-content">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCopy} data-testid="button-copy-content">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
        </div>
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant || "secondary"} className="text-xs">
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className={`min-h-[120px] resize-none ${monospace ? "font-mono text-sm" : ""}`}
            data-testid="textarea-edit-content"
          />
        ) : (
          <div
            className={`text-sm whitespace-pre-wrap ${
              monospace ? "font-mono bg-muted/50 p-3 rounded-md" : ""
            }`}
            data-testid="text-content"
          >
            {content}
          </div>
        )}
      </CardContent>
      {metadata && Object.keys(metadata).length > 0 && (
        <CardFooter className="pt-0 pb-3">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {Object.entries(metadata).map(([key, value]) => (
              <span key={key}>
                <span className="font-medium">{key}:</span> {value}
              </span>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
