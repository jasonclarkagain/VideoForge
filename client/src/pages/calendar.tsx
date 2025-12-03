import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Video, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ScheduledContent, Project } from "@shared/schema";
import { platforms, scheduleStatuses } from "@shared/schema";

interface ContentCalendarProps {
  selectedProjectId: number | null;
  projects: Project[];
}

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  in_progress: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  published: "bg-green-500/20 text-green-700 dark:text-green-300",
  cancelled: "bg-red-500/20 text-red-700 dark:text-red-300",
};

export function ContentCalendar({ selectedProjectId, projects }: ContentCalendarProps) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ScheduledContent | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPlatform, setFormPlatform] = useState<string>("youtube");
  const [formStatus, setFormStatus] = useState<string>("planned");

  // Fetch scheduled content
  const { data: scheduledContent = [] } = useQuery<ScheduledContent[]>({
    queryKey: ["/api/scheduled", selectedProjectId],
    queryFn: async () => {
      const url = selectedProjectId 
        ? `/api/scheduled?projectId=${selectedProjectId}` 
        : "/api/scheduled";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch scheduled content");
      return response.json();
    },
  });

  // Create scheduled content mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      projectId: number;
      title: string;
      description?: string;
      scheduledDate: Date;
      platform: string;
      status: string;
    }) => {
      const response = await apiRequest("POST", "/api/scheduled", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled"] });
      resetForm();
      setIsCreateOpen(false);
      toast({
        title: "Content Scheduled!",
        description: "Your content has been added to the calendar.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update scheduled content mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<ScheduledContent>) => {
      const response = await apiRequest("PATCH", `/api/scheduled/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled"] });
      resetForm();
      setEditingContent(null);
      toast({
        title: "Content Updated!",
        description: "Your scheduled content has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete scheduled content mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/scheduled/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled"] });
      toast({
        title: "Content Deleted",
        description: "The scheduled content has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormPlatform("youtube");
    setFormStatus("planned");
    setSelectedDate(null);
  };

  const handleCreate = () => {
    if (!selectedProjectId || !selectedDate || !formTitle.trim()) return;
    
    createMutation.mutate({
      projectId: selectedProjectId,
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      scheduledDate: selectedDate,
      platform: formPlatform,
      status: formStatus,
    });
  };

  const handleUpdate = () => {
    if (!editingContent) return;
    
    updateMutation.mutate({
      id: editingContent.id,
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      platform: formPlatform,
      status: formStatus,
    });
  };

  const openEditDialog = (content: ScheduledContent) => {
    setEditingContent(content);
    setFormTitle(content.title);
    setFormDescription(content.description || "");
    setFormPlatform(content.platform);
    setFormStatus(content.status);
  };

  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get first day offset
  const firstDayOffset = monthStart.getDay();
  const paddingDays = Array(firstDayOffset).fill(null);

  // Get content for a specific day
  const getContentForDay = (day: Date) => {
    return scheduledContent.filter((content) => {
      const contentDate = new Date(content.scheduledDate);
      return isSameDay(contentDate, day);
    });
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-calendar-title">Content Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan and schedule your video releases
          </p>
        </div>
        {selectedProjectId && (
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-schedule-content">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Content
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Content</DialogTitle>
                <DialogDescription>
                  Add content to your calendar. Click on a date first to select when to publish.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="content-title">Title</Label>
                  <Input
                    id="content-title"
                    placeholder="Video title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    data-testid="input-scheduled-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-description">Description (optional)</Label>
                  <Textarea
                    id="content-description"
                    placeholder="Brief description of the content"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="resize-none"
                    data-testid="input-scheduled-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={formPlatform} onValueChange={setFormPlatform}>
                      <SelectTrigger data-testid="select-platform">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace("_", " ").charAt(0).toUpperCase() + s.replace("_", " ").slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Selected Date</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedDate ? format(selectedDate, "PPP") : "Click a date on the calendar"}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={!selectedDate || !formTitle.trim() || createMutation.isPending}
                  data-testid="button-create-scheduled"
                >
                  {createMutation.isPending ? "Scheduling..." : "Schedule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedProjectId ? (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No Project Selected</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a project from the sidebar to view and manage its content calendar.
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex-1 flex gap-6">
          {/* Calendar Grid */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    data-testid="button-prev-month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {paddingDays.map((_, i) => (
                  <div key={`pad-${i}`} className="h-24" />
                ))}
                {days.map((day) => {
                  const dayContent = getContentForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        h-24 p-1 border rounded-md cursor-pointer transition-colors
                        ${isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-muted-foreground/30"}
                        ${isToday ? "bg-accent/50" : ""}
                      `}
                      onClick={() => setSelectedDate(day)}
                      data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                    >
                      <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayContent.slice(0, 2).map((content) => (
                          <div
                            key={content.id}
                            className="text-[10px] px-1 py-0.5 rounded truncate bg-primary/10"
                            title={content.title}
                          >
                            {content.title}
                          </div>
                        ))}
                        {dayContent.length > 2 && (
                          <div className="text-[10px] text-muted-foreground">
                            +{dayContent.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Panel */}
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a Date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {getContentForDay(selectedDate).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No content scheduled for this day.
                      </p>
                    ) : (
                      getContentForDay(selectedDate).map((content) => (
                        <Card key={content.id} className="p-3" data-testid={`scheduled-content-${content.id}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Video className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium text-sm truncate">{content.title}</span>
                              </div>
                              {content.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {content.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">
                                  {content.platform}
                                </Badge>
                                <Badge className={`text-[10px] ${statusColors[content.status]}`}>
                                  {content.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => openEditDialog(content)}
                                data-testid={`button-edit-scheduled-${content.id}`}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => deleteMutation.mutate(content.id)}
                                data-testid={`button-delete-scheduled-${content.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click on a date to view scheduled content.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingContent} onOpenChange={(open) => !open && setEditingContent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scheduled Content</DialogTitle>
            <DialogDescription>
              Update the details of your scheduled content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                data-testid="input-edit-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="resize-none"
                data-testid="input-edit-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={formPlatform} onValueChange={setFormPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ").charAt(0).toUpperCase() + s.replace("_", " ").slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContent(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={!formTitle.trim() || updateMutation.isPending}
              data-testid="button-update-scheduled"
            >
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
