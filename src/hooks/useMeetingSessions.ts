import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MeetingSession {
  id: string;
  meeting_id: string;
  session_start?: string;
  session_end?: string;
  declarations: any[];
  speakers_queue: any[];
  voting_config: any;
  created_at: string;
  updated_at: string;
}

export const useMeetingSession = (meetingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meeting-session', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_sessions')
        .select('*')
        .eq('meeting_id', meetingId)
        .maybeSingle();

      if (error) throw error;
      return data as MeetingSession | null;
    },
    enabled: !!user && !!meetingId,
  });
};

export const useCreateMeetingSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: Omit<MeetingSession, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meeting_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-session'] });
      toast.success('Session started successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to start session: ${error.message}`);
    },
  });
};

export const useUpdateMeetingSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MeetingSession> & { id: string }) => {
      const { data, error } = await supabase
        .from('meeting_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-session'] });
      toast.success('Session updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update session: ${error.message}`);
    },
  });
};
