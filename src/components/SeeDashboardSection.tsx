import React, { useState, useEffect } from 'react';
import {
  PieChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  MousePointerClick,
  Sparkles,
  Save,
} from 'lucide-react';
import type { SeeMetrics, Review } from '../types/pds.ts';
import { formatMinutes } from '../utils/dateUtils';

interface SeeDashboardSectionProps {
  planId: string;
  metrics: SeeMetrics;
  reviews: Review[];
  onSelectMetricFilter: (mode: 'all' | 'pending' | 'completed' | 'delayed' | 'blocked') => void;
  onSaveReviewAndTransfer: (note: string) => Promise<void>;
}

export const SeeDashboardSection: React.FC<SeeDashboardSectionProps> = ({
  metrics,
  reviews,
  onSelectMetricFilter,
  onSaveReviewAndTransfer,
}) => {
  const [nextActionNote, setNextActionNote] = useState(reviews.length > 0 ? reviews[0].next_action_note : '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNextActionNote(reviews.length > 0 ? reviews[0].next_action_note : '');
    }, 0);
    return () => clearTimeout(timer);
  }, [reviews]);

  const handleTransferToNextPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextActionNote.trim()) return;
    setIsSaving(true);
    try {
      await onSaveReviewAndTransfer(nextActionNote.trim());
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToTodosWithFilter = (mode: 'all' | 'completed' | 'delayed' | 'blocked') => {
    onSelectMetricFilter(mode);
    const element = document.getElementById('todo-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isOverTime = metrics.varianceMinutes > 0;

  return (
    <section
      id="see-section"
      className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-2xl transition-all duration-300 sm:p-8 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
    >
      {/* 상단 은은한 림라이트 (유리 반사 효과) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      {/* Decorative subtle ambient background */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-400/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-400/15"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-neutral-200/70 pb-6 sm:flex-row sm:items-center dark:border-white/[0.08]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-fuchsia-500/15 text-purple-600 shadow-inner backdrop-blur-md dark:border-purple-400/30 dark:text-purple-400">
            <PieChart className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
                카드 4 — See (돌아보기, 그리고 다음 계획으로)
              </span>
              <span className="glass-pill inline-flex items-center gap-1 rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> T06-C28~C33, T06-C83 충족
              </span>
            </div>
            <h2 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
              돌아보기 대시보드
              <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                (숫자를 누르면 해당 근거 기록으로 즉시 이동합니다)
              </span>
            </h2>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-purple-500/25 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-700 shadow-2xs backdrop-blur-md sm:self-auto dark:border-purple-400/30 dark:bg-purple-500/15 dark:text-purple-300">
          <MousePointerClick className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>T06-C83 인터랙티브 드릴다운</span>
        </div>
      </div>

      {/* 4대 주요 집계 카드 (T06-C28, T06-C29, T06-C30, T06-C31, T06-C83) */}
      <div className="relative z-10 mt-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* T06-C28: 계획 수 */}
        <button
          type="button"
          onClick={() => scrollToTodosWithFilter('all')}
          className="hover-lift active-press group dark:bg-neutral-850/60 cursor-pointer rounded-2xl border border-white/80 bg-white/60 p-4.5 text-left shadow-xs backdrop-blur-md transition-all hover:border-indigo-400/50 hover:bg-white/85 hover:shadow-md dark:border-white/10 dark:hover:border-indigo-500/40 dark:hover:bg-neutral-800/80"
          title="클릭하여 전체 할 일 목록 보기"
        >
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span>계획 할 일 수 (T06-C28)</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-400">
              <PieChart className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
              {metrics.totalPlanTodos}
            </span>
            <span className="text-xs font-semibold text-neutral-500">건</span>
          </div>
          <span className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 transition-all group-hover:translate-x-0.5 dark:text-indigo-400">
            전체 목록으로 이동 <ArrowRight className="h-3 w-3" />
          </span>
        </button>

        {/* T06-C29: 완료 수 */}
        <button
          type="button"
          onClick={() => scrollToTodosWithFilter('completed')}
          className="hover-lift active-press group cursor-pointer rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4.5 text-left shadow-xs backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:hover:border-emerald-500/35"
          title="클릭하여 완료된 할 일 보기"
        >
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span>완료 수 (T06-C29)</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-700 sm:text-4xl dark:text-emerald-300">
              {metrics.completedTodos}
            </span>
            <span className="text-xs font-semibold text-emerald-600">건</span>
          </div>
          <span className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 transition-all group-hover:translate-x-0.5 dark:text-emerald-400">
            완료 목록으로 이동 <ArrowRight className="h-3 w-3" />
          </span>
        </button>

        {/* T06-C30: 마감 지연 수 */}
        <button
          type="button"
          onClick={() => scrollToTodosWithFilter('delayed')}
          className="hover-lift active-press group cursor-pointer rounded-2xl border border-rose-500/25 bg-rose-500/8 p-4.5 text-left shadow-xs backdrop-blur-md transition-all hover:border-rose-500/40 hover:bg-rose-500/15 hover:shadow-md dark:border-rose-500/20 dark:bg-rose-500/10 dark:hover:border-rose-500/35"
          title="클릭하여 마감 지연 건 보기"
        >
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-rose-700 dark:text-rose-300">
            <span>지연 수 (T06-C30)</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <Flame className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-rose-700 sm:text-4xl dark:text-rose-300">
              {metrics.delayedTodos}
            </span>
            <span className="text-xs font-semibold text-rose-600">건</span>
          </div>
          <span className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-rose-700 transition-all group-hover:translate-x-0.5 dark:text-rose-400">
            지연 목록으로 이동 <ArrowRight className="h-3 w-3" />
          </span>
        </button>

        {/* T06-C31: 막힘 수 */}
        <button
          type="button"
          onClick={() => scrollToTodosWithFilter('blocked')}
          className="hover-lift active-press group cursor-pointer rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4.5 text-left shadow-xs backdrop-blur-md transition-all hover:border-amber-500/40 hover:bg-amber-500/15 hover:shadow-md dark:border-amber-500/20 dark:bg-amber-500/10 dark:hover:border-amber-500/35"
          title="클릭하여 막힌 이유가 있는 건 보기"
        >
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-amber-700 dark:text-amber-300">
            <span>막힘 수 (T06-C31)</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-700 sm:text-4xl dark:text-amber-300">
              {metrics.blockedTodos}
            </span>
            <span className="text-xs font-semibold text-amber-600">건</span>
          </div>
          <span className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-amber-700 transition-all group-hover:translate-x-0.5 dark:text-amber-400">
            막힘 목록으로 이동 <ArrowRight className="h-3 w-3" />
          </span>
        </button>
      </div>

      {/* T06-C32: 예상 시간 vs 실제 시간 차이 분석 패널 */}
      <div className="dark:bg-neutral-850/60 relative z-10 mt-5 rounded-2xl border border-white/80 bg-white/60 p-5 shadow-xs backdrop-blur-md dark:border-white/10">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">시간 오차 분석 (T06-C32)</h3>
          </div>
          <span className="font-mono text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            공식: 실제 시간 - 예상 시간
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200/70 bg-white/70 p-3.5 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/70">
            <span className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
              총 예상 시간 (계획)
            </span>
            <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {formatMinutes(metrics.totalEstimatedMinutes)} ({metrics.totalEstimatedMinutes}분)
            </span>
          </div>

          <div className="rounded-xl border border-neutral-200/70 bg-white/70 p-3.5 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/70">
            <span className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
              총 실제 시간 (실행)
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {formatMinutes(metrics.totalActualMinutes)} ({metrics.totalActualMinutes}분)
            </span>
          </div>

          <div
            className={`rounded-xl border p-3.5 backdrop-blur-xs ${
              isOverTime
                ? 'border-rose-300/80 bg-rose-50/70 dark:border-rose-800/80 dark:bg-rose-950/30'
                : 'border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-800/80 dark:bg-emerald-950/30'
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">시간 오차 (차이)</span>
              {isOverTime ? (
                <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </div>
            <span
              className={`text-base font-black ${isOverTime ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
            >
              {metrics.varianceMinutes > 0
                ? `+${metrics.varianceMinutes}분 초과`
                : `${metrics.varianceMinutes}분 (단축/일치)`}
            </span>
          </div>
        </div>
      </div>

      {/* T06-C33: 돌아보기에서 정한 고칠 점 한 건이 다음 계획으로 넘어간다 */}
      <div className="relative z-10 mt-5 rounded-2xl border border-purple-500/25 bg-purple-500/[0.07] p-5 shadow-xs backdrop-blur-md dark:border-purple-400/25 dark:bg-purple-500/10">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:bg-purple-400/20 dark:text-purple-300">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            다음 계획으로 넘길 고칠 점 한 줄 (T06-C33)
          </h3>
        </div>
        <p className="mb-3.5 text-xs text-neutral-600 dark:text-neutral-300">
          돌아보기에서 발견한 차이(예: 예상 시간 초과, 반복되는 막힘 요인)를 분석하여 다음 계획 수립에 반영할 개선안을
          정합니다.
        </p>

        <form onSubmit={handleTransferToNextPlan} className="space-y-3.5">
          <div>
            <textarea
              rows={2}
              value={nextActionNote}
              onChange={(e) => setNextActionNote(e.target.value)}
              placeholder="예: 실제 구현 시간이 예상보다 길어지는 경향이 있으므로, 할 일 단위를 30분 미만 세부 액션으로 쪼개어 계획하기"
              className="w-full rounded-2xl border border-neutral-300/80 bg-white/80 px-3.5 py-2.5 text-xs text-neutral-900 shadow-2xs backdrop-blur-xs transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 sm:text-sm dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-100 dark:focus:bg-neutral-800"
              required
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            {saveSuccessMsg ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                회고가 저장되었으며, 새 계획 작성 폼에 자동 연계되었습니다!
              </span>
            ) : (
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                저장 시 새 계획 생성 모달이 열리며 성공 기준에 자동으로 반영됩니다.
              </span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="hover-lift active-press group inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/25 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 sm:w-auto"
            >
              <Save className="h-3.5 w-3.5" />
              <span>고칠 점 저장 후 다음 계획으로 넘기기 (T06-C33)</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
