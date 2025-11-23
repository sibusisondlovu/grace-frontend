import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();

  return useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async () => {
      if (!user) return { needsOnboarding: false };

      // Check if user has organization
      if (!profile?.organization_id) {
        return { needsOnboarding: true, step: 'organization' };
      }

      // Check if user has basic profile info
      if (!profile?.first_name || !profile?.last_name) {
        return { needsOnboarding: true, step: 'profile' };
      }

      // Check if user has a role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!roles || roles.length === 0) {
        return { needsOnboarding: true, step: 'role' };
      }

      return { needsOnboarding: false };
    },
    enabled: !!user,
  });
};
