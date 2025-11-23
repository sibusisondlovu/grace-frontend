import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, MapPin, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeeting } from "@/hooks/useMeetings";
import { MeetingActions } from "@/components/meetings/MeetingActions";
import { MinutesEditor } from "@/components/meetings/MinutesEditor";
import { AttendanceTracker } from "@/components/meetings/AttendanceTracker";
import { MeetingReports } from "@/components/meetings/MeetingReports";
import { EditMeetingDialog } from "@/components/meetings/EditMeetingDialog";
import { MeetingPackCompilation } from "@/components/meetings/MeetingPackCompilation";
import { SessionManagement } from "@/components/meetings/SessionManagement";
import { DecisionsTracking } from "@/components/meetings/DecisionsTracking";
import { MinutesApprovalWorkflow } from "@/components/meetings/MinutesApprovalWorkflow";
import { format } from "date-fns";

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: meeting, isLoading } = useMeeting(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Meeting Not Found</h2>
        <Button onClick={() => navigate('/meetings')}>
          Back to Meetings
        </Button>
      </div>
    );
  }

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
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <p className="text-muted-foreground mt-1">
              {meeting.committee?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(meeting.status)}>
            {meeting.status.replace('_', ' ')}
          </Badge>
          <EditMeetingDialog meeting={meeting} />
        </div>
      </div>

      {/* Meeting Info Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Date & Time</div>
              <div className="font-medium">{format(new Date(meeting.meeting_date), 'PPP p')}</div>
            </div>
          </div>
          {meeting.venue && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Venue</div>
                <div className="font-medium">{meeting.venue}</div>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            {meeting.meeting_type === 'virtual' ? (
              <Video className="h-5 w-5 text-primary" />
            ) : (
              <Users className="h-5 w-5 text-primary" />
            )}
            <div>
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="font-medium">{meeting.meeting_type}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Access</div>
              <div className="font-medium">{meeting.public_meeting ? 'Public' : 'Private'}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <MeetingActions meeting={meeting} />
        </div>
      </Card>

      {/* Tabs for different aspects */}
      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <MeetingPackCompilation meetingId={meeting.id} />
            <SessionManagement meetingId={meeting.id} />
          </div>
        </TabsContent>

        <TabsContent value="minutes" className="space-y-4">
          <MinutesEditor meeting={meeting} />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceTracker meeting={meeting} />
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <DecisionsTracking meetingId={meeting.id} />
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <MinutesApprovalWorkflow meetingId={meeting.id} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <MeetingReports meeting={meeting} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
