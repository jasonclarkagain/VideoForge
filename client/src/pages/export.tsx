import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Calendar as CalendarIcon, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface ExportPageProps {
  selectedProjectId: number | null;
  projects: Project[];
}

export function ExportPage({ selectedProjectId, projects }: ExportPageProps) {
  const { toast } = useToast();
  const [exportType, setExportType] = useState<"drafts" | "scheduled">("drafts");
  const [projectFilter, setProjectFilter] = useState<string>(selectedProjectId?.toString() || "all");
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let url = `/api/export/${exportType}`;
      if (projectFilter !== "all") {
        url += `?projectId=${projectFilter}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || `${exportType}-export.csv`;

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setLastExport(new Date().toLocaleString());
      toast({
        title: "Export Complete!",
        description: `Your ${exportType} have been exported to CSV.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" data-testid="text-export-title">Export Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download your content and scheduled items as CSV files
        </p>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Export Options */}
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-lg">Export Options</CardTitle>
            <CardDescription>
              Choose what data you want to export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Export Type</Label>
              <RadioGroup value={exportType} onValueChange={(v) => setExportType(v as "drafts" | "scheduled")}>
                <div className="flex items-center space-x-2 p-3 rounded-md border cursor-pointer hover:bg-muted/50" onClick={() => setExportType("drafts")}>
                  <RadioGroupItem value="drafts" id="drafts" data-testid="radio-drafts" />
                  <Label htmlFor="drafts" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Content Drafts</div>
                        <div className="text-xs text-muted-foreground">
                          Export all saved scripts, titles, descriptions, etc.
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-md border cursor-pointer hover:bg-muted/50" onClick={() => setExportType("scheduled")}>
                  <RadioGroupItem value="scheduled" id="scheduled" data-testid="radio-scheduled" />
                  <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Scheduled Content</div>
                        <div className="text-xs text-muted-foreground">
                          Export your content calendar items
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Filter by Project</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger data-testid="select-project-filter">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleExport}
              disabled={isExporting || (exportType === "drafts" && projectFilter === "all")}
              data-testid="button-export"
            >
              {isExporting ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </>
              )}
            </Button>

            {exportType === "drafts" && projectFilter === "all" && (
              <p className="text-xs text-muted-foreground text-center">
                Please select a specific project to export drafts
              </p>
            )}

            {lastExport && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>Last export: {lastExport}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Info */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Export Information</CardTitle>
            <CardDescription>
              What&apos;s included in your export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  CSV Format
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your data will be exported as a comma-separated values (CSV) file that can be opened in Excel, Google Sheets, or any spreadsheet application.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Content Drafts Export Includes:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Content type (script, title, description, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Full content text
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Target platform
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Creation date
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Scheduled Content Export Includes:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Video title and description
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Target platform
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Scheduled publish date
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Current status
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4 bg-muted/50 rounded-md p-4">
                <h4 className="font-medium mb-2">Future Integrations</h4>
                <p className="text-sm text-muted-foreground">
                  Direct API integration with YouTube and Rumble for automatic publishing is coming soon. 
                  For now, you can use the exported CSV data to manually upload your content or import it into other tools.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
