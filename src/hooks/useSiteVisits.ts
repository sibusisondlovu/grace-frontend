import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export interface SiteVisit {
  id: string;
  visit_number: string;
  committee_id: string;
  site_location: string;
  site_address?: string;
  visit_purpose: string;
  visit_date: string;
  participants: string[];
  status: string;
  observations?: string;
  findings?: string;
  evidence_collected?: string[];
  report_drafted: boolean;
  report_text?: string;
  linked_agenda_item_id?: string;
  linked_resolution_id?: string;
  created_at: string;
  updated_at: string;
  committee?: { name: string };
}

export const useSiteVisits = (committeeId?: string) => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();

  return useQuery({
    queryKey: ['site-visits', committeeId, selectedOrganizationId],
    queryFn: async () => {
      let query = supabase
        .from('site_visits')
        .select(`
          *,
          committee:committees(name)
        `)
        .order('visit_date', { ascending: false });

      if (committeeId) {
        query = query.eq('committee_id', committeeId);
      }

      if (selectedOrganizationId) {
        query = query.eq('organization_id', selectedOrganizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateSiteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visit: any) => {
      const { data, error } = await supabase
        .from('site_visits')
        .insert([visit])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-visits'] });
      toast.success('Site visit created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create site visit: ${error.message}`);
    },
  });
};

export const useUpdateSiteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SiteVisit> & { id: string }) => {
      const { data, error } = await supabase
        .from('site_visits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-visits'] });
      toast.success('Site visit updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update site visit: ${error.message}`);
    },
  });
};
