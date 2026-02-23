import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mxssdqqttwwcgxpkbgam.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14c3NkcXF0dHd3Y2d4cGtiZ2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzA2MDIsImV4cCI6MjA3MDQwNjYwMn0.WFADLRaPThKICQWkdNT2ayYLTNtSquZ04WVWps5UN08';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Voice chat API helper
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
