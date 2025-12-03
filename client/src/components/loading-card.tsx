import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingCardProps {
  message?: string;
}

export function LoadingCard({ message = "Generating content..." }: LoadingCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
          <div className="h-4 w-3/5 rounded bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
