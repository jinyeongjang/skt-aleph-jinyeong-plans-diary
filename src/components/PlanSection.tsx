import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { Plan, PlanRevision, Priority } from '../types/pds.ts';
import { formatMinutes, getSeoulTodayString } from '../utils/dateUtils.ts';
import { PlanRevisionModal } from './PlanRevisionModal';

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

  // Edit form state
  const [editTitle, setEditTitle] = useState(currentPlan?.title || '');
  const [editStartDate, setEditStartDate] = useState(currentPlan?.start_date || getSeoulTodayString());
  const [editEndDate, setEditEndDate] = useState(currentPlan?.end_date || getSeoulTodayString());
  const [editPriority, setEditPriority] = useState<Priority>(currentPlan?.priority || 'high');
  const [editSuccessCriteria, setEditSuccessCriteria] = useState(currentPlan?.success_criteria || '');
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState(currentPlan?.estimated_minutes || 60);

  // New plan form state
  const [newTitle, setNewTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState(getSeoulTodayString());
  const [newEndDate, setNewEndDate] = useState(getSeoulTodayString());
  const [newPriority, setNewPriority] = useState<Priority>('high');
  const [newSuccessCriteria, setNewSuccessCriteria] = useState('');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(180);

  // Check if there is prefilled note from See (T06-C33)
  React.useEffect(() => {
    if (prefilledNextActionNote) {
      const timer = setTimeout(() => {
        setNewSuccessCriteria(`[이전 돌아보기 반영 개선점]: ${prefilledNextActionNote}`);
        setNewStartDate(getSeoulTodayString());
        setNewEndDate(getSeoulTodayString());
        setIsNewPlanModalOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [prefilledNextActionNote]);

  const openEditModal = () => {
    if (!currentPlan) return;
    setEditTitle(currentPlan.title);
    setEditStartDate(currentPlan.start_date);
    setEditEndDate(currentPlan.end_date);
    setEditPriority(currentPlan.priority);
    setEditSuccessCriteria(currentPlan.success_criteria);
    setEditEstimatedMinutes(currentPlan.estimated_minutes);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdatePlan({
      title: editTitle.trim(),
      start_date: editStartDate || getSeoulTodayString(),
      end_date: editEndDate || getSeoulTodayString(),
      priority: editPriority,
      success_criteria: editSuccessCriteria.trim() || '목표 달성',
      estimated_minutes: Number(editEstimatedMinutes) || 60,
    });
    setIsEditModalOpen(false);
  };

  const handleCreateNewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onCreatePlan({
      title: newTitle.trim(),
      start_date: newStartDate || getSeoulTodayString(),
      end_date: newEndDate || getSeoulTodayString(),
      priority: newPriority,
      success_criteria: newSuccessCriteria.trim() || '목표 달성',
      estimated_minutes: Number(newEstimatedMinutes) || 60,
    });
    setNewTitle('');
    setNewSuccessCriteria('');
    setIsNewPlanModalOpen(false);
    if (onClearPrefilledNote) onClearPrefilledNote();
  };

  const renderNewPlanModal = () => {
    if (!isNewPlanModalOpen) return null;
    return createPortal(
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsNewPlanModalOpen(false);
        }}
        className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-md duration-200 sm:p-6"
      >
        <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 dark:border-neutral-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shadow-inner dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-400">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
                  새 계획 세우기
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  돌아보기(See)에서 얻은 피드백을 반영하여 새로운 목표를 수립합니다.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNewPlanModalOpen(false)}
              className="hover-lift flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleCreateNewPlan} className="custom-scrollbar flex flex-col overflow-y-auto">
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  새 계획 제목
                </label>
                <input
                  type="text"
                  placeholder="예: 다음 스프린트 목표 및 성능 최적화"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    우선순위
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                  >
                    <option value="high">High (높음)</option>
                    <option value="medium">Medium (보통)</option>
                    <option value="low">Low (낮음)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    예상 시간(분)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newEstimatedMinutes}
                    onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <span>성공 기준 (T06-C06 / 피드백 연계 T06-C33)</span>
                  {prefilledNextActionNote && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                      <Sparkles className="h-2.5 w-2.5" /> 피드백 자동 승계됨
                    </span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={newSuccessCriteria}
                  onChange={(e) => setNewSuccessCriteria(e.target.value)}
                  placeholder="달성 목표 및 돌아보기에서 도출된 개선점을 입력하세요"
                  className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={() => setIsNewPlanModalOpen(false)}
                className="hover-lift active-press cursor-pointer rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                취소
              </button>
              <button
                type="submit"
                className="hover-lift active-press cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700"
              >
                새 계획 등록
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body,
    );
  };

  if (!currentPlan) {
    return (
      <section className="glass-card relative overflow-hidden rounded-3xl p-8 text-center sm:p-10">
        <div className="mx-auto max-w-md space-y-4 py-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shadow-inner dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-400">
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
            onClick={() => {
              setNewTitle('');
              setNewStartDate(getSeoulTodayString());
              setNewEndDate(getSeoulTodayString());
              setNewSuccessCriteria('');
              setIsNewPlanModalOpen(true);
            }}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>새 계획 세우기</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>
        {renderNewPlanModal()}
      </section>
    );
  }

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          chip: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900',
          dot: 'bg-rose-500',
          cardBorder: 'hover:border-rose-400/40',
          label: 'High (높음)',
        };
      case 'medium':
        return {
          chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900',
          dot: 'bg-amber-500',
          cardBorder: 'hover:border-amber-400/40',
          label: 'Medium (보통)',
        };
      case 'low':
      default:
        return {
          chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
          dot: 'bg-emerald-500',
          cardBorder: 'hover:border-emerald-400/40',
          label: 'Low (낮음)',
        };
    }
  };

  const priorityStyle = getPriorityStyle(currentPlan.priority);

  return (
    <section id="plan-section" className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
      {/* Decorative subtle ambient background */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />

      {/* Section Header */}
      <div className="relative flex flex-col justify-between gap-4 border-b border-neutral-200/80 pb-6 sm:flex-row sm:items-center dark:border-neutral-800/80">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 text-indigo-600 shadow-inner dark:border-indigo-500/30 dark:from-indigo-500/25 dark:to-indigo-500/5 dark:text-indigo-400">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                카드 1 — Plan (계획 세우기)
              </span>
              <span className="glass-pill inline-flex items-center gap-1 rounded-full border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
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
            className="glass-pill hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition-all hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <History className="h-3.5 w-3.5 text-indigo-500" />
            <span>수정 이력 ({revisions.length}건)</span>
          </button>
          <button
            onClick={openEditModal}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-700"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>계획 수정</span>
          </button>
          <button
            data-action="new-plan"
            onClick={() => {
              setNewTitle('');
              setNewStartDate(getSeoulTodayString());
              setNewEndDate(getSeoulTodayString());
              setNewSuccessCriteria('');
              setIsNewPlanModalOpen(true);
            }}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>새 계획</span>
          </button>
        </div>
      </div>

      {/* Plan 4 Essential Attributes Grid (T06-C04 ~ T06-C07) */}
      <div className="relative mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* T06-C04: 기간 저장 */}
        <div className="glass-panel hover-lift group relative overflow-hidden rounded-2xl p-4.5 transition-all duration-200 hover:border-indigo-400/50 hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>계획 기간 (T06-C04)</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">D-Day</span>
          </div>
          <div className="font-mono text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {currentPlan.start_date === currentPlan.end_date
              ? currentPlan.start_date
              : `${currentPlan.start_date} ~ ${currentPlan.end_date}`}
          </div>
        </div>

        {/* T06-C05: 우선순위 저장 */}
        <div
          className={`glass-panel hover-lift group relative overflow-hidden rounded-2xl p-4.5 transition-all duration-200 ${priorityStyle.cardBorder} hover:shadow-md`}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <span>우선순위 (T06-C05)</span>
            </div>
          </div>
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold shadow-2xs ${priorityStyle.chip}`}
            >
              <span className={`h-2 w-2 rounded-full ${priorityStyle.dot}`} />
              {priorityStyle.label}
            </span>
          </div>
        </div>

        {/* T06-C07: 예상 시간 저장 */}
        <div className="glass-panel hover-lift group relative overflow-hidden rounded-2xl p-4.5 transition-all duration-200 hover:border-violet-400/50 hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span>총 예상 시간 (T06-C07)</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 text-neutral-900 dark:text-neutral-100">
            <span className="text-base font-extrabold tracking-tight">
              {formatMinutes(currentPlan.estimated_minutes)}
            </span>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              ({currentPlan.estimated_minutes}분)
            </span>
          </div>
        </div>

        {/* T06-C06: 성공 기준 저장 */}
        <div className="glass-panel hover-lift group relative overflow-hidden rounded-2xl p-4.5 transition-all duration-200 hover:border-amber-400/50 hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Award className="h-3.5 w-3.5" />
              </div>
              <span>성공 기준 (T06-C06)</span>
            </div>
          </div>
          <p
            className="line-clamp-2 text-xs leading-relaxed font-medium text-neutral-700 dark:text-neutral-300"
            title={currentPlan.success_criteria}
          >
            {currentPlan.success_criteria}
          </p>
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
      {isEditModalOpen &&
        createPortal(
          <div
            className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-md duration-200 sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsEditModalOpen(false);
            }}
          >
            <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 dark:border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shadow-inner dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
                      계획 수정하기
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      수정 시 기존 내용은{' '}
                      <strong className="font-semibold text-indigo-600 dark:text-indigo-400">스냅샷(T06-C08)</strong>
                      으로 자동 보존됩니다.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="hover-lift flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEdit} className="custom-scrollbar flex flex-col overflow-y-auto">
                <div className="space-y-4 p-6">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      계획 제목
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        시작일 (T06-C04)
                      </label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        종료일 (T06-C04)
                      </label>
                      <input
                        type="date"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        우선순위 (T06-C05)
                      </label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as Priority)}
                        className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                      >
                        <option value="high">High (높음)</option>
                        <option value="medium">Medium (보통)</option>
                        <option value="low">Low (낮음)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        예상 시간(분) (T06-C07)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editEstimatedMinutes}
                        onChange={(e) => setEditEstimatedMinutes(Number(e.target.value))}
                        className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      성공 기준 (T06-C06)
                    </label>
                    <textarea
                      rows={3}
                      value={editSuccessCriteria}
                      onChange={(e) => setEditSuccessCriteria(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5 text-xs text-neutral-900 shadow-2xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-100 dark:focus:bg-neutral-900"
                      required
                    />
                  </div>

                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-50/40 p-3.5 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-300">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500" />
                      <span>스냅샷 보존 안내</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-indigo-600/90 dark:text-indigo-300/80">
                      계획을 수정하더라도 기존 계획 상태는 원본 스냅샷으로 영구 보관되며 우측 상단 수정 이력 버튼을 통해
                      언제든 열람할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="hover-lift active-press cursor-pointer rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="hover-lift active-press cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700"
                  >
                    수정 저장 (스냅샷 보존)
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* New Plan Modal (T06-C33 피드백 연계) */}
      {renderNewPlanModal()}
    </section>
  );
};
