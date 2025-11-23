import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SendTeamsNotificationParams {
  organizationId: string;
  title: string;
  message: string;
  notificationType: string;
  metadata?: Record<string, any>;
  themeColor?: string;
}

export const useTeamsNotification = () => {
  const sendNotification = async (params: SendTeamsNotificationParams) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("teams-notify", {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Failed to send Teams notification:", error);
      // Don't show toast for Teams notification failures - fail silently
      return { success: false, error };
    }
  };

  return { sendNotification };
};
