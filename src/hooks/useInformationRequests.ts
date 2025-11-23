import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export interface InformationRequest {
  id: string;
  request_number: string;
  request_type: string;
  subject: string;
  request_details: string;
  addressed_to: string;
  addressed_to_dept?: string;
  issue_date: string;
  deadline_date: string;
  response_received_date?: string;
  compliance_status: string;
  response_summary?: string;
  escalation_notes?: string;
  committee_id: string;
  issued_by_id: string;
  linked_meeting_id?: string;
  created_at: string;
  updated_at: string;
  committee?: { name: string };
}

export const useInformationRequests = (committeeId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['information-requests', committeeId],
    queryFn: async () => {
      let query = supabase
        .from('information_requests')
        .select(`
          *,
          committee:committees(name)
        `)
        .order('issue_date', { ascending: false });

      if (committeeId) {
        query = query.eq('committee_id', committeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateInformationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: any) => {
      const { data, error } = await supabase
        .from('information_requests')
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['information-requests'] });
      toast.success('Information request created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create request: ${error.message}`);
    },
  });
};

export const useUpdateInformationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InformationRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('information_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['information-requests'] });
      toast.success('Request updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });
};
