import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useTeamsNotification } from '@/hooks/useTeamsNotification';

const sendEmailNotification = async (params: {
  organizationId: string;
  recipientId?: string;
  recipientEmail?: string;
  subject: string;
  title: string;
  message: string;
  notificationType: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.functions.invoke('send-notification-email', {
      body: params,
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
};

export interface Meeting {
  id: string;
  committee_id: string;
  organization_id: string;
  title: string;
  meeting_date: string;
  venue?: string;
  meeting_type: string;
  livestream_url?: string;
  recording_url?: string;
  status: string;
  agenda_published: boolean;
  minutes_published: boolean;
  public_meeting: boolean;
  quorum_achieved?: boolean;
  created_at: string;
  updated_at: string;
  committee?: {
    name: string;
    type: string;
  };
}

export const useMeetings = (committeeId?: string) => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();
  
  return useQuery({
    queryKey: ['meetings', committeeId, selectedOrganizationId],
    queryFn: async () => {
      let query = supabase
        .from('meetings')
        .select(`
          *,
          committees(name, type)
        `)
        .order('meeting_date', { ascending: false });

      if (committeeId) {
        query = query.eq('committee_id', committeeId);
      }

      if (selectedOrganizationId) {
        query = query.eq('organization_id', selectedOrganizationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Meetings fetch error:', error);
        throw error;
      }

      return data as Meeting[];
    },
    enabled: !!user, // Run when user is authenticated
    retry: false,
  });
};

export const useUpcomingMeetings = () => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();
  
  return useQuery({
    queryKey: ['meetings', 'upcoming', selectedOrganizationId],
    queryFn: async () => {
      let query = supabase
        .from('meetings')
        .select(`
          *,
          committees(name, type)
        `)
        .gte('meeting_date', new Date().toISOString())
        .eq('status', 'scheduled')
        .order('meeting_date', { ascending: true })
        .limit(10);

      if (selectedOrganizationId) {
        query = query.eq('organization_id', selectedOrganizationId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch upcoming meetings",
          variant: "destructive",
        });
        throw error;
      }

      return data as Meeting[];
    },
    enabled: !!user, // Only run when user is authenticated
    retry: false,
  });
};

export const useMeeting = (meetingId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      if (!meetingId) return null;

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          committees(name, type)
        `)
        .eq('id', meetingId)
        .maybeSingle();

      if (error) {
        console.error('Meeting fetch error:', error);
        throw error;
      }

      return data ? { ...data, committee: data.committees } as Meeting : null;
    },
    enabled: !!user && !!meetingId,
    retry: false,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  const { sendNotification } = useTeamsNotification();

  return useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'committee'>) => {
      const { data, error } = await supabase
        .from('meetings')
        .insert([meeting])
        .select()
        .single();

      if (error) throw error;
      
      // Send Teams notification
      if (data && meeting.organization_id) {
        await sendNotification({
          organizationId: meeting.organization_id,
          title: "📅 New Meeting Scheduled",
          message: `**${meeting.title}**\n\nDate: ${new Date(meeting.meeting_date).toLocaleString()}\n${meeting.venue ? `Venue: ${meeting.venue}` : ''}`,
          notificationType: "meeting_scheduled",
          themeColor: "0078D4",
          metadata: {
            "Meeting Type": meeting.meeting_type,
            "Status": meeting.status,
          },
        });
        
        // Fetch committee members to send email notifications
        if (meeting.committee_id) {
          const { data: members } = await supabase
            .from('committee_members')
            .select('user_id, profiles(email, first_name, last_name)')
            .eq('committee_id', meeting.committee_id)
            .is('end_date', null);
          
          // Send email to each committee member
          if (members) {
            for (const member of members) {
              const profile = (member as any).profiles;
              if (profile?.email) {
                await sendEmailNotification({
                  organizationId: meeting.organization_id,
                  recipientEmail: profile.email,
                  recipientId: member.user_id,
                  subject: "New Meeting Scheduled",
                  title: "📅 New Meeting Scheduled",
                  message: `A new meeting has been scheduled:\n\n${meeting.title}\n\nDate: ${new Date(meeting.meeting_date).toLocaleString()}\n${meeting.venue ? `Venue: ${meeting.venue}` : ''}\n\nPlease mark your calendar and prepare accordingly.`,
                  notificationType: "meeting_scheduled",
                  metadata: {
                    "Meeting Type": meeting.meeting_type,
                    "Status": meeting.status,
                    "Date": new Date(meeting.meeting_date).toLocaleString(),
                  },
                });
              }
            }
          }
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "Success",
        description: "Meeting scheduled successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule meeting",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Meeting> & { id: string }) => {
      // Remove computed fields before updating
      const { committee, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('meetings')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting'] });
      toast({
        title: "Success",
        description: "Meeting updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update meeting",
        variant: "destructive",
      });
    },
  });
};