import React from 'react';
import { ShieldCheck, Database, CheckCircle2, Lock } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase.ts';
import { getCurrentSession, maskSensitiveString } from '../services/authService.ts';

interface NoticeBannerProps {
  onOpenDbGuide?: () => void;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ onOpenDbGuide }) => {
  const session = getCurrentSession();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-linear-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 p-4 shadow-sm backdrop-blur-xl dark:border-indigo-400/25 dark:from-indigo-950/40 dark:via-violet-950/30 dark:to-indigo-950/40">
      {/* Top Rim Light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center justify-between gap-3 text-xs sm:flex-row sm:text-sm">
        {/* T07 인증 상태 안내 */}
        <div className="flex items-center gap-3 font-medium text-indigo-950 dark:text-indigo-100">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-600 shadow-inner dark:border-indigo-400/30 dark:bg-indigo-400/20 dark:text-indigo-300">
            <Lock className="h-4 w-4" />
          </div>
          <span className="leading-snug">
            <strong className="font-semibold text-indigo-900 dark:text-indigo-200">인증 보안 활성화:</strong>{' '}
            {session ? (
              <>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{session.user.email}</span>{' '}
                계정으로 안전하게 로그인되어 있으며, 내 기록은 나만 볼 수 있습니다. (토큰:{' '}
                <span className="font-mono text-[11px] font-semibold text-indigo-700/90 dark:text-indigo-300/90">
                  {maskSensitiveString(session.token, 10)}
                </span>
                )
              </>
            ) : (
              '로그인하지 않은 사용자는 첫 화면의 로그인 창으로 보호됩니다.'
            )}
          </span>
        </div>

        {/* DB 연결 상태 뱃지 */}
        <div className="flex shrink-0 items-center gap-2">
          {isSupabaseConfigured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs backdrop-blur-md dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Supabase PostgreSQL (RLS) 연동
            </span>
          ) : (
            <button
              onClick={onOpenDbGuide}
              className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-800 shadow-2xs backdrop-blur-md transition-all hover:bg-sky-500/25 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-200 dark:hover:bg-sky-500/30"
              title="클라우드 Supabase DB 연결 가이드 보기"
            >
              <Database className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              로컬 영속 DB 동작 중 (Supabase RLS 설정)
            </button>
          )}

          <span className="hidden items-center gap-1 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-1 font-mono text-[11px] text-neutral-600 shadow-2xs backdrop-blur-xs md:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            T07 RLS 격리 완비
          </span>
        </div>
      </div>
    </div>
  );
};
