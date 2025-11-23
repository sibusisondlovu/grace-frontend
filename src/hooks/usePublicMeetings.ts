import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicMeeting {
  id: string;
  title: string;
  meeting_date: string;
  venue?: string;
  meeting_type: string;
  status: string;
  agenda_published: boolean;
  minutes_published: boolean;
  livestream_url?: string;
  recording_url?: string;
  committee?: {
    name: string;
    type: string;
  };
}

export const usePublicMeetings = () => {
  return useQuery({
    queryKey: ['public-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings' as any)
        .select(`
          id,
          title,
          meeting_date,
          venue,
          meeting_type,
          status,
          agenda_published,
          minutes_published,
          livestream_url,
          recording_url,
          committees!inner(name, type)
        `)
        .eq('public_meeting', true)
        .order('meeting_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Public meetings fetch error:', error);
        throw error;
      }

      return data as unknown as PublicMeeting[];
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpcomingPublicMeetings = () => {
  return useQuery({
    queryKey: ['public-meetings', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings' as any)
        .select(`
          id,
          title,
          meeting_date,
          venue,
          meeting_type,
          status,
          agenda_published,
          minutes_published,
          livestream_url,
          committees!inner(name, type)
        `)
        .eq('public_meeting', true)
        .gte('meeting_date', new Date().toISOString())
        .eq('status', 'scheduled')
        .order('meeting_date', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Upcoming public meetings fetch error:', error);
        throw error;
      }

      return data as unknown as PublicMeeting[];
    },
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentPublicMeetings = () => {
  return useQuery({
    queryKey: ['public-meetings', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings' as any)
        .select(`
          id,
          title,
          meeting_date,
          venue,
          meeting_type,
          status,
          agenda_published,
          minutes_published,
          recording_url,
          committees!inner(name, type)
        `)
        .eq('public_meeting', true)
        .lt('meeting_date', new Date().toISOString())
        .in('status', ['completed', 'cancelled'])
        .order('meeting_date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Recent public meetings fetch error:', error);
        throw error;
      }

      return data as unknown as PublicMeeting[];
    },
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
};