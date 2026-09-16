import React, { useRef } from 'react';
import {
  Layers,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle2,
  Compass,
  Loader2,
} from 'lucide-react';
import type { Plan } from '../types/pds.ts';
import { formatMinutes } from '../utils/dateUtils.ts';

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onOpenNewPlan?: () => void;
  isLoading?: boolean;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  onOpenNewPlan,
  isLoading = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 로딩 중일 때 표시되는 깔끔한 스피너 및 '불러오는 중...' 인디케이터
  if (isLoading) {
    return (
      <section aria-label="계획 선택 바 로딩 중" className="animate-in fade-in relative duration-200">
        <div className="relative flex items-center justify-between overflow-hidden rounded-3xl border border-white/80 bg-white/75 px-5 py-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          {/* 상단 림라이트 */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
            aria-hidden="true"
          />

          {/* 미세 앰비언트 글로우 오브 */}
          <div
            className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl dark:bg-indigo-400/15"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl dark:bg-violet-400/15"
            aria-hidden="true"
          />

          <div className="flex items-center gap-3">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-600 shadow-inner backdrop-blur-md dark:border-indigo-400/30 dark:from-indigo-500/20 dark:to-violet-500/20 dark:text-indigo-300">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
              내 계획 선택
            </span>
          </div>

          {/* 로딩 스피너 및 '불러오는 중...' 텍스트 */}
          <div className="flex items-center gap-2.5 rounded-full border border-neutral-200/80 bg-white/70 px-4 py-1.5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">불러오는 중...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!plans || plans.length === 0) return null;

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getPriorityBadge = (priority: Plan['priority'], isSelected: boolean) => {
    switch (priority) {
      case 'high':
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
              isSelected
                ? 'bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/40 backdrop-blur-xs'
                : 'bg-rose-100/80 text-rose-700 ring-1 ring-rose-300/40 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-800/40'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 ring-1 ring-rose-300" />
            높음
          </span>
        );
      case 'medium':
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
              isSelected
                ? 'bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/40 backdrop-blur-xs'
                : 'bg-amber-100/80 text-amber-700 ring-1 ring-amber-300/40 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/40'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-amber-300" />
            보통
          </span>
        );
      case 'low':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
              isSelected
                ? 'bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-400/40 backdrop-blur-xs'
                : 'bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-300/40 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/40'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-emerald-300" />
            낮음
          </span>
        );
    }
  };

  return (
    <section aria-label="계획 선택 바" className="animate-in fade-in relative duration-300">
      {/* 글래스모피즘 메인 셸 */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-3.5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-2xl transition-all duration-300 sm:p-5 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* 미세 앰비언트 글로우 오브 */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-400/15"
          aria-hidden="true"
        />

        {/* 상단 라벨 & 액션 바 */}
        <div className="relative z-10 mb-3.5 flex flex-wrap items-center justify-between gap-2.5 px-0.5">
          <div className="flex items-center gap-2.5">
            {/* 세련된 글래스 아이콘 배지 */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-600 shadow-inner backdrop-blur-md dark:border-indigo-400/30 dark:from-indigo-500/20 dark:to-violet-500/20 dark:text-indigo-300">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
                내 계획 선택
              </span>
              <span className="glass-pill rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                총 {plans.length}개 보관
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 좌우 스크롤 제어 버튼 (카드가 여러 개일 때 유용) */}
            {plans.length > 2 && (
              <div className="flex items-center gap-1 rounded-xl border border-neutral-200/80 bg-white/50 p-0.5 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/50">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-200"
                  aria-label="이전 계획 목록 보기"
                  title="이전 계획"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-200"
                  aria-label="다음 계획 목록 보기"
                  title="다음 계획"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* 새 계획 추가 버튼 (글래스 버튼) */}
            {onOpenNewPlan && (
              <button
                onClick={onOpenNewPlan}
                type="button"
                className="hover-lift active-press group inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm backdrop-blur-md transition-all hover:border-indigo-500/50 hover:from-indigo-500/20 hover:to-violet-500/20 hover:text-indigo-700 dark:border-indigo-400/40 dark:from-indigo-500/15 dark:to-violet-500/15 dark:text-indigo-300 dark:hover:border-indigo-400/60 dark:hover:text-indigo-200"
              >
                <Plus className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
                <span>새 계획 추가</span>
              </button>
            )}
          </div>
        </div>

        {/* 계획 리스트 카드 / 글래스 캐러셀 그리드 */}
        <div ref={scrollContainerRef} className="custom-scrollbar flex items-stretch gap-3 overflow-x-auto pt-1 pb-1.5">
          {plans.map((p) => {
            const isSelected = activePlan?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlan(p.id)}
                type="button"
                className={`hover-lift active-press group relative flex w-64 shrink-0 cursor-pointer flex-col justify-between rounded-2xl p-3.5 text-left transition-all duration-300 sm:w-72 ${
                  isSelected
                    ? 'border border-indigo-300/50 bg-gradient-to-br from-indigo-600/95 via-indigo-600 to-violet-700/95 text-white shadow-lg ring-2 shadow-indigo-600/25 ring-indigo-400/40 backdrop-blur-2xl dark:border-indigo-400/40 dark:shadow-indigo-950/50'
                    : 'border border-neutral-200/80 bg-white/50 text-neutral-800 shadow-xs backdrop-blur-xl hover:border-indigo-400/50 hover:bg-white/85 hover:text-neutral-900 hover:shadow-md hover:shadow-indigo-500/5 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-neutral-200 dark:hover:border-indigo-400/40 dark:hover:bg-white/[0.07] dark:hover:text-neutral-100'
                }`}
              >
                {/* 상단 은은한 림라이트 (유리 반사 효과) */}
                {isSelected && (
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    aria-hidden="true"
                  />
                )}

                <div>
                  {/* 상단 뱃지 라인 */}
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">{getPriorityBadge(p.priority, isSelected)}</div>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-md">
                        <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                        선택됨
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-neutral-500">
                        <Compass className="h-3 w-3" />
                        전환하기
                      </span>
                    )}
                  </div>

                  {/* 계획 제목 */}
                  <div className="flex items-start gap-1.5">
                    <span
                      className={`line-clamp-1 text-xs font-bold tracking-tight sm:text-sm ${
                        isSelected ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {p.title}
                    </span>
                  </div>

                  {/* 목표/성공 기준 미리보기 칩 */}
                  <div
                    className={`mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] transition-colors ${
                      isSelected
                        ? 'border border-white/10 bg-black/15 text-indigo-100/90'
                        : 'border border-neutral-200/50 bg-neutral-100/60 text-neutral-500 dark:border-white/[0.04] dark:bg-white/[0.03] dark:text-neutral-400'
                    }`}
                  >
                    <Target
                      className={`h-3 w-3 shrink-0 ${isSelected ? 'text-amber-300' : 'text-indigo-500 dark:text-indigo-400'}`}
                    />
                    <span className="line-clamp-1">{p.success_criteria || '목표 달성'}</span>
                  </div>
                </div>

                {/* 하단 메타 정보 (기간 & 예상시간) */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <div
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                      isSelected
                        ? 'border border-white/15 bg-white/15 text-white/95 backdrop-blur-xs'
                        : 'border border-neutral-200/60 bg-neutral-100/80 text-neutral-600 dark:border-white/[0.06] dark:bg-white/[0.05] dark:text-neutral-300'
                    }`}
                  >
                    <Calendar className="h-3 w-3 shrink-0 opacity-80" />
                    <span>{p.start_date === p.end_date ? p.start_date : `${p.start_date} ~ ${p.end_date}`}</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                      isSelected
                        ? 'border border-white/15 bg-white/15 text-white/95 backdrop-blur-xs'
                        : 'border border-neutral-200/60 bg-neutral-100/80 text-neutral-600 dark:border-white/[0.06] dark:bg-white/[0.05] dark:text-neutral-300'
                    }`}
                  >
                    <Clock className="h-3 w-3 shrink-0 opacity-80" />
                    <span>{formatMinutes(p.estimated_minutes)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 현재 활성화된 계획 퀵 서브 글래스 바 */}
        {activePlan && (
          <div className="relative z-10 mt-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-indigo-500/15 bg-gradient-to-r from-indigo-500/[0.07] via-violet-500/[0.05] to-transparent px-3.5 py-2 text-xs backdrop-blur-md dark:border-indigo-400/20 dark:from-indigo-500/[0.12] dark:via-violet-500/[0.08]">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  현재 활성 계획: <span className="text-indigo-600 dark:text-indigo-400">{activePlan.title}</span>
                </span>
                <span className="mx-2 hidden text-neutral-400 sm:inline">|</span>
                <span className="hidden truncate text-neutral-500 sm:inline dark:text-neutral-400">
                  목표: {activePlan.success_criteria}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              <span className="rounded-md bg-neutral-200/60 px-1.5 py-0.5 dark:bg-neutral-800/80">
                예상 {formatMinutes(activePlan.estimated_minutes)}
              </span>
              <span>•</span>
              <span>
                {activePlan.start_date === activePlan.end_date
                  ? activePlan.start_date
                  : `${activePlan.start_date} ~ ${activePlan.end_date}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
