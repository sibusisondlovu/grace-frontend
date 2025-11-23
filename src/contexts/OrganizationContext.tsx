import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useHasRole } from '@/hooks/useUserRole';

interface OrganizationContextType {
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
  isSuperAdmin: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useUserProfile();
  const { hasRole: isSuperAdmin } = useHasRole('super_admin');
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  // Initialize selected organization from localStorage or user's profile
  useEffect(() => {
    if (isSuperAdmin) {
      const stored = localStorage.getItem('selectedOrganizationId');
      if (stored) {
        setSelectedOrganizationId(stored);
      } else if (profile?.organization_id) {
        setSelectedOrganizationId(profile.organization_id);
      }
    } else if (profile?.organization_id) {
      // Non-super-admins are locked to their organization
      setSelectedOrganizationId(profile.organization_id);
    }
  }, [isSuperAdmin, profile?.organization_id]);

  // Store selected organization in localStorage
  const handleSetSelectedOrganization = (id: string | null) => {
    setSelectedOrganizationId(id);
    if (id) {
      localStorage.setItem('selectedOrganizationId', id);
    } else {
      localStorage.removeItem('selectedOrganizationId');
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        selectedOrganizationId,
        setSelectedOrganizationId: handleSetSelectedOrganization,
        isSuperAdmin,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider');
  }
  return context;
}
