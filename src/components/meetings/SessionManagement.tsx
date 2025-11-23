import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Users, Clock } from "lucide-react";
import { useMeetingSession, useCreateMeetingSession, useUpdateMeetingSession } from "@/hooks/useMeetingSessions";
import { useCanManageSessions } from "@/hooks/useUserRole";
import { format } from "date-fns";
import { VoiceTranscription } from "./VoiceTranscription";
import { LiveMeetingDashboard } from "./LiveMeetingDashboard";
import { supabase } from "@/integrations/supabase/client";

interface SessionManagementProps {
  meetingId: string;
}

export const SessionManagement = ({ meetingId }: SessionManagementProps) => {
  const { hasRole: canManage } = useCanManageSessions();
  const { data: session, refetch } = useMeetingSession(meetingId);
  const createSession = useCreateMeetingSession();
  const updateSession = useUpdateMeetingSession();
  const [transcriptions, setTranscriptions] = useState<string[]>([]);

  // Real-time subscription for session updates
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_sessions',
          filter: `id=eq.${session.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, refetch]);

  const handleStartSession = () => {
    createSession.mutate({
      meeting_id: meetingId,
      session_start: new Date().toISOString(),
      declarations: [],
      speakers_queue: [],
      voting_config: {},
    });
  };

  const handleEndSession = () => {
    if (session) {
      updateSession.mutate({
        id: session.id,
        session_end: new Date().toISOString(),
      });
    }
  };

  const isSessionActive = session && session.session_start && !session.session_end;

  const handleTranscriptionComplete = (text: string, speaker?: string) => {
    const entry = speaker ? `${speaker}: ${text}` : text;
    setTranscriptions(prev => [...prev, entry]);
    
    // Extract action items from transcription
    if (session) {
      supabase.functions.invoke('extract-action-items', {
        body: { 
          transcription: text,
          meetingId,
          speaker 
        }
      }).catch(console.error);
    }
  };

  return (
    <div className="space-y-4">
      {isSessionActive && <LiveMeetingDashboard meetingId={meetingId} />}
      
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!session ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Session not started</p>
              {canManage && (
                <Button onClick={handleStartSession} disabled={createSession.isPending}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={isSessionActive ? "default" : "secondary"}>
                    {isSessionActive ? 'Active' : 'Ended'}
                  </Badge>
                  {session.session_start && (
                    <span className="text-sm text-muted-foreground">
                      Started: {format(new Date(session.session_start), 'PPp')}
                    </span>
                  )}
                </div>
                {isSessionActive && canManage && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleEndSession}
                    disabled={updateSession.isPending}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                )}
              </div>

              {session.session_end && (
                <p className="text-sm text-muted-foreground">
                  Ended: {format(new Date(session.session_end), 'PPp')}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Declarations</span>
                  </div>
                  <p className="text-2xl font-bold">{session.declarations?.length || 0}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Speakers Queue</span>
                  </div>
                  <p className="text-2xl font-bold">{session.speakers_queue?.length || 0}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>

      {isSessionActive && session && (
        <VoiceTranscription 
          meetingId={meetingId}
          sessionId={session.id}
          onTranscriptionComplete={handleTranscriptionComplete}
        />
      )}
    </div>
  );
};
