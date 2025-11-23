import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export const useStats = () => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();
  
  return useQuery({
    queryKey: ['stats', selectedOrganizationId],
    queryFn: async () => {
      // Get total committees
      let committeesQuery = supabase
        .from('committees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (selectedOrganizationId) {
        committeesQuery = committeesQuery.eq('organization_id', selectedOrganizationId);
      }
      
      const { count: totalCommittees } = await committeesQuery;

      // Get total scheduled meetings this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      let meetingsQuery = supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .gte('meeting_date', startOfMonth.toISOString())
        .lt('meeting_date', endOfMonth.toISOString())
        .eq('status', 'scheduled');
      
      if (selectedOrganizationId) {
        meetingsQuery = meetingsQuery.eq('organization_id', selectedOrganizationId);
      }

      const { count: scheduledMeetings } = await meetingsQuery;

      // Get total action items
      let actionsQuery = supabase
        .from('action_items')
        .select('*', { count: 'exact', head: true });
      
      if (selectedOrganizationId) {
        actionsQuery = actionsQuery.eq('organization_id', selectedOrganizationId);
      }

      const { count: totalActions } = await actionsQuery;

      // Get pending action items
      let pendingQuery = supabase
        .from('action_items')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']);
      
      if (selectedOrganizationId) {
        pendingQuery = pendingQuery.eq('organization_id', selectedOrganizationId);
      }

      const { count: pendingActions } = await pendingQuery;

      // Calculate completion rate
      const completionRate = totalActions && totalActions > 0 
        ? Math.round(((totalActions - (pendingActions || 0)) / totalActions) * 100)
        : 0;

      return {
        totalCommittees: totalCommittees || 0,
        scheduledMeetings: scheduledMeetings || 0,
        totalActions: totalActions || 0,
        pendingActions: pendingActions || 0,
        completionRate,
      };
    },
    enabled: !!user, // Only run when user is authenticated
    retry: false,
  });
};