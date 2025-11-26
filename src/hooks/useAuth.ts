import { useState, useEffect, createContext, useContext } from 'react';
import { AccountInfo } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';

interface User {
  id?: string;
  email?: string;
  name?: string;
  username?: string; // For MSAL compatibility
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signInWithEmail: async () => { },
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for local session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const localToken = localStorage.getItem('grace_token');
      const localUserStr = localStorage.getItem('grace_user');

      if (localToken && localUserStr) {
        try {
          setUser(JSON.parse(localUserStr));
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse local user", e);
          localStorage.removeItem('grace_token');
          localStorage.removeItem('grace_user');
        }
      }

      // If no local session, check MSAL
      if (inProgress === "none") {
        if (accounts.length > 0) {
          const msalAccount = accounts[0];
          setUser({
            email: msalAccount.username,
            name: msalAccount.name,
            username: msalAccount.username
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    };

    checkAuth();
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

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/signin', { email, password });

      if (response.session && response.session.access_token) {
        localStorage.setItem('grace_token', response.session.access_token);
        localStorage.setItem('grace_user', JSON.stringify(response.user));
        setUser(response.user);
        toast({
          title: "Success",
          description: "Signed in successfully",
        });
      }
    } catch (error: any) {
      console.error("Email login failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('grace_token');
      localStorage.removeItem('grace_user');
      setUser(null);

      // If MSAL session exists, logout from there too
      if (accounts.length > 0) {
        await instance.logoutRedirect({
          postLogoutRedirectUri: window.location.origin,
        });
      }
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
    signInWithEmail,
    signOut,
  };
};