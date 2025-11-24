import { useState, useEffect, createContext, useContext } from 'react';
import { AccountInfo } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AccountInfo | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signOut: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inProgress === "none") {
      if (accounts.length > 0) {
        setUser(accounts[0]);
      } else {
        setUser(null);
      }
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [inProgress, accounts]);

  const signIn = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error: any) {
      console.error("Login failed", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error: any) {
      console.error("Logout failed", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
};