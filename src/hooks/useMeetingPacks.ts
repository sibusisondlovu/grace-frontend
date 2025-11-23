import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MeetingPack {
  id: string;
  meeting_id: string;
  version_number: number;
  pack_status: string;
  compiled_by?: string;
  compiled_at?: string;
  metadata: any;
  distribution_list?: string[];
  restricted: boolean;
  signature_routing: any[];
  created_at: string;
  updated_at: string;
}

export const useMeetingPacks = (meetingId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meeting-packs', meetingId],
    queryFn: async () => {
      let query = supabase
        .from('meeting_packs')
        .select('*')
        .order('version_number', { ascending: false });

      if (meetingId) {
        query = query.eq('meeting_id', meetingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MeetingPack[];
    },
    enabled: !!user,
  });
};

export const useCreateMeetingPack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pack: Omit<MeetingPack, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meeting_packs')
        .insert(pack)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-packs'] });
      toast.success('Meeting pack created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create meeting pack: ${error.message}`);
    },
  });
};

export const useUpdateMeetingPack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MeetingPack> & { id: string }) => {
      const { data, error } = await supabase
        .from('meeting_packs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-packs'] });
      toast.success('Meeting pack updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update meeting pack: ${error.message}`);
    },
  });
};
