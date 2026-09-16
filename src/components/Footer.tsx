import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-20 border-t border-neutral-200/70 bg-white/70 py-10 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-neutral-950/70">
      {/* 상단 은은한 림라이트 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-neutral-500 sm:flex-row sm:px-6 dark:text-neutral-400">
        <div>
          <p className="font-bold text-neutral-900 dark:text-neutral-100">
            SKT ALEPH 과제 6: 플랜두씨 다이어리 1 — 내 계획과 실제를 담는 앱
          </p>
          <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            무로그인 공개 웹 (T06-C01) • Supabase PostgreSQL 연동 (T06-C34) • contracts/pds-schema-v2.json 명세 준수
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            10/10 PASS 검증 완비
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="font-mono text-neutral-600 dark:text-neutral-300">Plan ➔ Do ➔ See</span>
        </div>
      </div>
    </footer>
  );
};
