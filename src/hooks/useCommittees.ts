import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export interface Committee {
  id: string;
  name: string;
  type: string;
  organization_id: string;
  description?: string;
  terms_of_reference?: string;
  quorum_percentage: number;
  notice_period_days: number;
  chair_id?: string;
  deputy_chair_id?: string;
  status: string;
  public_access_allowed: boolean;
  virtual_meetings_allowed: boolean;
  created_at: string;
  updated_at: string;
  memberCount?: number; // Computed field
  member_count?: number; // Database field
  nextMeeting?: string; // Computed field
  next_meeting?: string; // Database field
  agendaItems?: number; // Computed field
}

export const useCommittees = () => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();
  
  return useQuery({
    queryKey: ['committees', selectedOrganizationId],
    queryFn: async () => {
      let query = supabase
        .from('committees')
        .select(`
          *,
          committee_members(count),
          meetings(
            id,
            meeting_date,
            status
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (selectedOrganizationId) {
        query = query.eq('organization_id', selectedOrganizationId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch committees",
          variant: "destructive",
        });
        throw error;
      }

      // Process the data to add computed fields
      return data.map((committee: any) => ({
        ...committee,
        memberCount: committee.committee_members?.[0]?.count || 0,
        member_count: committee.committee_members?.[0]?.count || 0,
        nextMeeting: committee.meetings?.find((m: any) => 
          new Date(m.meeting_date) > new Date() && m.status === 'scheduled'
        )?.meeting_date,
        next_meeting: committee.meetings?.find((m: any) => 
          new Date(m.meeting_date) > new Date() && m.status === 'scheduled'
        )?.meeting_date,
        agendaItems: Math.floor(Math.random() * 15) + 5, // Placeholder
        agenda_items: Math.floor(Math.random() * 15) + 5, // Placeholder
      })) as Committee[];
    },
    enabled: !!user, // Only run when user is authenticated
    retry: false,
  });
};

export const useCreateCommittee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (committee: Omit<Committee, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('committees')
        .insert([committee])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committees'] });
      toast({
        title: "Success",
        description: "Committee created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create committee",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCommittee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Committee> & { id: string }) => {
      const { data, error } = await supabase
        .from('committees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committees'] });
      toast({
        title: "Success",
        description: "Committee updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update committee",
        variant: "destructive",
      });
    },
  });
};