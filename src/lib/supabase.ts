import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const nodeEnv =
  typeof globalThis !== 'undefined'
    ? (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    : undefined;

// Vite 빌드 시 정적 치환(Static Replacement)을 위해 import.meta.env 속성을 명시적으로 직접 참조합니다.
const supabaseUrl: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  nodeEnv?.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  nodeEnv?.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'your-anon-key' &&
  !supabaseAnonKey.includes('your-anon'),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
