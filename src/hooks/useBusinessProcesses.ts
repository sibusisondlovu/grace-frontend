import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BusinessProcess {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  overall_progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  department?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

interface ProcessStep {
  id: string;
  process_id: string;
  step_number: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  responsible_party?: string;
  duration_days?: number;
  dependencies?: string[];
  created_at: string;
  updated_at: string;
}

export const useBusinessProcesses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['business-processes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_processes')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BusinessProcess[];
    },
    enabled: !!user,
  });
};

export const useProcessSteps = (processId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['process-steps', processId],
    queryFn: async () => {
      let query = supabase
        .from('process_steps')
        .select('*')
        .order('step_number');

      if (processId) {
        query = query.eq('process_id', processId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProcessStep[];
    },
    enabled: !!user && !!processId,
  });
};

export const useUpdateProcessStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, progress }: { id: string; status: string; progress?: number }) => {
      const updates: any = { status };
      if (progress !== undefined) {
        updates.overall_progress = progress;
      }

      const { data, error } = await supabase
        .from('business_processes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-processes'] });
      toast.success('Process status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update process: ${error.message}`);
    },
  });
};

export const useUpdateStepStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('process_steps')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['process-steps'] });
      toast.success('Step status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update step: ${error.message}`);
    },
  });
};
