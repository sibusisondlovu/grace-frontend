import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, MessageSquare, CheckSquare, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMeetingSession } from "@/hooks/useMeetingSessions";

interface LiveMeetingDashboardProps {
  meetingId: string;
}

export const LiveMeetingDashboard = ({ meetingId }: LiveMeetingDashboardProps) => {
  const { data: session } = useMeetingSession(meetingId);
  const [recentTranscriptions, setRecentTranscriptions] = useState<string[]>([]);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);

  // Subscribe to real-time transcription updates
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`meeting-live-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meeting_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload: any) => {
          const speakers = payload.new.speakers_queue || [];
          setRecentTranscriptions(speakers.slice(-5).reverse());
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'action_items',
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload: any) => {
          setRecentActions(prev => [payload.new, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    // Initial load
    if (session.speakers_queue) {
      const speakers = session.speakers_queue as string[];
      setRecentTranscriptions(speakers.slice(-5).reverse());
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, meetingId]);

  // Load attendance count
  useEffect(() => {
    const loadAttendance = async () => {
      const { count } = await supabase
        .from('meeting_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('meeting_id', meetingId)
        .eq('attendance_status', 'present');
      
      setAttendanceCount(count || 0);
    };

    loadAttendance();

    // Subscribe to attendance changes
    const channel = supabase
      .channel(`attendance-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_attendance',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          loadAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  if (!session?.session_start || session.session_end) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Session Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge variant="default" className="animate-pulse">
            Live
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            Started {new Date(session.session_start).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{attendanceCount}</div>
          <p className="text-xs text-muted-foreground">Members present</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transcriptions</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(session.speakers_queue as string[] || []).length}
          </div>
          <p className="text-xs text-muted-foreground">Total segments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Action Items</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentActions.length}</div>
          <p className="text-xs text-muted-foreground">Auto-extracted</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {recentTranscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transcriptions yet</p>
            ) : (
              <div className="space-y-2">
                {recentTranscriptions.map((text, idx) => (
                  <div key={idx} className="text-sm border-l-2 pl-2 py-1">
                    {text}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {recentActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No action items extracted yet</p>
            ) : (
              <div className="space-y-2">
                {recentActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-2 text-sm border rounded p-2">
                    <CheckSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{action.title}</p>
                      {action.assigned_to_department && (
                        <p className="text-xs text-muted-foreground">
                          → {action.assigned_to_department}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {action.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
