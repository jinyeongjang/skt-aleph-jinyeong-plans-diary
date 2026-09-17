import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-20 border-t border-neutral-200/80 bg-white/70 py-10 backdrop-blur-2xl dark:border-white/8 dark:bg-neutral-950/70">
      {/* 상단 은은한 림라이트 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-neutral-500 sm:flex-row sm:px-6 dark:text-neutral-400">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              SKT ALEPH — 플랜두씨 다이어리 1 & 2 (Plan·Do·See)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> T06·T07 전수 통과
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            PBKDF2-SHA256 인증 · JWT 세션 · PostgreSQL Supabase RLS 멀티테넌트 영속화
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            보안 격리 검증 완료
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="inline-flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            2026 SKT ALEPH 1기 장진영
          </span>
        </div>
      </div>
    </footer>
  );
};
