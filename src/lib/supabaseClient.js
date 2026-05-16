import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// diagnostic check
if (typeof window !== 'undefined') {
  window.__KASHUME_DIAGNOSTIC__ = {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl?.substring(0, 15) + '...',
    isPlaceholder: supabaseUrl?.includes('placeholder')
  };
}

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.error('CRITICAL: Supabase URL is missing or placeholder. Site will not function.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-fix.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false // Disable to prevent refresh loops
    }
  }
);
