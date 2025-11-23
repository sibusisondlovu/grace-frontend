import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WardSubmission {
  id: string;
  submission_number: string;
  submission_type: string;
  ward_number: string;
  topic: string;
  description: string;
  submitter_details?: string;
  date_submitted: string;
  status: string;
  linked_committee_id?: string;
  linked_agenda_item_id?: string;
  feedback_text?: string;
  feedback_date?: string;
  created_at: string;
  updated_at: string;
  committee?: { name: string };
}

export const useWardSubmissions = (committeeId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ward-submissions', committeeId],
    queryFn: async () => {
      let query = supabase
        .from('ward_submissions')
        .select(`
          *,
          committee:committees(name)
        `)
        .order('date_submitted', { ascending: false });

      if (committeeId) {
        query = query.eq('linked_committee_id', committeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateWardSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: any) => {
      const { data, error } = await supabase
        .from('ward_submissions')
        .insert([submission])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ward-submissions'] });
      toast.success('Ward submission created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create ward submission: ${error.message}`);
    },
  });
};

export const useUpdateWardSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WardSubmission> & { id: string }) => {
      const { data, error } = await supabase
        .from('ward_submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ward-submissions'] });
      toast.success('Ward submission updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ward submission: ${error.message}`);
    },
  });
};
