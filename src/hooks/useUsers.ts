import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export interface User {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  department: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();

  return useQuery({
    queryKey: ['users', selectedOrganizationId],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('email');

      if (selectedOrganizationId) {
        query = query.eq('organization_id', selectedOrganizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as User[];
    },
    enabled: !!user,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<User> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
};
