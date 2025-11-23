import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useComplianceMetrics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['compliance-metrics'],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Meeting Notice Compliance (minimum 5 days notice required)
      const { data: meetingsWithNotice } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          meeting_date,
          created_at,
          committee_id,
          agenda_published,
          minutes_published,
          public_meeting,
          committees(name, notice_period_days)
        `)
        .gte('meeting_date', thirtyDaysAgo.toISOString())
        .order('meeting_date', { ascending: false });

      // Documentation Compliance
      const { data: documentationIssues } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          meeting_date,
          agenda_published,
          minutes_published,
          committee_id,
          committees(name)
        `)
        .eq('agenda_published', false)
        .lt('meeting_date', today.toISOString())
        .gte('meeting_date', ninetyDaysAgo.toISOString())
        .order('meeting_date', { ascending: false });

      // Public Access Compliance
      const { data: publicAccessIssues } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          meeting_date,
          public_meeting,
          committee_id,
          committees(name, public_access_allowed)
        `)
        .eq('public_meeting', false)
        .gte('meeting_date', thirtyDaysAgo.toISOString())
        .order('meeting_date', { ascending: false });

      // Quorum Compliance
      const { data: quorumIssues } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          meeting_date,
          quorum_achieved,
          committee_id,
          committees(name)
        `)
        .eq('quorum_achieved', false)
        .gte('meeting_date', thirtyDaysAgo.toISOString())
        .order('meeting_date', { ascending: false });

      // Action Item Compliance (overdue items)
      const { data: overdueActions } = await supabase
        .from('action_items')
        .select(`
          id,
          title,
          due_date,
          status,
          committee_id,
          committees(name)
        `)
        .lt('due_date', today.toISOString().split('T')[0])
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });

      // Calculate compliance rates
      const totalRecentMeetings = meetingsWithNotice?.length || 0;
      
      // Notice compliance (meetings with adequate notice)
      const noticeCompliant = meetingsWithNotice?.filter(meeting => {
        const meetingDate = new Date(meeting.meeting_date);
        const createdDate = new Date(meeting.created_at);
        const noticePeriod = meeting.committees?.notice_period_days || 5;
        const daysDifference = (meetingDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
        return daysDifference >= noticePeriod;
      }).length || 0;

      const noticeComplianceRate = totalRecentMeetings > 0 ? Math.round((noticeCompliant / totalRecentMeetings) * 100) : 100;

      // Documentation compliance
      const docComplianceRate = totalRecentMeetings > 0 
        ? Math.round(((totalRecentMeetings - (documentationIssues?.length || 0)) / totalRecentMeetings) * 100) 
        : 100;

      // Public access compliance
      const publicAccessRate = totalRecentMeetings > 0 
        ? Math.round(((totalRecentMeetings - (publicAccessIssues?.length || 0)) / totalRecentMeetings) * 100) 
        : 100;

      // Quorum compliance
      const quorumComplianceRate = totalRecentMeetings > 0 
        ? Math.round(((totalRecentMeetings - (quorumIssues?.length || 0)) / totalRecentMeetings) * 100) 
        : 100;

      // Overall compliance score
      const overallCompliance = Math.round(
        (noticeComplianceRate + docComplianceRate + publicAccessRate + quorumComplianceRate) / 4
      );

      return {
        metrics: {
          overallCompliance,
          noticeComplianceRate,
          docComplianceRate,
          publicAccessRate,
          quorumComplianceRate,
          totalMeetings: totalRecentMeetings,
          overdueActionsCount: overdueActions?.length || 0
        },
        issues: {
          documentationIssues: documentationIssues || [],
          publicAccessIssues: publicAccessIssues || [],
          quorumIssues: quorumIssues || [],
          overdueActions: overdueActions || []
        }
      };
    },
    enabled: !!user,
    retry: false,
  });
};

export const useComplianceReports = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['compliance-reports'],
    queryFn: async () => {
      // Get committees with their compliance status
      const { data: committees } = await supabase
        .from('committees')
        .select(`
          id,
          name,
          status,
          notice_period_days,
          public_access_allowed
        `)
        .eq('status', 'active');

      if (!committees) return [];

      // Calculate compliance for each committee
      const complianceReports = await Promise.all(
        committees.map(async (committee) => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          // Get recent meetings for this committee
          const { data: meetings } = await supabase
            .from('meetings')
            .select('id, meeting_date, created_at, agenda_published, minutes_published, quorum_achieved, public_meeting')
            .eq('committee_id', committee.id)
            .gte('meeting_date', thirtyDaysAgo.toISOString());

          const totalMeetings = meetings?.length || 0;
          
          if (totalMeetings === 0) {
            return {
              ...committee,
              totalMeetings: 0,
              complianceScore: 100,
              issues: []
            };
          }

          const issues: string[] = [];

          // Check notice compliance
          const noticeCompliant = meetings?.filter(meeting => {
            const meetingDate = new Date(meeting.meeting_date);
            const createdDate = new Date(meeting.created_at);
            const daysDifference = (meetingDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
            return daysDifference >= (committee.notice_period_days || 5);
          }).length || 0;

          if (noticeCompliant < totalMeetings) {
            issues.push(`${totalMeetings - noticeCompliant} meetings with inadequate notice`);
          }

          // Check documentation
          const docCompliant = meetings?.filter(m => m.agenda_published).length || 0;
          if (docCompliant < totalMeetings) {
            issues.push(`${totalMeetings - docCompliant} meetings missing published agendas`);
          }

          // Check quorum
          const quorumCompliant = meetings?.filter(m => m.quorum_achieved).length || 0;
          if (quorumCompliant < totalMeetings) {
            issues.push(`${totalMeetings - quorumCompliant} meetings without quorum`);
          }

          // Check public access
          const publicRequired = committee.public_access_allowed;
          const publicCompliant = meetings?.filter(m => m.public_meeting || !publicRequired).length || 0;
          if (publicCompliant < totalMeetings && publicRequired) {
            issues.push(`${totalMeetings - publicCompliant} meetings not open to public`);
          }

          // Calculate overall score
          const scores = [
            (noticeCompliant / totalMeetings) * 100,
            (docCompliant / totalMeetings) * 100,
            (quorumCompliant / totalMeetings) * 100,
            (publicCompliant / totalMeetings) * 100
          ];

          const complianceScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

          return {
            ...committee,
            totalMeetings,
            complianceScore,
            issues
          };
        })
      );

      return complianceReports;
    },
    enabled: !!user,
    retry: false,
  });
};