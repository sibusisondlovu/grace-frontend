import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface MeetingRegistration {
  id: string;
  meeting_id: string;
  user_id: string;
  registration_type: string;
  attendance_purpose?: string;
  created_at: string;
  meeting?: {
    title: string;
    meeting_date: string;
  };
}

export interface MeetingDocument {
  id: string;
  meeting_id: string;
  document_type: string; // 'agenda' | 'minutes' | 'supporting' | 'attendance_register'
  title: string;
  file_path?: string;
  content?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const useMeetingRegistration = (meetingId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['meeting-registration', meetingId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('meeting_registrations' as any)
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Registration fetch error:', error);
        return null;
      }

      return data as unknown as MeetingRegistration | null;
    },
    enabled: !!user && !!meetingId,
  });
};

export const useRegisterInterest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ meetingId, registrationType, attendancePurpose }: {
      meetingId: string;
      registrationType: string;
      attendancePurpose?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meeting_registrations' as any)
        .insert([{
          meeting_id: meetingId,
          user_id: user.id,
          registration_type: registrationType,
          attendance_purpose: attendancePurpose,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-registration', variables.meetingId] });
      toast({
        title: "Success",
        description: "Your interest has been registered successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register interest",
        variant: "destructive",
      });
    },
  });
};

export const useWithdrawInterest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (meetingId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('meeting_registrations' as any)
        .delete()
        .eq('meeting_id', meetingId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-registration', meetingId] });
      toast({
        title: "Success",
        description: "Your registration has been withdrawn.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw interest",
        variant: "destructive",
      });
    },
  });
};

export const useMeetingDocuments = (meetingId: string, includeUnpublished = false) => {
  return useQuery({
    queryKey: ['meeting-documents', meetingId, includeUnpublished],
    queryFn: async () => {
      let query = supabase
        .from('meeting_documents' as any)
        .select('*')
        .eq('meeting_id', meetingId);

      if (!includeUnpublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Documents fetch error:', error);
        throw error;
      }

      return data as unknown as MeetingDocument[];
    },
    enabled: !!meetingId,
  });
};

export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: async ({ documentId, filePath }: { documentId: string; filePath: string }) => {
      const { data, error } = await supabase.storage
        .from('meeting-documents')
        .download(filePath);

      if (error) throw error;
      return { data, documentId };
    },
    onSuccess: ({ data, documentId }) => {
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${documentId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive",
      });
    },
  });
};