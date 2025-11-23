import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export interface Member {
  id: string;
  user_id: string;
  committee_id: string;
  role: string;
  voting_rights: boolean;
  start_date?: string;
  end_date?: string;
  ward_number?: string;
  party_affiliation?: string;
  created_at: string;
  committee?: {
    name: string;
    type: string;
  };
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department?: string;
    job_title?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  job_title?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const useMembers = (committeeId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['committee_members', committeeId],
    queryFn: async () => {
      // First, get committee members
      let query = supabase
        .from('committee_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (committeeId) {
        query = query.eq('committee_id', committeeId);
      }

      const { data: members, error: membersError } = await query;

      if (membersError) {
        console.error('Members fetch error:', membersError);
        throw membersError;
      }

      if (!members || members.length === 0) {
        return [];
      }

      // Get unique user IDs and committee IDs
      const userIds = [...new Set(members.map(m => m.user_id))];
      const committeeIds = [...new Set(members.map(m => m.committee_id))];

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Profiles fetch error:', profilesError);
      }

      // Fetch committees
      const { data: committees, error: committeesError } = await supabase
        .from('committees')
        .select('id, name, type')
        .in('id', committeeIds);

      if (committeesError) {
        console.error('Committees fetch error:', committeesError);
      }

      // Map profiles and committees to members
      const result = members.map((member: any) => ({
        ...member,
        profile: profiles?.find(p => p.user_id === member.user_id) || null,
        committee: committees?.find(c => c.id === member.committee_id) || null,
      }));

      console.log('Fetched members with profiles:', result);

      return result as Member[];
    },
    enabled: !!user,
    retry: false,
  });
};

export const useProfiles = () => {
  const { user } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();
  
  return useQuery({
    queryKey: ['profiles', selectedOrganizationId],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .not('user_id', 'is', null)
        .not('email', 'is', null)
        .order('first_name', { ascending: true, nullsFirst: false });

      if (selectedOrganizationId) {
        query = query.eq('organization_id', selectedOrganizationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Profiles fetch error:', error);
        throw error;
      }

      // Filter out any profiles without email (authenticated users should have email)
      const validProfiles = data?.filter(profile => 
        profile.user_id && profile.email
      ) as Profile[];

      return validProfiles || [];
    },
    enabled: !!user,
    retry: false,
  });
};

export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: {
      user_id: string;
      committee_id: string;
      role: string;
      voting_rights: boolean;
      ward_number?: string;
      party_affiliation?: string;
      start_date?: string;
    }) => {
      // Check if member already exists in this committee
      const { data: existingMember } = await supabase
        .from('committee_members')
        .select('id')
        .eq('user_id', memberData.user_id)
        .eq('committee_id', memberData.committee_id)
        .maybeSingle();

      if (existingMember) {
        throw new Error('This user is already a member of the selected committee');
      }

      const { data, error } = await supabase
        .from('committee_members')
        .insert([memberData])
        .select()
        .single();

      if (error) {
        console.error('Add member error:', error);
        throw error;
      }
      
      console.log('Member added successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to update UI immediately
      queryClient.invalidateQueries({ 
        queryKey: ['committee_members'],
        refetchType: 'all' 
      });
      toast({
        title: "Success",
        description: "Member added successfully to the committee!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Member> & { id: string }) => {
      // Remove computed fields before updating
      const { committee, profile, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('committee_members')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to update UI immediately
      queryClient.invalidateQueries({ 
        queryKey: ['committee_members'],
        refetchType: 'all'
      });
      toast({
        title: "Success",
        description: "Member updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update member",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('committee_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to update UI immediately
      queryClient.invalidateQueries({ 
        queryKey: ['committee_members'],
        refetchType: 'all'
      });
      toast({
        title: "Success",
        description: "Member removed from committee successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['committee_members'] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
};