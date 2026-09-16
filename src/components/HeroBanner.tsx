import React from 'react';
import { Target, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
        {/* Left: Mascot Character Image & Floating Tag */}
        <div className="relative flex shrink-0 items-center justify-center">
          <div className="relative h-44 w-44 overflow-hidden rounded-3xl border-2 border-indigo-500/30 bg-white/70 p-1.5 shadow-2xl shadow-indigo-500/20 backdrop-blur-2xl sm:h-52 sm:w-52 md:h-60 md:w-60 dark:border-indigo-400/30 dark:bg-neutral-800/70 dark:shadow-indigo-950/60">
            <img
              src="/plandosee-mascot.png"
              alt="플랜두씨 마스코트 캐릭터"
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
          <div className="glass-pill absolute -right-2 -bottom-3 flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-600/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md dark:bg-indigo-500/90">
            <Sparkles className="h-3.5 w-3.5" />
            <span>플랜두씨</span>
          </div>
        </div>

        {/* Center: Main Intro & Description */}
        <div className="flex-1 text-center md:text-left">
          <div className="glass-pill inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700 shadow-2xs backdrop-blur-md dark:border-indigo-400/30 dark:bg-indigo-500/25 dark:text-indigo-300">
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
            <div className="glass-pill flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-2xs dark:text-neutral-300">
              <Target className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>1. 원본 보존 계획</span>
            </div>
            <ArrowRight className="hidden h-3 w-3 text-neutral-400 sm:inline dark:text-neutral-600" />
            <div className="glass-pill flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-2xs dark:text-neutral-300">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>2. 멱등성 실행 기록</span>
            </div>
            <ArrowRight className="hidden h-3 w-3 text-neutral-400 sm:inline dark:text-neutral-600" />
            <div className="glass-pill flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-2xs dark:text-neutral-300">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>3. 피드백 자동 승계</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
