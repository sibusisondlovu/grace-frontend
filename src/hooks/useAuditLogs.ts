import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { startOfDay, endOfDay } from 'date-fns';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    organization_id: string | null;
  } | null;
}

export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  actionType?: string;
  organizationId?: string;
  tableName?: string;
}

export const useAuditLogs = (limit: number = 50, filters?: AuditLogFilters) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['audit-logs', limit, filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('created_at', startOfDay(filters.startDate).toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', endOfDay(filters.endDate).toISOString());
      }
      if (filters?.actionType && filters.actionType !== 'all') {
        query = query.eq('action', filters.actionType);
      }
      if (filters?.tableName && filters.tableName !== 'all') {
        query = query.eq('table_name', filters.tableName);
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profile data separately for each user_id and filter by user/org
      let logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
          if (!log.user_id) return { ...log, profiles: null };
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, organization_id, user_id')
            .eq('user_id', log.user_id)
            .single();
          
          return { ...log, profiles: profile };
        })
      );

      // Apply client-side filters
      if (filters?.userId && filters.userId !== 'all') {
        logsWithProfiles = logsWithProfiles.filter(
          log => log.profiles?.user_id === filters.userId
        );
      }
      if (filters?.organizationId && filters.organizationId !== 'all') {
        logsWithProfiles = logsWithProfiles.filter(
          log => log.profiles?.organization_id === filters.organizationId
        );
      }

      return logsWithProfiles as AuditLog[];
    },
    enabled: !!user,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        async (payload) => {
          // Fetch the full record with profile data
          const { data: logData } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (logData) {
            let profile = null;
            if (logData.user_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name, last_name, email, organization_id')
                .eq('user_id', logData.user_id)
                .single();
              profile = profileData;
            }

            const fullLog = { ...logData, profiles: profile };

            // Add the new log to the beginning of the list
            queryClient.setQueryData(['audit-logs', limit, filters], (old: AuditLog[] | undefined) => {
              if (!old) return [fullLog];
              return [fullLog, ...old].slice(0, limit);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, limit, filters]);

  return query;
};

export const useAuditLogsByOrganization = (organizationId: string | undefined, limit: number = 50) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['audit-logs', 'organization', organizationId, limit],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Fetch more to account for filtering

      if (error) throw error;

      // Fetch profile data and filter by organization
      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
          if (!log.user_id) return null;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, organization_id')
            .eq('user_id', log.user_id)
            .single();
          
          if (profile?.organization_id === organizationId) {
            return { ...log, profiles: profile } as AuditLog;
          }
          return null;
        })
      );

      return logsWithProfiles.filter((log) => log !== null) as AuditLog[];
    },
    enabled: !!user && !!organizationId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !organizationId) return;

    const channel = supabase
      .channel('audit-logs-org-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        async (payload) => {
          const { data: logData } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (logData && logData.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, organization_id')
              .eq('user_id', logData.user_id)
              .single();

            if (profile?.organization_id === organizationId) {
              const fullLog = { ...logData, profiles: profile };
              
              queryClient.setQueryData(
                ['audit-logs', 'organization', organizationId, limit],
                (old: AuditLog[] | undefined) => {
                  if (!old) return [fullLog];
                  return [fullLog, ...old].slice(0, limit);
                }
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, organizationId, queryClient, limit]);

  return query;
};
