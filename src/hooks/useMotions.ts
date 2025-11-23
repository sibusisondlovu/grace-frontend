import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Motion {
  id: string;
  motion_number: string;
  motion_type: string;
  title: string;
  motion_text: string;
  status: string;
  admissibility_status: string;
  admissibility_notes?: string;
  notice_date: string;
  scheduled_meeting_id?: string;
  outcome?: string;
  outcome_notes?: string;
  committee_id: string;
  submitter_id: string;
  seconder_id?: string;
  created_at: string;
  updated_at: string;
  committee?: { name: string };
}

export const useMotions = (committeeId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['motions', committeeId],
    queryFn: async () => {
      let query = supabase
        .from('motions')
        .select(`
          *,
          committee:committees(name)
        `)
        .order('created_at', { ascending: false });

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

export const useCreateMotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (motion: any) => {
      const { data, error } = await supabase
        .from('motions')
        .insert([motion])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motions'] });
      toast.success('Motion created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create motion: ${error.message}`);
    },
  });
};

export const useUpdateMotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Motion> & { id: string }) => {
      const { data, error } = await supabase
        .from('motions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motions'] });
      toast.success('Motion updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update motion: ${error.message}`);
    },
  });
};
