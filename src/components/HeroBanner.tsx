import React from 'react';
import { Target, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-indigo-50/40 to-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl transition-all sm:p-8 dark:border-neutral-800/80 dark:from-neutral-900/90 dark:via-indigo-950/20 dark:to-neutral-900/70 dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
      {/* Decorative gradient orbs */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-400/10"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
        {/* Left: Mascot Character Image & Floating Tag */}
        <div className="relative flex shrink-0 items-center justify-center">
          <div className="relative h-44 w-44 overflow-hidden rounded-3xl border-2 border-indigo-500/30 bg-white/80 p-1.5 shadow-xl shadow-indigo-500/15 backdrop-blur-xl transition-all duration-300 sm:h-52 sm:w-52 md:h-60 md:w-60 dark:border-indigo-400/30 dark:bg-neutral-800/80 dark:shadow-indigo-950/50">
            <img
              src="/plandosee-mascot.png"
              alt="플랜두씨 마스코트 캐릭터"
              className="h-full w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="absolute -right-2 -bottom-3 flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-lg dark:bg-indigo-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>플랜두씨</span>
          </div>
        </div>

        {/* Center: Main Intro & Description */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300">
            <span>Plan ➔ Do ➔ See 선순환 다이어리</span>
          </div>
          <h2 className="mt-2.5 text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
            안녕하세요! 목표 달성 파트너,{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              플랜두씨
            </span>
            예요 👋
            <br />
            저와 함께 목표를 향해 계획을 세워갈 준비가 되었나요?
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-neutral-600 sm:text-sm dark:text-neutral-300">
            계획을 세우고(<strong>Plan</strong>), 실제로 실행하며(<strong>Do</strong>), 차이를 돌아보고(
            <strong>See</strong>) 다음 계획으로 연결해 나가는 자기 성장 다이어리입니다.
          </p>

          {/* 3-Step Pill Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-2xs backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
              <Target className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>1. 원본 보존 계획</span>
            </div>
            <ArrowRight className="hidden h-3 w-3 text-neutral-400 sm:inline dark:text-neutral-600" />
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-2xs backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>2. 멱등성 실행 기록</span>
            </div>
            <ArrowRight className="hidden h-3 w-3 text-neutral-400 sm:inline dark:text-neutral-600" />
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-2xs backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>3. 피드백 자동 승계</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
