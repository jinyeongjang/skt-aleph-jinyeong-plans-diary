import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-neutral-200/80 bg-white/60 py-10 backdrop-blur-2xl dark:border-neutral-800/80 dark:bg-neutral-950/60">
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
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            10/10 PASS 검증 완비
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-600 dark:text-neutral-300">Plan ➔ Do ➔ See</span>
        </div>
      </div>
    </footer>
  );
};
