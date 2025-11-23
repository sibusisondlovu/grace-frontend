import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export interface Petition {
  id: string;
  petition_number: string;
  petition_type: string;
  subject: string;
  petition_text: string;
  submitter_name: string;
  submitter_contact?: string;
  date_received: string;
  status: string;
  classification: string;
  publication_status: string;
  signatures_count: number;
  routed_to_committee_id?: string;
  routed_to_dept?: string;
  linked_agenda_item_id?: string;
  response_text?: string;
  response_date?: string;
  petitioner_notified_date?: string;
  created_at: string;
  updated_at: string;
  committee?: { name: string };
}

export const usePetitions = () => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();

  return useQuery({
    queryKey: ['petitions', selectedOrganizationId],
    queryFn: async () => {
      let query = supabase
        .from('petitions')
        .select(`
          *,
          committee:committees(name)
        `)
        .order('date_received', { ascending: false });

      if (selectedOrganizationId) {
        query = query.eq('organization_id', selectedOrganizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Petition[];
    },
    enabled: !!user,
  });
};

export const usePublicPetitions = () => {
  return useQuery({
    queryKey: ['public-petitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('petitions')
        .select(`
          *,
          committee:committees(name)
        `)
        .eq('publication_status', 'public')
        .order('date_received', { ascending: false });

      if (error) throw error;
      return data as Petition[];
    },
  });
};

export const useCreatePetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (petition: any) => {
      const { data, error } = await supabase
        .from('petitions')
        .insert([petition])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      toast.success('Petition submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit petition: ${error.message}`);
    },
  });
};

export const useUpdatePetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Petition> & { id: string }) => {
      const { data, error } = await supabase
        .from('petitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      toast.success('Petition updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update petition: ${error.message}`);
    },
  });
};
