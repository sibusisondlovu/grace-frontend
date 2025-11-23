import { useAgendaItems, useMeetingsWithAgendas, useCreateAgendaItem, useUpdateAgendaItem, useDeleteAgendaItem, useReorderAgendaItems, usePublishAgenda, type AgendaItem } from "@/hooks/useAgendas";
import { PublishButtons } from "@/components/meetings/PublishButtons";
import { useCommittees } from "@/hooks/useCommittees";
import { useProfiles } from "@/hooks/useMembers";

// Helper function to generate formatted agenda content for PDF export
const generateAgendaContent = (agendaItems: AgendaItem[]): string => {
  let content = '<div>';
  
  agendaItems.forEach((item) => {
    content += `
      <div style="margin-bottom: 20px;">
        <h3>${item.item_number}. ${item.title}</h3>
        ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
        <p><strong>Type:</strong> ${item.item_type}</p>
        <p><strong>Classification:</strong> ${item.classification}</p>
        ${item.sponsor ? `<p><strong>Sponsor:</strong> ${item.sponsor.first_name} ${item.sponsor.last_name}</p>` : ''}
        ${item.estimated_duration ? `<p><strong>Estimated Duration:</strong> ${item.estimated_duration} minutes</p>` : ''}
        ${item.requires_vote ? '<p><strong>Requires Vote:</strong> Yes</p>' : ''}
        ${item.late_item ? '<p><em>Late Item</em></p>' : ''}
      </div>
    `;
  });
  
  content += '</div>';
  return content;
};
import { FileText, Plus, Search, Filter, Clock, User, Eye, Edit, Trash2, ChevronUp, ChevronDown, GripVertical, Calendar, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function Agendas() {
  const { data: agendaItems, isLoading: agendaLoading } = useAgendaItems();
  const { data: meetings, isLoading: meetingsLoading } = useMeetingsWithAgendas();
  const { data: committees } = useCommittees();
  const { data: profiles } = useProfiles();
  const createAgendaItem = useCreateAgendaItem();
  const updateAgendaItem = useUpdateAgendaItem();
  const deleteAgendaItem = useDeleteAgendaItem();
  const reorderAgendaItems = useReorderAgendaItems();
  const publishAgenda = usePublishAgenda();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [meetingFilter, setMeetingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const filteredItems = agendaItems?.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.item_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMeeting = meetingFilter === "all" || item.meeting_id === meetingFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesMeeting && matchesStatus;
  });

  const upcomingMeetings = meetings?.filter(m => 
    new Date(m.meeting_date) > new Date() && m.status === 'scheduled'
  ) || [];

  const publishedAgendas = meetings?.filter(m => m.agenda_published).length || 0;
  const totalAgendaItems = agendaItems?.length || 0;
  const pendingApproval = agendaItems?.filter(item => item.status === 'draft').length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'report': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'motion': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'presentation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'discussion': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleCreateItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      meeting_id: formData.get("meeting_id") as string,
      sponsor_id: formData.get("sponsor_id") as string || undefined,
      item_number: formData.get("item_number") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      item_type: formData.get("item_type") as string,
      classification: formData.get("classification") as string,
      status: "draft" as const,
      late_item: formData.get("late_item") === "true",
      requires_vote: formData.get("requires_vote") === "true",
      estimated_duration: parseInt(formData.get("estimated_duration") as string) || undefined,
      order_index: (agendaItems?.filter(item => item.meeting_id === formData.get("meeting_id")).length || 0) + 1,
    };

    createAgendaItem.mutate(itemData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  const handleUpdateItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;

    const formData = new FormData(e.currentTarget);
    
    const updates = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      item_type: formData.get("item_type") as string,
      classification: formData.get("classification") as string,
      status: formData.get("status") as string,
      late_item: formData.get("late_item") === "true",
      requires_vote: formData.get("requires_vote") === "true",
      estimated_duration: parseInt(formData.get("estimated_duration") as string) || undefined,
    };

    updateAgendaItem.mutate({ id: selectedItem.id, ...updates }, {
      onSuccess: () => {
        setSelectedItem(null);
      }
    });
  };

  const handleReorder = (itemId: string, direction: 'up' | 'down') => {
    if (!agendaItems) return;
    
    const items = [...agendaItems].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    const currentIndex = items.findIndex(item => item.id === itemId);
    
    if (
      (direction === 'up' && currentIndex <= 0) ||
      (direction === 'down' && currentIndex >= items.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [items[currentIndex], items[newIndex]] = [items[newIndex], items[currentIndex]];
    
    const reorderedItems = items.map((item, index) => ({
      id: item.id,
      order_index: index + 1
    }));

    reorderAgendaItems.mutate(reorderedItems);
  };

  const handlePublishToggle = (meetingId: string, published: boolean) => {
    publishAgenda.mutate({ meetingId, published: !published });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Agendas</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage meeting agendas and agenda items
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Agenda Item</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-background border z-50">
            <DialogHeader>
              <DialogTitle>Add Agenda Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting_id">Meeting</Label>
                <Select name="meeting_id" required>
                  <SelectTrigger className="bg-background border z-40">
                    <SelectValue placeholder="Select a meeting" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {meetings?.map((meeting) => (
                      <SelectItem key={meeting.id} value={meeting.id}>
                        {meeting.title} - {format(new Date(meeting.meeting_date), 'PP')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_number">Item Number</Label>
                  <Input name="item_number" placeholder="e.g., 1.1, 2.3" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsor_id">Sponsor (Optional)</Label>
                  <Select name="sponsor_id">
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue placeholder="Select sponsor" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.first_name} {profile.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input name="title" placeholder="Agenda item title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" placeholder="Detailed description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_type">Type</Label>
                  <Select name="item_type" defaultValue="report">
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="motion">Motion</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classification">Classification</Label>
                  <Select name="classification" defaultValue="open">
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Duration (minutes)</Label>
                  <Input name="estimated_duration" type="number" min="1" placeholder="30" />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input type="checkbox" name="late_item" value="true" className="rounded" />
                  <Label htmlFor="late_item" className="text-sm">Late Item</Label>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input type="checkbox" name="requires_vote" value="true" className="rounded" />
                  <Label htmlFor="requires_vote" className="text-sm">Requires Vote</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAgendaItem.isPending}>
                  {createAgendaItem.isPending ? "Adding..." : "Add Item"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search agenda items..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={meetingFilter} onValueChange={setMeetingFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background border z-30">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Meeting" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-40">
                <SelectItem value="all">All Meetings</SelectItem>
                {meetings?.map((meeting) => (
                  <SelectItem key={meeting.id} value={meeting.id}>
                    {meeting.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32 bg-background border z-30">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-40">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agendaLoading ? <Skeleton className="h-8 w-12" /> : totalAgendaItems}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Published Agendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {meetingsLoading ? <Skeleton className="h-8 w-12" /> : publishedAgendas}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {agendaLoading ? <Skeleton className="h-8 w-12" /> : pendingApproval}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {meetingsLoading ? <Skeleton className="h-8 w-12" /> : upcomingMeetings.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Agenda Items</TabsTrigger>
          <TabsTrigger value="meetings">Meeting Agendas</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {agendaLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-4 mb-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-full" />
              </Card>
            ))
          ) : filteredItems?.length ? (
            filteredItems.map((item) => (
              <Card key={item.id} className="shadow-card hover:shadow-primary transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {item.item_number}
                        </span>
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge className={getTypeColor(item.item_type)}>
                          {item.item_type}
                        </Badge>
                        {item.late_item && (
                          <Badge variant="destructive" className="text-xs">Late</Badge>
                        )}
                        {item.requires_vote && (
                          <Badge variant="outline" className="text-xs">Vote Required</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-muted-foreground mb-3 text-sm">
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{item.meeting?.title}</span>
                        </div>
                        {item.sponsor && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{item.sponsor.first_name} {item.sponsor.last_name}</span>
                          </div>
                        )}
                        {item.estimated_duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.estimated_duration}min</span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.classification}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(item.id, 'up')}
                        disabled={reorderAgendaItems.isPending}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(item.id, 'down')}
                        disabled={reorderAgendaItems.isPending}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Agenda Item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{item.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAgendaItem.mutate(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Item
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground mb-4">No agenda items found</div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Agenda Item
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          {meetingsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </Card>
            ))
          ) : meetings?.length ? (
            meetings.map((meeting) => (
              <Card key={meeting.id} className="shadow-card hover:shadow-primary transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{meeting.title}</h3>
                        <Badge className={meeting.agenda_published ? 
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }>
                          {meeting.agenda_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline">
                          {meeting.agenda_count} items
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(meeting.meeting_date), 'PPP p')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{meeting.committee?.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={meeting.agenda_count > 0 ? 100 : 0} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {meeting.agenda_count} agenda items
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMeeting(meeting)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Agenda
                      </Button>
                      <PublishButtons
                        type="agenda"
                        id={meeting.id}
                        meetingId={meeting.id}
                        published={meeting.agenda_published}
                        showBadge={false}
                        documentTitle={`Agenda - ${meeting.title}`}
                        documentContent={meeting.agenda_items ? generateAgendaContent(meeting.agenda_items) : ''}
                        documentType="agenda"
                        meetingTitle={meeting.title}
                        committee={meeting.committee?.name || 'Committee'}
                        meetingDate={meeting.meeting_date}
                        useProfessionalTemplate={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">No meetings found</div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Item Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[600px] bg-background border z-50">
          <DialogHeader>
            <DialogTitle>Edit Agenda Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input name="title" defaultValue={selectedItem.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" defaultValue={selectedItem.description || ""} rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_type">Type</Label>
                  <Select name="item_type" defaultValue={selectedItem.item_type}>
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="motion">Motion</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classification">Classification</Label>
                  <Select name="classification" defaultValue={selectedItem.classification}>
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedItem.status}>
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Duration (minutes)</Label>
                  <Input 
                    name="estimated_duration" 
                    type="number" 
                    min="1" 
                    defaultValue={selectedItem.estimated_duration || ""} 
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input 
                    type="checkbox" 
                    name="late_item" 
                    value="true" 
                    defaultChecked={selectedItem.late_item}
                    className="rounded" 
                  />
                  <Label htmlFor="late_item" className="text-sm">Late Item</Label>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input 
                    type="checkbox" 
                    name="requires_vote" 
                    value="true" 
                    defaultChecked={selectedItem.requires_vote}
                    className="rounded" 
                  />
                  <Label htmlFor="requires_vote" className="text-sm">Requires Vote</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAgendaItem.isPending}>
                  {updateAgendaItem.isPending ? "Updating..." : "Update Item"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Meeting Agenda Dialog */}
      <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
        <DialogContent className="sm:max-w-[800px] bg-background border z-50">
          <DialogHeader>
            <DialogTitle>Meeting Agenda</DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="font-semibold mb-2">{selectedMeeting.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{format(new Date(selectedMeeting.meeting_date), 'PPP p')}</span>
                  <span>{selectedMeeting.committee?.name}</span>
                  <Badge className={selectedMeeting.agenda_published ? 
                    'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {selectedMeeting.agenda_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Agenda Items ({selectedMeeting.agenda_count})</h4>
                {agendaItems?.filter(item => item.meeting_id === selectedMeeting.id).length ? (
                  <div className="space-y-3">
                    {agendaItems
                      .filter(item => item.meeting_id === selectedMeeting.id)
                      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                      .map((item) => (
                        <div key={item.id} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                  {item.item_number}
                                </span>
                                <h5 className="font-medium">{item.title}</h5>
                                <Badge className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                                <Badge className={getTypeColor(item.item_type)}>
                                  {item.item_type}
                                </Badge>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                {item.estimated_duration && (
                                  <span>{item.estimated_duration}min</span>
                                )}
                                {item.sponsor && (
                                  <span>Sponsor: {item.sponsor.first_name} {item.sponsor.last_name}</span>
                                )}
                                {item.requires_vote && (
                                  <Badge variant="outline" className="text-xs">Vote Required</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No agenda items added yet
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}