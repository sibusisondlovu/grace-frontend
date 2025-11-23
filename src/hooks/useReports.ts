import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  title: string;
  report_type: string;
  financial_year?: string;
  category_id?: string;
  classification: string;
  document_url?: string;
  file_path?: string;
  file_size?: number;
  description?: string;
  published_date?: string;
  publication_status: string;
  committee_id?: string;
  linked_meeting_id?: string;
  tags?: string[];
  metadata?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: DocumentCategory;
  committee?: { name: string };
}

export const useDocumentCategories = () => {
  return useQuery({
    queryKey: ['document-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as DocumentCategory[];
    },
  });
};

export const useReports = (filters?: {
  reportType?: string;
  financialYear?: string;
  categoryId?: string;
  classification?: string;
  publicationStatus?: string;
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('reports_library')
        .select(`
          *,
          category:document_categories(name, description),
          committee:committees(name)
        `)
        .order('published_date', { ascending: false });

      if (filters?.reportType) {
        query = query.eq('report_type', filters.reportType);
      }
      if (filters?.financialYear) {
        query = query.eq('financial_year', filters.financialYear);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.classification) {
        query = query.eq('classification', filters.classification);
      }
      if (filters?.publicationStatus) {
        query = query.eq('publication_status', filters.publicationStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as Report[];
    },
    enabled: !!user,
  });
};

export const usePublicReports = (categoryId?: string) => {
  return useQuery({
    queryKey: ['public-reports', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('reports_library')
        .select(`
          *,
          category:document_categories(name, description)
        `)
        .eq('publication_status', 'published')
        .eq('classification', 'public')
        .order('published_date', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as Report[];
    },
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (report: Omit<Partial<Report>, 'title' | 'report_type'> & { title: string; report_type: string }) => {
      const { data, error } = await supabase
        .from('reports_library')
        .insert([{ ...report, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create report: ${error.message}`);
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Report> & { id: string }) => {
      const { data, error } = await supabase
        .from('reports_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update report: ${error.message}`);
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reports_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });
};
