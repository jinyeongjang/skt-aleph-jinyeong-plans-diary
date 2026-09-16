import React from 'react';
import { CalendarDays, CheckCircle2, FileCheck2, FileJson, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenExport: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, onOpenExport, isDark, onToggleTheme }) => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/80 bg-white/75 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all dark:border-white/8 dark:bg-neutral-950/75 dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Top Rim Light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <CalendarDays className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold tracking-tight text-neutral-900 sm:text-base dark:text-neutral-100">
              플랜두씨 다이어리 1
            </h1>
            <span className="hidden items-center gap-1 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-700 backdrop-blur-xs sm:inline-flex dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300">
              Plan ➔ Do ➔ See
            </span>
          </div>
        </div>

        {/* Right: Actions & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* 짧은 확인 방법 4줄 & AI 판단 모달 */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-neutral-900 dark:border-white/8 dark:bg-white/4 dark:text-neutral-200 dark:hover:bg-white/8 dark:hover:text-white"
            title="짧은 확인 방법 4줄 및 AI 판단 3줄"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">확인 방법 & AI 판단</span>
          </button>

          {/* 전체 데이터 내보내기 모달 */}
          <button
            type="button"
            onClick={onOpenExport}
            className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-neutral-900 dark:border-white/8 dark:bg-white/4 dark:text-neutral-200 dark:hover:bg-white/8 dark:hover:text-white"
            title="전체 자료 JSON 파일 내보내기 (T06-C36)"
          >
            <FileJson className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">자료 내보내기</span>
          </button>

          {/* 품질 검사 바로가기 */}
          <a
            href="#fixed-tests"
            className="hover-lift active-press hidden items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs backdrop-blur-md transition-all hover:bg-emerald-500/20 sm:flex dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>10대 검사</span>
          </a>

          {/* 테마 토글 */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white/70 text-neutral-700 shadow-2xs backdrop-blur-md transition-all hover:bg-white dark:border-white/8 dark:bg-white/4 dark:text-neutral-200 dark:hover:bg-white/8"
            aria-label="테마 전환"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
