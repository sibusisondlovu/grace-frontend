import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useOversightMetrics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['oversight-metrics'],
    queryFn: async () => {
      // Committee performance metrics
      const { data: committees } = await supabase
        .from('committees')
        .select('id, name, status')
        .eq('status', 'active');

      // Meeting attendance rates
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentMeetings } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          committee_id,
          meeting_date,
          quorum_achieved,
          committees(name)
        `)
        .gte('meeting_date', thirtyDaysAgo.toISOString())
        .order('meeting_date', { ascending: false });

      // Action item completion rates
      const { data: actionItems } = await supabase
        .from('action_items')
        .select('id, status, due_date, created_at, committee_id, committees(name)')
        .order('created_at', { ascending: false });

      // Overdue action items
      const today = new Date().toISOString().split('T')[0];
      const { data: overdueActions } = await supabase
        .from('action_items')
        .select('id, title, due_date, committee_id, committees(name)')
        .lt('due_date', today)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });

      // Meeting compliance (meetings without published agendas/minutes)
      const { data: complianceIssues } = await supabase
        .from('meetings')
        .select('id, title, committee_id, agenda_published, minutes_published, meeting_date, committees(name)')
        .eq('agenda_published', false)
        .lt('meeting_date', new Date().toISOString())
        .order('meeting_date', { ascending: false });

      // Calculate metrics
      const totalMeetings = recentMeetings?.length || 0;
      const meetingsWithQuorum = recentMeetings?.filter(m => m.quorum_achieved)?.length || 0;
      const quorumRate = totalMeetings > 0 ? Math.round((meetingsWithQuorum / totalMeetings) * 100) : 0;

      const totalActions = actionItems?.length || 0;
      const completedActions = actionItems?.filter(a => a.status === 'completed')?.length || 0;
      const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

      const complianceRate = totalMeetings > 0 
        ? Math.round(((totalMeetings - (complianceIssues?.length || 0)) / totalMeetings) * 100) 
        : 100;

      return {
        committees: committees || [],
        recentMeetings: recentMeetings || [],
        overdueActions: overdueActions || [],
        complianceIssues: complianceIssues || [],
        metrics: {
          totalCommittees: committees?.length || 0,
          totalMeetings,
          quorumRate,
          completionRate,
          complianceRate,
          overdueCount: overdueActions?.length || 0,
          complianceIssueCount: complianceIssues?.length || 0
        }
      };
    },
    enabled: !!user,
    retry: false,
  });
};

export const useCommitteePerformance = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['committee-performance'],
    queryFn: async () => {
      const { data: committees } = await supabase
        .from('committees')
        .select(`
          id,
          name,
          status,
          created_at
        `)
        .eq('status', 'active');

      if (!committees) return [];

      // Get performance data for each committee
      const performanceData = await Promise.all(
        committees.map(async (committee) => {
          // Meeting frequency (last 3 months)
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

          const { count: meetingCount } = await supabase
            .from('meetings')
            .select('*', { count: 'exact', head: true })
            .eq('committee_id', committee.id)
            .gte('meeting_date', threeMonthsAgo.toISOString());

          // Action item completion rate
          const { data: actions } = await supabase
            .from('action_items')
            .select('status')
            .eq('committee_id', committee.id);

          const totalActions = actions?.length || 0;
          const completedActions = actions?.filter(a => a.status === 'completed')?.length || 0;
          const actionCompletionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

          // Recent meeting attendance
          const { data: recentMeetings } = await supabase
            .from('meetings')
            .select('quorum_achieved')
            .eq('committee_id', committee.id)
            .gte('meeting_date', threeMonthsAgo.toISOString());

          const attendanceMeetings = recentMeetings?.length || 0;
          const quorumMeetings = recentMeetings?.filter(m => m.quorum_achieved)?.length || 0;
          const attendanceRate = attendanceMeetings > 0 ? Math.round((quorumMeetings / attendanceMeetings) * 100) : 0;

          return {
            ...committee,
            meetingCount: meetingCount || 0,
            actionCompletionRate,
            attendanceRate,
            totalActions
          };
        })
      );

      return performanceData;
    },
    enabled: !!user,
    retry: false,
  });
};