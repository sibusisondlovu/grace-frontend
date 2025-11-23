import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PaiaRequest {
  id: string;
  request_number: string;
  requester_name: string;
  requester_contact: string;
  requester_address?: string;
  record_description: string;
  form_of_access: string;
  status: string;
  decision?: string;
  date_received: string;
  statutory_deadline: string;
  extension_granted: boolean;
  extended_deadline?: string;
  decision_date?: string;
  refusal_grounds?: string;
  fees_prescribed?: number;
  fees_paid: boolean;
  release_package_ref?: string;
  appeal_lodged: boolean;
  appeal_notes?: string;
  created_at: string;
  updated_at: string;
}

export const usePaiaRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['paia-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paia_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreatePaiaRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: any) => {
      const { data, error } = await supabase
        .from('paia_requests')
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paia-requests'] });
      toast.success('PAIA request created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create PAIA request: ${error.message}`);
    },
  });
};

export const useUpdatePaiaRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaiaRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('paia_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paia-requests'] });
      toast.success('PAIA request updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update PAIA request: ${error.message}`);
    },
  });
};
