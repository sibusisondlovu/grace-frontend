import { useMeetings, useCreateMeeting } from "@/hooks/useMeetings";
import { useCommittees } from "@/hooks/useCommittees";
import { MeetingActions } from "@/components/meetings/MeetingActions";
import { Calendar, Plus, Search, Filter, MapPin, Users, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Meetings() {
  const { data: meetings, isLoading } = useMeetings();
  const { data: committees } = useCommittees();
  const createMeeting = useCreateMeeting();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const filteredMeetings = meetings?.filter((meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.committee?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedCommittee = committees?.find(c => c.id === formData.get("committee_id"));
    
    const meetingData = {
      committee_id: formData.get("committee_id") as string,
      organization_id: selectedCommittee?.organization_id || '',
      title: formData.get("title") as string,
      meeting_date: new Date(formData.get("meeting_date") as string).toISOString(),
      venue: formData.get("venue") as string || undefined,
      meeting_type: formData.get("meeting_type") as string,
      public_meeting: formData.get("public_meeting") === "true",
      status: "scheduled" as const,
      agenda_published: false,
      minutes_published: false,
    };

    createMeeting.mutate(meetingData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span>Meetings</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage committee meetings
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Schedule Meeting</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="committee_id">Committee</Label>
                <Select name="committee_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a committee" />
                  </SelectTrigger>
                  <SelectContent>
                    {committees?.map((committee) => (
                      <SelectItem key={committee.id} value={committee.id}>
                        {committee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input name="title" placeholder="Enter meeting title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_date">Date & Time</Label>
                <Input name="meeting_date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input name="venue" placeholder="Meeting venue (optional)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_type">Meeting Type</Label>
                <Select name="meeting_type" defaultValue="physical">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="public_meeting">Public Access</Label>
                <Select name="public_meeting" defaultValue="true">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public Meeting</SelectItem>
                    <SelectItem value="false">Private Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMeeting.isPending}>
                  {createMeeting.isPending ? "Scheduling..." : "Schedule Meeting"}
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
                placeholder="Search meetings by title or committee..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : meetings?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? <Skeleton className="h-8 w-12" /> : meetings?.filter(m => m.status === 'scheduled').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 
                meetings?.filter(m => {
                  const meetingDate = new Date(m.meeting_date);
                  const now = new Date();
                  return meetingDate.getMonth() === now.getMonth() && meetingDate.getFullYear() === now.getFullYear();
                }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoading ? <Skeleton className="h-8 w-12" /> : meetings?.filter(m => m.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-3 w-full" />
            </Card>
          ))
        ) : filteredMeetings?.length ? (
          filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="shadow-card hover:shadow-primary transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{meeting.title}</h3>
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{meeting.committee?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(meeting.meeting_date), 'PPP p')}</span>
                      </div>
                      {meeting.venue && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{meeting.venue}</span>
                        </div>
                      )}
                      {meeting.meeting_type === 'virtual' && (
                        <div className="flex items-center space-x-1">
                          <Video className="h-4 w-4" />
                          <span>Virtual</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {meeting.agenda_published && (
                        <Badge variant="outline" className="text-xs">Agenda Published</Badge>
                      )}
                      {meeting.minutes_published && (
                        <Badge variant="outline" className="text-xs">Minutes Published</Badge>
                      )}
                      {meeting.public_meeting && (
                        <Badge variant="outline" className="text-xs">Public</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <MeetingActions meeting={meeting} />
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedMeeting?.(meeting)}
                      >
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : meetings?.length ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No meetings found matching your criteria</div>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">No meetings have been scheduled yet</div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Your First Meeting
            </Button>
          </div>
        )}
      </div>

      {/* Meeting Details Dialog */}
      <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Title</h3>
                <p className="text-muted-foreground">{selectedMeeting.title}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Committee</h3>
                <p className="text-muted-foreground">{selectedMeeting.committee?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Date & Time</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(selectedMeeting.meeting_date), 'PPP p')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge className={getStatusColor(selectedMeeting.status)}>
                    {selectedMeeting.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {selectedMeeting.venue && (
                <div>
                  <h3 className="font-semibold mb-2">Venue</h3>
                  <p className="text-muted-foreground">{selectedMeeting.venue}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Meeting Type</h3>
                  <p className="text-muted-foreground">{selectedMeeting.meeting_type}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Public Access</h3>
                  <p className="text-muted-foreground">
                    {selectedMeeting.public_meeting ? 'Public Meeting' : 'Private Meeting'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMeeting.agenda_published && (
                  <Badge variant="outline">Agenda Published</Badge>
                )}
                {selectedMeeting.minutes_published && (
                  <Badge variant="outline">Minutes Published</Badge>
                )}
                {selectedMeeting.quorum_achieved !== null && (
                  <Badge variant="outline">
                    Quorum {selectedMeeting.quorum_achieved ? 'Achieved' : 'Not Achieved'}
                  </Badge>
                )}
              </div>
              {selectedMeeting.livestream_url && (
                <div>
                  <h3 className="font-semibold mb-2">Livestream URL</h3>
                  <p className="text-muted-foreground break-all">{selectedMeeting.livestream_url}</p>
                </div>
              )}
              {selectedMeeting.recording_url && (
                <div>
                  <h3 className="font-semibold mb-2">Recording URL</h3>
                  <p className="text-muted-foreground break-all">{selectedMeeting.recording_url}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}