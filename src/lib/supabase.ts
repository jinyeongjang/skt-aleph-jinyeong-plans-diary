import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getEnvVar(key: string): string {
  try {
    const globalObj = typeof globalThis !== 'undefined' ? (globalThis as Record<string, any>) : {};
    if (globalObj.process?.env?.[key]) {
      return globalObj.process.env[key];
    }
  } catch {
    // ignore
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }
  return '';
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project'),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
