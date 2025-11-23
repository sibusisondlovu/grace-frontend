import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AppRole = 
  | 'admin' 
  | 'speaker' 
  | 'chair' 
  | 'deputy_chair' 
  | 'whip' 
  | 'member' 
  | 'external_member' 
  | 'coordinator' 
  | 'clerk' 
  | 'legal' 
  | 'cfo' 
  | 'super_admin'
  | 'public';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  committee_id?: string;
}

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!user,
  });
};

export const useHasRole = (requiredRole: AppRole | AppRole[]) => {
  const { data: userRoles, isLoading } = useUserRole();

  const hasRole = () => {
    if (!userRoles) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return userRoles.some(ur => roles.includes(ur.role));
  };

  return {
    hasRole: hasRole(),
    isLoading,
  };
};

// Role hierarchy - higher roles inherit permissions from lower roles
const roleHierarchy: Record<AppRole, number> = {
  super_admin: 110,
  admin: 100,
  speaker: 90,
  chair: 80,
  deputy_chair: 75,
  whip: 70,
  coordinator: 60,
  clerk: 55,
  legal: 50,
  cfo: 50,
  member: 40,
  external_member: 30,
  public: 10,
};

export const useHasPermission = (minimumRole: AppRole) => {
  const { data: userRoles, isLoading } = useUserRole();

  const hasPermission = () => {
    if (!userRoles || userRoles.length === 0) return false;
    
    const userHighestRole = Math.max(
      ...userRoles.map(ur => roleHierarchy[ur.role] || 0)
    );
    
    return userHighestRole >= roleHierarchy[minimumRole];
  };

  return {
    hasPermission: hasPermission(),
    isLoading,
  };
};

// RACI-based permission checks
// A = Accountable (final authority), R = Responsible (does the work)

// Planning & Scheduling - Secretariat is Accountable
export const useCanScheduleMeetings = () => {
  return useHasRole(['admin', 'clerk']);
};

// Pack Compilation - Secretariat is Responsible
export const useCanCompilePacks = () => {
  return useHasRole(['admin', 'clerk']);
};

// Session Management - Chair is Accountable, Secretariat & Members Responsible
export const useCanManageSessions = () => {
  return useHasRole(['admin', 'chair', 'deputy_chair', 'clerk', 'member']);
};

// Decisions & Resolutions - Chair & Director Accountable, Secretariat Responsible
export const useCanCaptureDecisions = () => {
  return useHasRole(['admin', 'clerk']);
};

export const useCanApproveDecisions = () => {
  return useHasRole(['admin', 'chair', 'deputy_chair', 'coordinator', 'cfo']);
};

// Minutes Review/Approval - Chair & City Manager Accountable, Secretariat Responsible
export const useCanSubmitMinutes = () => {
  return useHasRole(['admin', 'clerk']);
};

export const useCanApproveMinutes = () => {
  return useHasRole(['admin', 'chair', 'deputy_chair']);
};

// Publication & Archive - Records Management Accountable, Secretariat Responsible
export const useCanPublishDocuments = () => {
  return useHasRole(['admin', 'clerk']);
};

// Tracking & Escalations - Director Accountable, Secretariat Responsible
export const useCanTrackEscalations = () => {
  return useHasRole(['admin', 'coordinator', 'cfo']);
};

// Legacy permission checks (kept for backward compatibility)
export const useCanManageReports = () => {
  return useHasRole(['admin', 'coordinator', 'clerk']);
};

export const useCanManageCommittees = () => {
  return useHasRole(['admin', 'speaker']);
};

export const useCanManageAgendas = () => {
  return useHasRole(['admin', 'chair', 'deputy_chair', 'clerk']);
};

export const useCanAccessFinancials = () => {
  return useHasRole(['admin', 'cfo', 'legal']);
};

export const useIsAdmin = () => {
  return useHasRole('admin');
};

// Helper to check if user is secretariat (clerk role)
export const useIsSecretariat = () => {
  return useHasRole('clerk');
};

// Helper to check if user is director/MANCO
export const useIsDirector = () => {
  return useHasRole(['coordinator', 'cfo']);
};

// Helper to check if user is coordinator
export const useIsCoordinator = () => {
  return useHasRole('coordinator');
};