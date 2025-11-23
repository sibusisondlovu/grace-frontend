import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useTeamsNotification } from '@/hooks/useTeamsNotification';

const sendEmailNotification = async (params: {
  organizationId: string;
  recipientId?: string;
  recipientEmail?: string;
  subject: string;
  title: string;
  message: string;
  notificationType: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.functions.invoke('send-notification-email', {
      body: params,
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
};

export interface ActionItem {
  id: string;
  meeting_id?: string;
  agenda_item_id?: string;
  title: string;
  description?: string;
  assigned_to_id?: string;
  assigned_to_department?: string;
  due_date?: string;
  dueDate?: string; // Computed field for compatibility
  priority: string;
  status: string;
  committee_id?: string;
  organization_id?: string;
  resolution_text?: string;
  outcome?: string;
  created_at: string;
  updated_at: string;
  assignee?: string;
  committee?: string;
}

export const useActions = () => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();
  
  return useQuery({
    queryKey: ['actions', selectedOrganizationId],
    queryFn: async () => {
      let query = supabase
        .from('action_items')
        .select(`
          *,
          committees(name),
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (selectedOrganizationId) {
        query = query.eq('organization_id', selectedOrganizationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Action items fetch error:', error);
        throw error;
      }

      // Process the data to add computed fields
      return data.map((action: any) => ({
        ...action,
        assignee: action.profiles 
          ? `${action.profiles.first_name} ${action.profiles.last_name}`
          : action.assigned_to_department || 'Unassigned',
        committee: action.committees?.name || 'No Committee',
        dueDate: action.due_date, // Add compatibility field
      })) as ActionItem[];
    },
    enabled: !!user, // Only run query when user is authenticated
    retry: false,
  });
};

export const useCreateAction = () => {
  const queryClient = useQueryClient();
  const { sendNotification } = useTeamsNotification();

  return useMutation({
    mutationFn: async (action: Omit<ActionItem, 'id' | 'created_at' | 'updated_at' | 'assignee' | 'committee'>) => {
      const { data, error } = await supabase
        .from('action_items')
        .insert([action])
        .select(`
          *,
          committees(name),
          meetings(title, meeting_date),
          profiles(first_name, last_name, email)
        `)
        .single();

      if (error) throw error;
      
      // Send Teams notification for new action item
      if (data && action.organization_id) {
        const assigneeName = (data as any).profiles 
          ? `${(data as any).profiles.first_name} ${(data as any).profiles.last_name}`
          : action.assigned_to_department || 'Unassigned';
        
        const committeeName = (data as any).committees?.name || 'N/A';
        const meetingInfo = (data as any).meetings 
          ? `\nMeeting: ${(data as any).meetings.title} (${new Date((data as any).meetings.meeting_date).toLocaleDateString()})`
          : '';
        
        await sendNotification({
          organizationId: action.organization_id,
          title: "📋 New Action Item Created",
          message: `**${data.title}**\n\nAssigned to: ${assigneeName}\nCommittee: ${committeeName}\nPriority: ${data.priority.toUpperCase()}\nDue Date: ${data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set'}${meetingInfo}`,
          notificationType: "action_item_created",
          themeColor: "FF6B6B",
          metadata: {
            "Priority": data.priority,
            "Status": data.status,
            "Assigned To": assigneeName,
            "Due Date": data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set',
          },
        });
        
        // Send email notification to assignee if available
        if ((data as any).profiles?.email) {
          await sendEmailNotification({
            organizationId: action.organization_id,
            recipientEmail: (data as any).profiles.email,
            recipientId: action.assigned_to_id,
            subject: "New Action Item Assigned",
            title: "📋 New Action Item Created",
            message: `You have been assigned a new action item:\n\n${data.title}\n\n${data.description || ''}\n\nPriority: ${data.priority.toUpperCase()}\nDue Date: ${data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set'}${meetingInfo}`,
            notificationType: "action_item",
            metadata: {
              "Committee": committeeName,
              "Priority": data.priority,
              "Status": data.status,
              "Due Date": data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set',
            },
          });
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast({
        title: "Success",
        description: "Action item created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create action item",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAction = () => {
  const queryClient = useQueryClient();
  const { sendNotification } = useTeamsNotification();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActionItem> & { id: string }) => {
      // Get old data first to check if assignment changed
      const { data: oldData } = await supabase
        .from('action_items')
        .select('assigned_to_id, organization_id')
        .eq('id', id)
        .single();
      
      // Remove computed fields before updating
      const { assignee, committee, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('action_items')
        .update(cleanUpdates)
        .eq('id', id)
        .select(`
          *,
          committees(name),
          meetings(title, meeting_date),
          profiles(first_name, last_name, email)
        `)
        .single();

      if (error) throw error;
      
      // Send Teams notification if action item was reassigned
      if (data && oldData && updates.assigned_to_id && 
          oldData.assigned_to_id !== updates.assigned_to_id && 
          oldData.organization_id) {
        
        const assigneeName = (data as any).profiles 
          ? `${(data as any).profiles.first_name} ${(data as any).profiles.last_name}`
          : data.assigned_to_department || 'Department';
        
        const committeeName = (data as any).committees?.name || 'N/A';
        
        await sendNotification({
          organizationId: oldData.organization_id,
          title: "👤 Action Item Assigned",
          message: `**${data.title}**\n\nAssigned to: ${assigneeName}\nCommittee: ${committeeName}\nPriority: ${data.priority.toUpperCase()}\nDue Date: ${data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set'}\nStatus: ${data.status}`,
          notificationType: "action_item_assigned",
          themeColor: "4ECDC4",
          metadata: {
            "Assigned To": assigneeName,
            "Priority": data.priority,
            "Status": data.status,
            "Due Date": data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set',
          },
        });
        
        // Send email notification to new assignee
        if ((data as any).profiles?.email) {
          await sendEmailNotification({
            organizationId: oldData.organization_id,
            recipientEmail: (data as any).profiles.email,
            recipientId: updates.assigned_to_id,
            subject: "Action Item Assigned to You",
            title: "👤 Action Item Assigned",
            message: `You have been assigned an action item:\n\n${data.title}\n\n${data.description || ''}\n\nPriority: ${data.priority.toUpperCase()}\nDue Date: ${data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set'}\nStatus: ${data.status}`,
            notificationType: "action_assigned",
            metadata: {
              "Committee": committeeName,
              "Priority": data.priority,
              "Status": data.status,
              "Due Date": data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set',
            },
          });
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast({
        title: "Success",
        description: "Action item updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update action item",
        variant: "destructive",
      });
    },
  });
};