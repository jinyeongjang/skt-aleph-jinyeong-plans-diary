import React from 'react';
import { Layers, Calendar, Clock, Sparkles, Plus } from 'lucide-react';
import type { Plan } from '../types/pds.ts';
import { formatMinutes } from '../utils/dateUtils.ts';

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onOpenNewPlan?: () => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ plans, selectedPlanId, onSelectPlan, onOpenNewPlan }) => {
  if (!plans || plans.length === 0) return null;

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const getPriorityBadge = (priority: Plan['priority'], isSelected: boolean) => {
    switch (priority) {
      case 'high':
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
              isSelected
                ? 'bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/40'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            높음
          </span>
        );
      case 'medium':
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
              isSelected
                ? 'bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/40'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            보통
          </span>
        );
      case 'low':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
              isSelected
                ? 'bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-400/40'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            낮음
          </span>
        );
    }
  };

  return (
    <section aria-label="계획 선택 바" className="relative">
      <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/70 p-3.5 shadow-sm backdrop-blur-xl sm:p-4 dark:border-neutral-800/80 dark:bg-neutral-900/70">
        {/* 상단 라벨 & 상태 바 */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
                내 계획 선택
              </span>
              <span className="rounded-full bg-neutral-200/70 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                총 {plans.length}개 보관
              </span>
            </div>
          </div>

          {onOpenNewPlan && (
            <button
              onClick={onOpenNewPlan}
              type="button"
              className="hover-lift active-press inline-flex cursor-pointer items-center gap-1 rounded-xl border border-indigo-500/30 bg-indigo-50/50 px-2.5 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100/80 dark:border-indigo-500/40 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>새 계획 추가</span>
            </button>
          )}
        </div>

        {/* 계획 리스트 카드 / 탭 그리드 */}
        <div className="flex [scrollbar-width:thin] items-center gap-2.5 overflow-x-auto pt-0.5 pb-1">
          {plans.map((p) => {
            const isSelected = activePlan?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlan(p.id)}
                type="button"
                className={`hover-lift active-press group relative flex shrink-0 cursor-pointer flex-col rounded-2xl p-3 text-left transition-all duration-200 sm:min-w-[240px] ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md ring-2 shadow-indigo-600/20 ring-indigo-500/40 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900'
                    : 'border border-neutral-200/90 bg-white/60 text-neutral-700 hover:border-indigo-300/80 hover:bg-white hover:text-neutral-900 dark:border-neutral-800/90 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:border-indigo-700/80 dark:hover:bg-neutral-800/90 dark:hover:text-neutral-100'
                }`}
              >
                {/* 상단 뱃지 라인 */}
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">{getPriorityBadge(p.priority, isSelected)}</div>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                      선택됨
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-500">
                      클릭하여 전환
                    </span>
                  )}
                </div>

                {/* 제목 */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`line-clamp-1 text-xs font-bold tracking-tight sm:text-sm ${
                      isSelected ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {p.title}
                  </span>
                </div>

                {/* 하단 메타 정보 (기간 & 예상시간) */}
                <div
                  className={`mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] ${
                    isSelected ? 'text-indigo-100/90' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0 opacity-80" />
                    <span>{p.start_date === p.end_date ? p.start_date : `${p.start_date} ~ ${p.end_date}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0 opacity-80" />
                    <span>{formatMinutes(p.estimated_minutes)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
