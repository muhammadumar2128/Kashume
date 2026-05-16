import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) console.error('SUPABASE_INITIALIZATION_ERROR: VITE_SUPABASE_URL is missing.');
if (!supabaseAnonKey) console.error('SUPABASE_INITIALIZATION_ERROR: VITE_SUPABASE_ANON_KEY is missing.');

if (supabaseUrl && supabaseUrl.includes('placeholder')) {
  console.warn('SUPABASE_CONFIG_WARNING: Using placeholder URL. Database connection will not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
