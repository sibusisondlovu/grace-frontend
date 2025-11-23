import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DepartmentalRegister {
  id: string;
  department: string;
  register_type: string;
  related_id?: string;
  related_table?: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  completion_date?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useDepartmentalRegisters = (department?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['departmental-registers', department],
    queryFn: async () => {
      let query = supabase
        .from('departmental_registers')
        .select('*')
        .order('created_at', { ascending: false });

      if (department) {
        query = query.eq('department', department);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DepartmentalRegister[];
    },
    enabled: !!user,
  });
};

export const useCreateDepartmentalRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (register: Omit<DepartmentalRegister, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('departmental_registers')
        .insert(register)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmental-registers'] });
      toast.success('Register entry created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create register entry: ${error.message}`);
    },
  });
};

export const useUpdateDepartmentalRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DepartmentalRegister> & { id: string }) => {
      const { data, error } = await supabase
        .from('departmental_registers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmental-registers'] });
      toast.success('Register entry updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update register entry: ${error.message}`);
    },
  });
};
