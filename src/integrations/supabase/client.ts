import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://ynslelukmmfbcjlfzppa.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc2xlbHVrbW1mYmNqbGZ6cHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTExMzAsImV4cCI6MjA3MjMyNzEzMH0.yQ65C_KXVcgvXqTsSyYaptelVb06Y3MkCQR4FU_OF5w';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
