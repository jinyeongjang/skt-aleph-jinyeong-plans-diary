import React, { useState } from 'react';
import {
  Target,
  Calendar,
  Clock,
  Award,
  Edit3,
  History,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { Plan, PlanRevision, Priority } from '../types/pds.ts';
import { formatMinutes } from '../utils/dateUtils.ts';
import { PlanRevisionModal } from './PlanRevisionModal';
import { NewPlanModal } from './NewPlanModal';
import { EditPlanModal } from './EditPlanModal';

interface PlanSectionProps {
  currentPlan: Plan | null;
  revisions: PlanRevision[];
  onUpdatePlan: (data: Partial<Omit<Plan, 'id' | 'created_at'>>) => Promise<void>;
  onCreatePlan: (data: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => Promise<Plan | void>;
  prefilledNextActionNote?: string;
  onClearPrefilledNote?: () => void;
}

export const PlanSection: React.FC<PlanSectionProps> = ({
  currentPlan,
  revisions,
  onUpdatePlan,
  onCreatePlan,
  prefilledNextActionNote,
  onClearPrefilledNote,
}) => {
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);

  // Check if there is prefilled note from See (T06-C33)
  React.useEffect(() => {
    if (prefilledNextActionNote) {
      const timer = setTimeout(() => {
        setIsNewPlanModalOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [prefilledNextActionNote]);

  if (!currentPlan) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-8 text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-2xl sm:p-10 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* 미세 앰비언트 데코 */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-md space-y-4 py-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-600 shadow-inner backdrop-blur-md dark:border-indigo-400/30 dark:text-indigo-400">
            <Target className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              등록된 계획이 없습니다
            </h3>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              목표와 일정을 포함한 새 계획을 수립하여 플랜두씨 다이어리의 선순환 루프를 시작해보세요.
            </p>
          </div>
          <button
            onClick={() => setIsNewPlanModalOpen(true)}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-indigo-600"
          >
            <PlusCircle className="h-4 w-4" />
            <span>새 계획 세우기</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>

        <NewPlanModal
          isOpen={isNewPlanModalOpen}
          onClose={() => setIsNewPlanModalOpen(false)}
          onCreatePlan={onCreatePlan}
          prefilledNextActionNote={prefilledNextActionNote}
          onClearPrefilledNote={onClearPrefilledNote}
        />
      </section>
    );
  }

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          chip: 'bg-rose-500/15 text-rose-700 border-rose-300/40 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/40',
          dot: 'bg-rose-500 ring-2 ring-rose-300/50',
          cardBorder: 'hover:border-rose-400/50 dark:hover:border-rose-500/40',
          label: 'High (높음)',
        };
      case 'medium':
        return {
          chip: 'bg-amber-500/15 text-amber-700 border-amber-300/40 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/40',
          dot: 'bg-amber-500 ring-2 ring-amber-300/50',
          cardBorder: 'hover:border-amber-400/50 dark:hover:border-amber-500/40',
          label: 'Medium (보통)',
        };
      case 'low':
      default:
        return {
          chip: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/40 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/40',
          dot: 'bg-emerald-500 ring-2 ring-emerald-300/50',
          cardBorder: 'hover:border-emerald-400/50 dark:hover:border-emerald-500/40',
          label: 'Low (낮음)',
        };
    }
  };

  const priorityStyle = getPriorityStyle(currentPlan.priority);

  return (
    <section
      id="plan-section"
      className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-2xl transition-all duration-300 sm:p-8 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
    >
      {/* 상단 은은한 림라이트 (유리 반사 효과) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      {/* Decorative subtle ambient background */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-400/15"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-neutral-200/70 pb-6 sm:flex-row sm:items-center dark:border-white/[0.08]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-violet-500/15 text-indigo-600 shadow-inner backdrop-blur-md dark:border-indigo-400/30 dark:text-indigo-400">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                카드 1 — Plan (계획 세우기)
              </span>
              <span className="glass-pill inline-flex items-center gap-1 rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> T06-C04~C08 충족
              </span>
            </div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
              {currentPlan.title}
            </h2>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <button
            onClick={() => setIsRevisionModalOpen(true)}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/60 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-neutral-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08] dark:hover:text-neutral-100"
          >
            <History className="h-3.5 w-3.5 text-indigo-500" />
            <span>수정 이력 ({revisions.length}건)</span>
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-indigo-600"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>계획 수정</span>
          </button>
          <button
            data-action="new-plan"
            onClick={() => setIsNewPlanModalOpen(true)}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-800/20 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs backdrop-blur-md transition-all hover:bg-neutral-800 dark:border-white/20 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>새 계획</span>
          </button>
        </div>
      </div>

      {/* Plan 4 Essential Attributes Grid (T06-C04 ~ T06-C07) */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* T06-C04: 기간 저장 */}
        <div className="hover-lift group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/60 p-4.5 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-indigo-400/50 hover:bg-white/85 hover:shadow-md hover:shadow-indigo-500/5 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-indigo-400/40 dark:hover:bg-white/[0.07]">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 backdrop-blur-xs dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-400">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <span>계획 기간 (T06-C04)</span>
              </div>
              <span className="glass-pill rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                기간
              </span>
            </div>
            <div className="mt-1 font-mono text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {currentPlan.start_date === currentPlan.end_date
                ? currentPlan.start_date
                : `${currentPlan.start_date} ~ ${currentPlan.end_date}`}
            </div>
          </div>
        </div>

        {/* T06-C05: 우선순위 저장 */}
        <div
          className={`hover-lift group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/60 p-4.5 shadow-xs backdrop-blur-xl transition-all duration-200 hover:bg-white/85 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.07] ${priorityStyle.cardBorder}`}
        >
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 backdrop-blur-xs dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <span>우선순위 (T06-C05)</span>
              </div>
            </div>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold shadow-2xs backdrop-blur-xs ${priorityStyle.chip}`}
              >
                <span className={`h-2 w-2 rounded-full ${priorityStyle.dot}`} />
                {priorityStyle.label}
              </span>
            </div>
          </div>
        </div>

        {/* T06-C07: 예상 시간 저장 */}
        <div className="hover-lift group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/60 p-4.5 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-violet-400/50 hover:bg-white/85 hover:shadow-md hover:shadow-violet-500/5 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-violet-400/40 dark:hover:bg-white/[0.07]">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-600 backdrop-blur-xs dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-400">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <span>총 예상 시간 (T06-C07)</span>
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5 text-neutral-900 dark:text-neutral-100">
              <span className="text-base font-extrabold tracking-tight">
                {formatMinutes(currentPlan.estimated_minutes)}
              </span>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                ({currentPlan.estimated_minutes}분)
              </span>
            </div>
          </div>
        </div>

        {/* T06-C06: 성공 기준 저장 */}
        <div className="hover-lift group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/60 p-4.5 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-amber-400/50 hover:bg-white/85 hover:shadow-md hover:shadow-amber-500/5 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-amber-400/40 dark:hover:bg-white/[0.07]">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 backdrop-blur-xs dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-400">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <span>성공 기준 (T06-C06)</span>
              </div>
            </div>
            <p
              className="mt-1 line-clamp-2 text-xs leading-relaxed font-medium text-neutral-700 dark:text-neutral-300"
              title={currentPlan.success_criteria}
            >
              {currentPlan.success_criteria}
            </p>
          </div>
        </div>
      </div>

      {/* Revision History Modal */}
      <PlanRevisionModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        currentPlan={currentPlan}
        revisions={revisions}
      />

      {/* Edit Plan Modal */}
      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentPlan={currentPlan}
        onUpdatePlan={onUpdatePlan}
      />

      {/* New Plan Modal (T06-C33 피드백 연계) */}
      <NewPlanModal
        isOpen={isNewPlanModalOpen}
        onClose={() => setIsNewPlanModalOpen(false)}
        onCreatePlan={onCreatePlan}
        prefilledNextActionNote={prefilledNextActionNote}
        onClearPrefilledNote={onClearPrefilledNote}
      />
    </section>
  );
};
