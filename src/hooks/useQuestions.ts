import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Question {
  id: string;
  question_number: string;
  question_type: string;
  subject: string;
  question_text: string;
  addressed_to_dept: string;
  addressed_to_mmc?: string;
  due_date: string;
  status: string;
  response_text?: string;
  response_date?: string;
  follow_up_required: boolean;
  committee_id: string;
  councillor_id: string;
  created_at: string;
  updated_at: string;
  committee?: { name: string };
}

export const useQuestions = (committeeId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['questions', committeeId],
    queryFn: async () => {
      let query = supabase
        .from('questions_to_executive')
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

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: any) => {
      const { data, error } = await supabase
        .from('questions_to_executive')
        .insert([question])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit question: ${error.message}`);
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Question> & { id: string }) => {
      const { data, error } = await supabase
        .from('questions_to_executive')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });
};
