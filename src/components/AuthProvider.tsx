import { ReactNode } from 'react';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/services/api";
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthProvider();

  return (
    <MsalProvider instance={msalInstance}>
      <AuthContext.Provider value={auth}>
        {children}
      </AuthContext.Provider>
    </MsalProvider>
  );
}