import { useMeetings } from "@/hooks/useMeetings";
import { MeetingActions } from "@/components/meetings/MeetingActions";
import { AttendanceRegisterUpload } from "@/components/meetings/AttendanceRegisterUpload";
import { Calendar, Search, Filter, MapPin, Users, Clock, Video, FileText, PlayCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";

export default function PastMeetings() {
  const { data: meetings, isLoading } = useMeetings();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());

  // Filter for past meetings only
  const pastMeetings = meetings?.filter((meeting) => {
    const meetingDate = new Date(meeting.meeting_date);
    const now = new Date();
    return meetingDate < now;
  });

  const filteredMeetings = pastMeetings?.filter((meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.committee?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleMeetingExpansion = (meetingId: string) => {
    setExpandedMeetings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(meetingId)) {
        newSet.delete(meetingId);
      } else {
        newSet.add(meetingId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span>Past Meetings</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            View all completed and past committee meetings
          </p>
        </div>
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
            <CardTitle className="text-sm text-muted-foreground">Total Past</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : pastMeetings?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 
                pastMeetings?.filter(m => m.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">With Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 
                pastMeetings?.filter(m => m.minutes_published).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">With Recordings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 
                pastMeetings?.filter(m => m.recording_url).length || 0}
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
                        <Badge variant="outline" className="text-xs text-success">Minutes Published</Badge>
                      )}
                      {meeting.recording_url && (
                        <Badge variant="outline" className="text-xs text-primary">Recording Available</Badge>
                      )}
                      {meeting.public_meeting && (
                        <Badge variant="outline" className="text-xs">Public</Badge>
                      )}
                      {meeting.quorum_achieved !== null && (
                        <Badge variant="outline" className={`text-xs ${meeting.quorum_achieved ? 'text-success' : 'text-destructive'}`}>
                          Quorum {meeting.quorum_achieved ? 'Achieved' : 'Not Achieved'}
                        </Badge>
                      )}
                    </div>
                  </div>
                   <div className="flex flex-col space-y-2">
                     <MeetingActions meeting={meeting} />
                     <div className="flex space-x-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => window.location.href = `/meeting/${meeting.id}`}
                       >
                         Manage Meeting
                       </Button>
                       {meeting.recording_url && (
                         <Button variant="outline" size="sm" asChild>
                           <a href={meeting.recording_url} target="_blank" rel="noopener noreferrer">
                             <PlayCircle className="h-4 w-4 mr-2" />
                             Recording
                           </a>
                         </Button>
                       )}
                       {meeting.meeting_type === 'physical' && meeting.status === 'completed' && (
                         <Collapsible 
                           open={expandedMeetings.has(meeting.id)} 
                           onOpenChange={() => toggleMeetingExpansion(meeting.id)}
                         >
                           <CollapsibleTrigger asChild>
                             <Button variant="outline" size="sm" className="flex items-center space-x-1">
                               <FileText className="h-4 w-4" />
                               <span>Attendance Register</span>
                               {expandedMeetings.has(meeting.id) ? 
                                 <ChevronUp className="h-4 w-4" /> : 
                                 <ChevronDown className="h-4 w-4" />
                               }
                             </Button>
                           </CollapsibleTrigger>
                         </Collapsible>
                       )}
                     </div>
                   </div>
                 </div>
                 
                 {/* Attendance Register Section for Physical Meetings */}
                 {meeting.meeting_type === 'physical' && meeting.status === 'completed' && (
                   <Collapsible 
                     open={expandedMeetings.has(meeting.id)} 
                     onOpenChange={() => toggleMeetingExpansion(meeting.id)}
                   >
                     <CollapsibleContent className="mt-4 pt-4 border-t">
                       <AttendanceRegisterUpload meeting={meeting} />
                     </CollapsibleContent>
                   </Collapsible>
                 )}
              </CardContent>
            </Card>
          ))
        ) : pastMeetings?.length ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No past meetings found matching your criteria</div>
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
            <div className="text-muted-foreground mb-4">No past meetings found</div>
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
              {selectedMeeting.recording_url && (
                <div>
                  <h3 className="font-semibold mb-2">Recording URL</h3>
                  <p className="text-muted-foreground break-all">{selectedMeeting.recording_url}</p>
                </div>
              )}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}