import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Document {
  id: string;
  meeting_id: string;
  document_type: string;
  title: string;
  file_path: string | null;
  content: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const useDocuments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user,
  });
};

export const useMeetingDocumentsByType = (meetingId: string, documentType: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meeting-documents', meetingId, documentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_documents')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('document_type', documentType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user && !!meetingId,
  });
};
