// Supabase client has been removed in favor of Microsoft Entra ID and direct API calls.
// This file is kept as a placeholder to prevent import errors during migration, 
// but should not be used.

export const supabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => ({ error: { message: "Supabase auth removed" } }),
    signOut: async () => ({ error: null }),
    signInWithOAuth: async () => ({ error: { message: "Supabase auth removed" } }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
  })
} as any;

