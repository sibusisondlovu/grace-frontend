import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTeamsNotification } from '@/hooks/useTeamsNotification';

export const usePublishDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, published }: { documentId: string; published: boolean }) => {
    const { data, error } = await supabase
      .from('meeting_documents')
      .update({ published })
      .eq('id', documentId)
      .select()
      .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { published }) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-documents'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "Success",
        description: `Document ${published ? 'published' : 'unpublished'} successfully!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update document status",
        variant: "destructive",
      });
    },
  });
};

export const usePublishMinutes = () => {
  const queryClient = useQueryClient();
  const { sendNotification } = useTeamsNotification();

  return useMutation({
    mutationFn: async ({ meetingId, published }: { meetingId: string; published: boolean }) => {
      const { data, error } = await supabase
        .from('meetings')
        .update({ minutes_published: published })
        .eq('id', meetingId)
        .select(`
          *,
          committees(name)
        `)
        .maybeSingle();

      if (error) throw error;
      
      // Send Teams notification when minutes are published
      if (data && published && data.organization_id) {
        await sendNotification({
          organizationId: data.organization_id,
          title: "📝 Meeting Minutes Published",
          message: `**${data.title}**\n\nThe minutes for this meeting have been published and are now available.\n\nMeeting Date: ${new Date(data.meeting_date).toLocaleString()}\nCommittee: ${(data as any).committees?.name || 'N/A'}`,
          notificationType: "minutes_published",
          themeColor: "28A745",
          metadata: {
            "Meeting Type": data.meeting_type,
            "Status": data.status,
            "Published": new Date().toLocaleString(),
          },
        });
      }
      
      return data;
    },
    onSuccess: (_, { published }) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "Success",
        description: `Minutes ${published ? 'published' : 'unpublished'} successfully!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update minutes status",
        variant: "destructive",
      });
    },
  });
};