import React from 'react';
import { FileCheck2, FileJson, Moon, Sun, ShieldCheck, BookOpen, LogOut, UserX, User, ShieldAlert } from 'lucide-react';
import type { AuthSession } from '../types/auth.ts';

interface HeaderProps {
  session: AuthSession | null;
  onOpenGuide: () => void;
  onOpenManual: () => void;
  onOpenAudit: () => void;
  onOpenExport: () => void;
  onOpenDeleteAccount: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onOpenGuide,
  onOpenManual,
  onOpenAudit,
  onOpenExport,
  onOpenDeleteAccount,
  onLogout,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/80 bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all dark:border-white/8 dark:bg-neutral-950/80 dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Top Rim Light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold tracking-tight text-neutral-900 sm:text-base dark:text-neutral-100">
              플랜두씨 다이어리 2
            </h1>
            <span className="hidden items-center gap-1 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-700 backdrop-blur-xs sm:inline-flex dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300">
              <ShieldCheck className="h-3 w-3" /> 인증 보호 모드
            </span>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          {session && (
            <>
              {/* 사용자 계정 배지 */}
              <div className="hidden items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-neutral-100/80 px-2.5 py-1 text-xs font-medium text-neutral-800 lg:flex dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                <span className="font-mono text-[11px]">{session.user.email}</span>
              </div>

              {/* 양방향 침범 차단 검증기 모달 */}
              <button
                type="button"
                onClick={onOpenAudit}
                className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs backdrop-blur-md transition-all hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
                title="양방향 침범 차단 및 IDOR 검증기 (T07-C116~C126)"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span className="hidden md:inline">보안 차단 검증</span>
              </button>

              {/* 인증 구현 설명서 모달 */}
              <button
                type="button"
                onClick={onOpenManual}
                className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs backdrop-blur-md transition-all hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                title="인증 구현 설명서 6섹션 (T07-C127~C131)"
              >
                <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden md:inline">인증 설명서</span>
              </button>
            </>
          )}

          {/* 짧은 확인 방법 4줄 & AI 판단 모달 */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-neutral-900 dark:border-white/8 dark:bg-white/4 dark:text-neutral-200 dark:hover:bg-white/8 dark:hover:text-white"
            title="짧은 확인 방법 4줄 및 AI 판단 3줄 (T07-C39, T07-C40)"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">확인 방법</span>
          </button>

          {session && (
            <>
              {/* 전체 데이터 내보내기 모달 */}
              <button
                type="button"
                onClick={onOpenExport}
                className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-neutral-900 dark:border-white/8 dark:bg-white/4 dark:text-neutral-200 dark:hover:bg-white/8 dark:hover:text-white"
                title="내 자료 전체 JSON 내보내기 (T07-C133)"
              >
                <FileJson className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden md:inline">내보내기</span>
              </button>

              {/* 계정 탈퇴 모달 */}
              <button
                type="button"
                onClick={onOpenDeleteAccount}
                className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-2.5 py-1.5 text-xs font-semibold text-neutral-600 hover:text-rose-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-rose-400"
                title="계정 탈퇴 및 데이터 삭제 (T07-C134)"
              >
                <UserX className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">탈퇴</span>
              </button>

              {/* 로그아웃 버튼 (T07-C109, T07-C114) */}
              <button
                type="button"
                onClick={onLogout}
                className="hover-lift active-press flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                title="로그아웃 및 토큰 무효화"
              >
                <LogOut className="h-3.5 w-3.5 text-neutral-500" />
                <span>로그아웃</span>
              </button>
            </>
          )}

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
