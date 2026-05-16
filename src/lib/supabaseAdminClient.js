import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.error('CRITICAL: Supabase URL is missing or placeholder. Admin site will not function.');
}

// Create a separate instance exclusively for the Admin Dashboard
// We use a custom storageKey to completely isolate the session from the public Shop
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder-fix.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'kashume-admin-auth-token', // ISOLATION KEY
    }
  }
);
