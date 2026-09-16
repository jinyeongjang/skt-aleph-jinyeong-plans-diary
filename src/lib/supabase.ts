import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const nodeEnv =
  typeof globalThis !== 'undefined'
    ? (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    : undefined;

// Vercel 환경 변수(VITE_*, SUPABASE_*, NEXT_PUBLIC_*)를 모두 정적으로 안전하게 참조합니다.
const supabaseUrl: string =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.SUPABASE_URL ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
      import.meta.env.PUBLIC_SUPABASE_URL)) ||
  nodeEnv?.VITE_SUPABASE_URL ||
  nodeEnv?.SUPABASE_URL ||
  nodeEnv?.NEXT_PUBLIC_SUPABASE_URL ||
  nodeEnv?.PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey: string =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.SUPABASE_ANON_KEY ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY)) ||
  nodeEnv?.VITE_SUPABASE_ANON_KEY ||
  nodeEnv?.SUPABASE_ANON_KEY ||
  nodeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  nodeEnv?.PUBLIC_SUPABASE_ANON_KEY ||
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
