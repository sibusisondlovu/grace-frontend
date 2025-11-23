import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTeamsNotification } from '@/hooks/useTeamsNotification';

interface MinutesApproval {
  id: string;
  meeting_id: string;
  document_id?: string;
  approval_stage: string;
  submitted_by?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
  comments?: string;
  publication_scope: string;
  created_at: string;
  updated_at: string;
}

export const useMinutesApproval = (meetingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['minutes-approval', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minutes_approval')
        .select('*')
        .eq('meeting_id', meetingId)
        .maybeSingle();

      if (error) throw error;
      return data as MinutesApproval | null;
    },
    enabled: !!user && !!meetingId,
  });
};

export const useCreateMinutesApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (approval: Omit<MinutesApproval, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('minutes_approval')
        .insert(approval)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minutes-approval'] });
      toast.success('Approval workflow initiated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to initiate approval: ${error.message}`);
    },
  });
};

export const useUpdateMinutesApproval = () => {
  const queryClient = useQueryClient();
  const { sendNotification } = useTeamsNotification();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MinutesApproval> & { id: string }) => {
      const { data, error } = await supabase
        .from('minutes_approval')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Send Teams notification when minutes are approved
      if (data && data.approval_stage === 'approved' && data.approved_at) {
        // Fetch meeting details for the notification
        const { data: meeting } = await supabase
          .from('meetings')
          .select(`
            title,
            meeting_date,
            organization_id,
            committees(name)
          `)
          .eq('id', data.meeting_id)
          .single();

        if (meeting && meeting.organization_id) {
          await sendNotification({
            organizationId: meeting.organization_id,
            title: "✅ Meeting Minutes Approved",
            message: `**${meeting.title}**\n\nThe minutes have been reviewed and approved.\n\nMeeting Date: ${new Date(meeting.meeting_date).toLocaleString()}\nCommittee: ${(meeting as any).committees?.name || 'N/A'}\nPublication Scope: ${data.publication_scope}`,
            notificationType: "minutes_approved",
            themeColor: "0078D4",
            metadata: {
              "Approval Stage": data.approval_stage,
              "Approved At": new Date(data.approved_at).toLocaleString(),
              "Publication Scope": data.publication_scope,
            },
          });
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minutes-approval'] });
      toast.success('Approval status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update approval: ${error.message}`);
    },
  });
};
