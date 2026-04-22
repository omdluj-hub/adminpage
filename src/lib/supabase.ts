import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if variables are valid URLs/keys to prevent crash
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url !== 'your-supabase-url' && !url.includes('placeholder');
  } catch {
    return false;
  }
};

// Client-side supabase client
export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey
);

// Server-side supabase client with Service Role
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  return createClient(
    isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
    serviceKey
  );
};
