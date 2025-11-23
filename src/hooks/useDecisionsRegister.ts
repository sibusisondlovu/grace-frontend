import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Decision {
  id: string;
  meeting_id: string;
  agenda_item_id?: string;
  decision_number: string;
  decision_type: string;
  decision_text: string;
  owner_id?: string;
  owner_department?: string;
  due_date?: string;
  priority: string;
  escalation_level: string;
  escalation_threshold?: any;
  status: string;
  progress_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useDecisionsRegister = (meetingId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['decisions-register', meetingId],
    queryFn: async () => {
      let query = supabase
        .from('decisions_register')
        .select('*')
        .order('created_at', { ascending: false });

      if (meetingId) {
        query = query.eq('meeting_id', meetingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Decision[];
    },
    enabled: !!user,
  });
};

export const useCreateDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (decision: Omit<Decision, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('decisions_register')
        .insert(decision)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions-register'] });
      toast.success('Decision recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record decision: ${error.message}`);
    },
  });
};

export const useUpdateDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Decision> & { id: string }) => {
      const { data, error } = await supabase
        .from('decisions_register')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions-register'] });
      toast.success('Decision updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update decision: ${error.message}`);
    },
  });
};
