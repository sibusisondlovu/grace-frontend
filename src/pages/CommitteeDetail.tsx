import { useParams, Link } from "react-router-dom";
import { useCommittees } from "@/hooks/useCommittees";
import { useMeetings, useCreateMeeting } from "@/hooks/useMeetings";
import { useActions, useCreateAction } from "@/hooks/useActions";
import { Building2, Calendar, Users, CheckSquare, ArrowLeft, MapPin, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";

export default function CommitteeDetail() {
  const { id } = useParams();
  const { data: committees, isLoading: committeesLoading } = useCommittees();
  const createMeeting = useCreateMeeting();
  const createAction = useCreateAction();
  
  // State for dialog management
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  
  // Only fetch meetings and actions if we have a valid committee ID
  const committee = committees?.find(c => c.id === id);
  const { data: meetings, isLoading: meetingsLoading } = useMeetings(committee ? id : undefined);
  const { data: actions, isLoading: actionsLoading } = useActions();

  const committeeActions = actions?.filter(action => action.committee_id === id);

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const meetingData = {
      committee_id: id as string,
      organization_id: committee?.organization_id || '',
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
        setIsMeetingDialogOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  const handleCreateAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const actionData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      committee_id: id as string,
      priority: formData.get("priority") as string,
      due_date: formData.get("due_date") ? new Date(formData.get("due_date") as string).toISOString().split('T')[0] : undefined,
      assigned_to_department: formData.get("assigned_to_department") as string || undefined,
      status: "pending" as const,
    };

    createAction.mutate(actionData, {
      onSuccess: () => {
        setIsActionDialogOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  if (committeesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Committee Not Found</h2>
        <p className="text-muted-foreground mb-4">The committee you're looking for doesn't exist.</p>
        <Link to="/committees">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Committees
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/committees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Committees
          </Button>
        </Link>
      </div>

      {/* Committee Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">{committee.name}</h1>
                <Badge className={getStatusColor(committee.status)}>
                  {committee.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{committee.type}</p>
            </div>
            <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Meeting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateMeeting} className="space-y-4">
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
                    <Button type="button" variant="outline" onClick={() => setIsMeetingDialogOpen(false)}>
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
        </CardHeader>
        <CardContent>
          {committee.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{committee.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Members</h3>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{committee.member_count || 0}</span>
                <span className="text-muted-foreground">active members</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Next Meeting</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {committee.next_meeting ? (
                  <span className="text-sm">{format(new Date(committee.next_meeting), 'PPP')}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Not scheduled</span>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Active Actions</h3>
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {committeeActions?.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length || 0}
                </span>
                <span className="text-muted-foreground">pending</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="meetings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Committee Meetings</h2>
            <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Meeting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateMeeting} className="space-y-4">
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
                    <Button type="button" variant="outline" onClick={() => setIsMeetingDialogOpen(false)}>
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
              <Card key={meeting.id} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">{meeting.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                        <Badge variant="outline">{meeting.status}</Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedMeeting(meeting)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No meetings scheduled</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Action Items</h2>
            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Action
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Action Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input name="title" placeholder="Enter action item title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" placeholder="Detailed description of the action item" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input name="due_date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assigned_to_department">Assigned Department</Label>
                    <Input name="assigned_to_department" placeholder="Department responsible for this action" />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createAction.isPending}>
                      {createAction.isPending ? "Creating..." : "Create Action"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {actionsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </Card>
            ))
          ) : committeeActions?.length ? (
            committeeActions.map((action) => (
              <Card key={action.id} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">{action.title}</h3>
                      {action.description && (
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                      )}
                      <div className="flex space-x-2">
                        <Badge variant="outline">{action.status}</Badge>
                        <Badge variant="outline">{action.priority} priority</Badge>
                        {action.due_date && (
                          <Badge variant="outline">
                            Due: {format(new Date(action.due_date), 'PP')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedAction(action)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No action items found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Committee Members</h2>
            <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Committee Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Member Email</Label>
                    <Input name="email" type="email" placeholder="member@joburg.org.za" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue="member">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chair">Chairperson</SelectItem>
                        <SelectItem value="deputy_chair">Deputy Chair</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voting_rights">Voting Rights</Label>
                    <Select name="voting_rights" defaultValue="true">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Voting Member</SelectItem>
                        <SelectItem value="false">Non-voting Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Member
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Member management coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Date & Time</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(selectedMeeting.meeting_date), 'PPP p')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge variant="outline">{selectedMeeting.status}</Badge>
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
              <div className="flex space-x-2">
                {selectedMeeting.agenda_published && (
                  <Badge variant="outline">Agenda Published</Badge>
                )}
                {selectedMeeting.minutes_published && (
                  <Badge variant="outline">Minutes Published</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Details Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Action Item Details</DialogTitle>
          </DialogHeader>
          {selectedAction && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Title</h3>
                <p className="text-muted-foreground">{selectedAction.title}</p>
              </div>
              {selectedAction.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedAction.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge variant="outline">{selectedAction.status}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Priority</h3>
                  <Badge variant="outline">{selectedAction.priority} priority</Badge>
                </div>
              </div>
              {selectedAction.due_date && (
                <div>
                  <h3 className="font-semibold mb-2">Due Date</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(selectedAction.due_date), 'PPP')}
                  </p>
                </div>
              )}
              {selectedAction.assigned_to_department && (
                <div>
                  <h3 className="font-semibold mb-2">Assigned Department</h3>
                  <p className="text-muted-foreground">{selectedAction.assigned_to_department}</p>
                </div>
              )}
              {selectedAction.assignee && (
                <div>
                  <h3 className="font-semibold mb-2">Assigned To</h3>
                  <p className="text-muted-foreground">{selectedAction.assignee}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Created</h3>
                <p className="text-muted-foreground">
                  {format(new Date(selectedAction.created_at), 'PPP')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}