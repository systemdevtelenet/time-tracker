import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhdmsmwrskxowvytedgh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZG1zbXdyc2t4b3d2eXRlZGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mzg3MDEsImV4cCI6MjEwMzQxNDcwMX0.jEfT-8dwK1tp3fuQW9ypTObVNc0a6EjgvfgKJhzg70o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
