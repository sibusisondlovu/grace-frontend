import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface AgendaItem {
  id: string;
  meeting_id: string;
  sponsor_id?: string;
  item_number: string;
  title: string;
  description?: string;
  item_type: string;
  classification: string;
  status: string;
  order_index?: number;
  late_item: boolean;
  requires_vote: boolean;
  estimated_duration?: number;
  created_at: string;
  updated_at: string;
  meeting?: {
    id: string;
    title: string;
    meeting_date: string;
    committee_id: string;
    committees?: {
      name: string;
      type: string;
    };
  };
  sponsor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface MeetingWithAgenda {
  id: string;
  title: string;
  meeting_date: string;
  committee_id: string;
  status: string;
  agenda_published: boolean;
  committee?: {
    name: string;
    type: string;
  };
  agenda_items?: AgendaItem[];
  agenda_count?: number;
}

export const useAgendaItems = (meetingId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['agenda_items', meetingId],
    queryFn: async () => {
      let query = supabase
        .from('agenda_items')
        .select(`
          *,
          meetings(
            id,
            title,
            meeting_date,
            committee_id,
            committees(name, type)
          ),
          profiles!agenda_items_sponsor_id_fkey(first_name, last_name, email)
        `)
        .order('order_index', { ascending: true });

      if (meetingId) {
        query = query.eq('meeting_id', meetingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Agenda items fetch error:', error);
        throw error;
      }

      return data.map((item: any) => ({
        ...item,
        meeting: item.meetings ? {
          ...item.meetings,
          committees: item.meetings.committees,
        } : undefined,
        sponsor: item.profiles,
      })) as AgendaItem[];
    },
    enabled: !!user,
    retry: false,
  });
};

export const useMeetingsWithAgendas = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['meetings_with_agendas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          committees(name, type),
          agenda_items(count)
        `)
        .order('meeting_date', { ascending: false });

      if (error) {
        console.error('Meetings with agendas fetch error:', error);
        throw error;
      }

      return data.map((meeting: any) => ({
        ...meeting,
        committee: meeting.committees,
        agenda_count: meeting.agenda_items?.[0]?.count || 0,
      })) as MeetingWithAgenda[];
    },
    enabled: !!user,
    retry: false,
  });
};

export const useCreateAgendaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agendaItem: Omit<AgendaItem, 'id' | 'created_at' | 'updated_at' | 'meeting' | 'sponsor'>) => {
      const { data, error } = await supabase
        .from('agenda_items')
        .insert([agendaItem])
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda_items'] });
      queryClient.invalidateQueries({ queryKey: ['meetings_with_agendas'] });
      toast({
        title: "Success",
        description: "Agenda item created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create agenda item",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAgendaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgendaItem> & { id: string }) => {
      // Remove computed fields before updating
      const { meeting, sponsor, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('agenda_items')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda_items'] });
      queryClient.invalidateQueries({ queryKey: ['meetings_with_agendas'] });
      toast({
        title: "Success",
        description: "Agenda item updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agenda item",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAgendaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agendaItemId: string) => {
      const { error } = await supabase
        .from('agenda_items')
        .delete()
        .eq('id', agendaItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda_items'] });
      queryClient.invalidateQueries({ queryKey: ['meetings_with_agendas'] });
      toast({
        title: "Success",
        description: "Agenda item deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete agenda item",
        variant: "destructive",
      });
    },
  });
};

export const useReorderAgendaItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      const promises = items.map(item =>
        supabase
          .from('agenda_items')
          .update({ order_index: item.order_index })
          .eq('id', item.id)
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda_items'] });
      toast({
        title: "Success",
        description: "Agenda items reordered successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reorder agenda items",
        variant: "destructive",
      });
    },
  });
};

export const usePublishAgenda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetingId, published }: { meetingId: string; published: boolean }) => {
      const { data, error } = await supabase
        .from('meetings')
        .update({ agenda_published: published })
        .eq('id', meetingId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { published }) => {
      queryClient.invalidateQueries({ queryKey: ['meetings_with_agendas'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "Success",
        description: `Agenda ${published ? 'published' : 'unpublished'} successfully!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agenda publication status",
        variant: "destructive",
      });
    },
  });
};