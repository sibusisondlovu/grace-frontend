import { FileText, Download, Calendar, Users, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Meeting } from "@/hooks/useMeetings";
import { useMeetingDocuments } from "@/hooks/useMeetingInteractions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ProfessionalExportButton } from "./ProfessionalExportButton";
import { DocumentSection } from "./templates/PdfTemplate";

interface MeetingReportsProps {
  meeting: Meeting;
}

export function MeetingReports({ meeting }: MeetingReportsProps) {
  const { data: documents } = useMeetingDocuments(meeting.id, false);
  
  const { data: attendance } = useQuery({
    queryKey: ['attendance', meeting.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_attendance')
        .select('*')
        .eq('meeting_id', meeting.id);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: actionItems } = useQuery({
    queryKey: ['meeting-actions', meeting.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('meeting_id', meeting.id);
      
      if (error) throw error;
      return data;
    },
  });

  const presentCount = attendance?.filter(a => a.attendance_status === 'present').length || 0;
  const totalMembers = attendance?.length || 0;
  const completedActions = actionItems?.filter(a => a.status === 'completed').length || 0;
  const totalActions = actionItems?.length || 0;

  const generateReportContent = (): string => {
    return `
      <h3>MEETING STATUS</h3>
      <p>Status: ${meeting.status}</p>
      <p>Type: ${meeting.meeting_type}</p>
      <p>Public Meeting: ${meeting.public_meeting ? 'Yes' : 'No'}</p>
      <p>Quorum Achieved: ${meeting.quorum_achieved !== null ? (meeting.quorum_achieved ? 'Yes' : 'No') : 'Not recorded'}</p>
      
      <h3>ATTENDANCE</h3>
      <p>Total Members: ${totalMembers}</p>
      <p>Present: ${presentCount}</p>
      <p>Attendance Rate: ${totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0}%</p>
      
      <h3>DOCUMENTS</h3>
      <p>Agenda Published: ${meeting.agenda_published ? 'Yes' : 'No'}</p>
      <p>Minutes Published: ${meeting.minutes_published ? 'Yes' : 'No'}</p>
      <p>Total Documents: ${documents?.length || 0}</p>
      
      <h3>ACTION ITEMS</h3>
      <p>Total Actions: ${totalActions}</p>
      <p>Completed: ${completedActions}</p>
      <p>Completion Rate: ${totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0}%</p>
    `;
  };

  const reportSections: DocumentSection[] = [
    {
      number: '1',
      title: 'MEETING STATUS',
      content: [
        `Status: ${meeting.status}`,
        `Type: ${meeting.meeting_type}`,
        `Public Meeting: ${meeting.public_meeting ? 'Yes' : 'No'}`,
        `Quorum Achieved: ${meeting.quorum_achieved !== null ? (meeting.quorum_achieved ? 'Yes' : 'No') : 'Not recorded'}`
      ]
    },
    {
      number: '2',
      title: 'ATTENDANCE',
      content: [
        `Total Members: ${totalMembers}`,
        `Present: ${presentCount}`,
        `Attendance Rate: ${totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0}%`
      ]
    },
    {
      number: '3',
      title: 'DOCUMENTS',
      content: [
        `Agenda Published: ${meeting.agenda_published ? 'Yes' : 'No'}`,
        `Minutes Published: ${meeting.minutes_published ? 'Yes' : 'No'}`,
        `Total Documents: ${documents?.length || 0}`
      ]
    },
    {
      number: '4',
      title: 'ACTION ITEMS',
      content: [
        `Total Actions: ${totalActions}`,
        `Completed: ${completedActions}`,
        `Completion Rate: ${totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0}%`
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Meeting Reports & Statistics</span>
          </CardTitle>
          <ProfessionalExportButton
            meetingTitle={`Meeting Report - ${meeting.title}`}
            committee={meeting.committee?.name || 'Committee'}
            meetingDate={meeting.meeting_date}
            documentType="report"
            content={generateReportContent()}
            additionalSections={reportSections}
            variant="default"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Attendance Stats */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Attendance</span>
            </div>
            <div className="text-2xl font-bold">{presentCount}/{totalMembers}</div>
            <div className="text-xs text-muted-foreground">
              {totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0}% present
            </div>
          </div>

          {/* Documents Stats */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Documents</span>
            </div>
            <div className="text-2xl font-bold">{documents?.length || 0}</div>
            <div className="text-xs text-muted-foreground">
              {[meeting.agenda_published, meeting.minutes_published].filter(Boolean).length} published
            </div>
          </div>

          {/* Actions Stats */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Actions</span>
            </div>
            <div className="text-2xl font-bold">{completedActions}/{totalActions}</div>
            <div className="text-xs text-muted-foreground">
              {totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0}% completed
            </div>
          </div>

          {/* Quorum Stats */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {meeting.quorum_achieved ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-medium">Quorum</span>
            </div>
            <div className="text-2xl font-bold">
              {meeting.quorum_achieved !== null ? (meeting.quorum_achieved ? 'Yes' : 'No') : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              {meeting.status === 'completed' ? 'Recorded' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Meeting Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meeting Date:</span>
              <span className="font-medium">{format(new Date(meeting.meeting_date), 'PPP p')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'}>
                {meeting.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{meeting.meeting_type}</span>
            </div>
            {meeting.recording_url && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recording:</span>
                <Button variant="link" size="sm" asChild className="h-auto p-0">
                  <a href={meeting.recording_url} target="_blank" rel="noopener noreferrer">
                    View Recording
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
