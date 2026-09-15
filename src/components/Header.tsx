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
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/60 bg-white/75 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-2xl transition-all dark:border-neutral-800/80 dark:bg-neutral-950/75 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs dark:bg-indigo-500 dark:text-white">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold tracking-tight text-neutral-900 sm:text-base dark:text-neutral-100">
              플랜두씨 다이어리 1
            </h1>
            <span className="hidden items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-700 backdrop-blur-xs sm:inline-flex dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300">
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
            className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-xs transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            title="짧은 확인 방법 4줄 및 AI 판단 3줄"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">확인 방법 & AI 판단</span>
          </button>

          {/* 전체 데이터 내보내기 모달 */}
          <button
            type="button"
            onClick={onOpenExport}
            className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-xs transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            title="전체 자료 JSON 파일 내보내기 (T06-C36)"
          >
            <FileJson className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">자료 내보내기</span>
          </button>

          {/* 품질 검사 바로가기 */}
          <a
            href="#fixed-tests"
            className="hover-lift active-press hidden items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs backdrop-blur-xs transition-all hover:bg-emerald-100/60 sm:flex dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>10대 검사</span>
          </a>

          {/* 테마 토글 */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="hover-lift active-press flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white/80 text-neutral-700 shadow-2xs backdrop-blur-xs transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            aria-label="테마 전환"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
