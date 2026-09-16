import React from 'react';
import { AlertCircle, Database, CheckCircle2, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NoticeBannerProps {
  onOpenDbGuide?: () => void;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ onOpenDbGuide }) => {
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl border-amber-500/25 bg-amber-500/10 px-4 py-3.5 shadow-[0_8px_24px_rgba(245,158,11,0.08)] dark:border-amber-400/20 dark:bg-amber-500/10 dark:shadow-[0_8px_24px_rgba(245,158,11,0.15)]">
      <div className="flex flex-col items-center justify-between gap-3 text-xs sm:flex-row sm:text-sm">
        {/* T06-C82 필수 안내 문구 */}
        <div className="flex items-center gap-2.5 font-medium text-amber-950 dark:text-amber-100">
          <div className="glass-pill flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="leading-snug">
            <strong className="font-semibold text-amber-900 dark:text-amber-200">공개 안내:</strong> 지금은 로그인이
            없어 링크를 아는 사람은 누구나 볼 수 있습니다. 남이 봐도 괜찮은 내용만 넣으세요.
          </span>
        </div>

        {/* DB 연결 상태 뱃지 (T06-C34) */}
        <div className="flex shrink-0 items-center gap-2">
          {isSupabaseConfigured ? (
            <span className="glass-pill inline-flex items-center gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Supabase PostgreSQL 연동 중
            </span>
          ) : (
            <button
              onClick={onOpenDbGuide}
              className="glass-pill inline-flex cursor-pointer items-center gap-1.5 rounded-full border-sky-500/30 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-800 shadow-2xs transition-all hover:bg-sky-500/25 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-200 dark:hover:bg-sky-500/30"
              title="클라우드 Supabase DB 연결 가이드 보기"
            >
              <Database className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              로컬 영속 DB 동작 중 (Supabase 설정)
            </button>
          )}

          <span className="glass-pill hidden items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] text-neutral-600 shadow-2xs md:inline-flex dark:text-neutral-300">
            <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
            무로그인 검증 지원
          </span>
        </div>
      </div>
    </div>
  );
};
