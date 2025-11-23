import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDocumentUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      meetingId, 
      file, 
      documentType, 
      title,
      content 
    }: {
      meetingId: string;
      file?: File;
      documentType: string;
      title: string;
      content?: string;
    }) => {
      let filePath: string | undefined = undefined;

      // Upload file to storage if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${meetingId}/${documentType}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('meeting-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        filePath = uploadData.path;
      }

      // Create document record
      const { data, error } = await supabase
        .from('meeting_documents')
        .insert([{
          meeting_id: meetingId,
          document_type: documentType,
          title,
          file_path: filePath,
          content: content,
          published: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-documents'] });
      toast({
        title: "Success",
        description: "Document uploaded successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, filePath }: { documentId: string; filePath?: string }) => {
      // Delete from storage if file exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('meeting-documents')
          .remove([filePath]);
        
        if (storageError) console.warn('Storage delete error:', storageError);
      }

      // Delete document record
      const { error } = await supabase
        .from('meeting_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-documents'] });
      toast({
        title: "Success",
        description: "Document deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });
};