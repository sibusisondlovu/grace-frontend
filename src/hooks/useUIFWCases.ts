import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface UIFWCase {
  id: string;
  case_number: string;
  case_type: string;
  financial_year: string;
  department: string;
  description: string;
  amount: number;
  date_opened: string;
  status: string;
  evidence_summary?: string;
  findings?: string;
  recommendations?: string;
  hearing_date?: string;
  hearing_scheduled_meeting_id?: string;
  council_decision?: string;
  council_decision_date?: string;
  implementation_status?: string;
  closure_report?: string;
  created_at: string;
  updated_at: string;
}

export const useUIFWCases = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['uifw-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uifw_cases')
        .select('*')
        .order('date_opened', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateUIFWCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uifwCase: any) => {
      const { data, error } = await supabase
        .from('uifw_cases')
        .insert([uifwCase])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uifw-cases'] });
      toast.success('UIFW case created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create UIFW case: ${error.message}`);
    },
  });
};

export const useUpdateUIFWCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UIFWCase> & { id: string }) => {
      const { data, error } = await supabase
        .from('uifw_cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uifw-cases'] });
      toast.success('UIFW case updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update UIFW case: ${error.message}`);
    },
  });
};
