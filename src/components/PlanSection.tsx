import React, { useState } from 'react';
import { Target, Calendar, Clock, Award, Edit3, History, CheckCircle2, PlusCircle, TrendingUp } from 'lucide-react';
import type { Plan, PlanRevision, Priority } from '../types/pds.ts';
import { formatMinutes } from '../utils/dateUtils';
import { PlanRevisionModal } from './PlanRevisionModal';

interface PlanSectionProps {
  currentPlan: Plan | null;
  revisions: PlanRevision[];
  onUpdatePlan: (data: Partial<Omit<Plan, 'id' | 'created_at'>>) => Promise<void>;
  onCreatePlan: (data: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
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
  const [editStartDate, setEditStartDate] = useState(currentPlan?.start_date || '');
  const [editEndDate, setEditEndDate] = useState(currentPlan?.end_date || '');
  const [editPriority, setEditPriority] = useState<Priority>(currentPlan?.priority || 'high');
  const [editSuccessCriteria, setEditSuccessCriteria] = useState(currentPlan?.success_criteria || '');
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState(currentPlan?.estimated_minutes || 0);

  // New plan form state
  const [newTitle, setNewTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('high');
  const [newSuccessCriteria, setNewSuccessCriteria] = useState('');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(180);

  // Check if there is prefilled note from See (T06-C33)
  React.useEffect(() => {
    if (prefilledNextActionNote) {
      const timer = setTimeout(() => {
        setNewSuccessCriteria(`[이전 돌아보기 반영 개선점]: ${prefilledNextActionNote}`);
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
      title: editTitle,
      start_date: editStartDate,
      end_date: editEndDate,
      priority: editPriority,
      success_criteria: editSuccessCriteria,
      estimated_minutes: Number(editEstimatedMinutes),
    });
    setIsEditModalOpen(false);
  };

  const handleCreateNewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreatePlan({
      title: newTitle,
      start_date: newStartDate,
      end_date: newEndDate,
      priority: newPriority,
      success_criteria: newSuccessCriteria,
      estimated_minutes: Number(newEstimatedMinutes),
    });
    setIsNewPlanModalOpen(false);
    if (onClearPrefilledNote) onClearPrefilledNote();
  };

  if (!currentPlan) {
    return (
      <section className="rounded-2xl border border-neutral-200/80 bg-white/80 p-6 text-center backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/80">
        <p className="text-neutral-500">등록된 계획이 없습니다.</p>
      </section>
    );
  }

  const priorityColor =
    currentPlan.priority === 'high'
      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800'
      : currentPlan.priority === 'medium'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  return (
    <section
      id="plan-section"
      className="rounded-3xl border border-neutral-200/80 bg-white/80 p-6 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all sm:p-7 dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.3)]"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200/80 pb-5 sm:flex-row sm:items-center dark:border-neutral-800/80">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shadow-inner dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-400">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                카드 1 — Plan (계획 세우기)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> T06-C04~C08 충족
              </span>
            </div>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
              {currentPlan.title}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRevisionModalOpen(true)}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-xs transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
            onClick={() => {
              setNewTitle('');
              setNewStartDate(new Date().toISOString().slice(0, 10));
              setNewEndDate(new Date().toISOString().slice(0, 10));
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

      {/* Plan Details Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* T06-C04: 기간 저장 */}
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4 transition-all hover:border-neutral-300/80 hover:bg-neutral-50/90 dark:border-neutral-800/70 dark:bg-neutral-950/50 dark:hover:border-neutral-700/80">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span>계획 기간 (T06-C04)</span>
          </div>
          <div className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {currentPlan.start_date} ~ {currentPlan.end_date}
          </div>
        </div>

        {/* T06-C05: 우선순위 저장 */}
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4 transition-all hover:border-neutral-300/80 hover:bg-neutral-50/90 dark:border-neutral-800/70 dark:bg-neutral-950/50 dark:hover:border-neutral-700/80">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            <span>우선순위 (T06-C05)</span>
          </div>
          <div>
            <span
              className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-bold uppercase shadow-2xs ${priorityColor}`}
            >
              {currentPlan.priority}
            </span>
          </div>
        </div>

        {/* T06-C07: 예상 시간 저장 */}
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4 transition-all hover:border-neutral-300/80 hover:bg-neutral-50/90 dark:border-neutral-800/70 dark:bg-neutral-950/50 dark:hover:border-neutral-700/80">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>총 예상 시간 (T06-C07)</span>
          </div>
          <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {formatMinutes(currentPlan.estimated_minutes)} ({currentPlan.estimated_minutes}분)
          </div>
        </div>

        {/* T06-C06: 성공 기준 저장 */}
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4 transition-all hover:border-neutral-300/80 hover:bg-neutral-50/90 dark:border-neutral-800/70 dark:bg-neutral-950/50 dark:hover:border-neutral-700/80">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <Award className="h-4 w-4 text-indigo-500" />
            <span>성공 기준 (T06-C06)</span>
          </div>
          <p
            className="line-clamp-2 text-xs font-medium text-neutral-700 dark:text-neutral-300"
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

      {/* Edit Modal (T06-C08 원본 보존 트리거) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl transition-all sm:p-7 dark:border-neutral-800/90 dark:bg-neutral-900/95">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">계획 수정하기</h3>
            <p className="mt-1 mb-5 text-xs text-neutral-500 dark:text-neutral-400">
              계획을 수정하면 기존 내용은 <strong>수정 이력 스냅샷(T06-C08)</strong>으로 자동 보존됩니다.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  계획 제목
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="hover-lift active-press cursor-pointer rounded-xl bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="hover-lift active-press cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
                >
                  수정 저장 (스냅샷 보존)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Plan Modal (T06-C33 피드백 연계) */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl transition-all sm:p-7 dark:border-neutral-800/90 dark:bg-neutral-900/95">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">새 계획 세우기</h3>
            <p className="mt-1 mb-5 text-xs text-neutral-500 dark:text-neutral-400">
              돌아보기(See)에서 얻은 피드백을 반영하여 새로운 목표를 수립합니다.
            </p>

            <form onSubmit={handleCreateNewPlan} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  새 계획 제목
                </label>
                <input
                  type="text"
                  placeholder="예: 다음 스프린트 목표 및 성능 최적화"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
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
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  성공 기준 (돌아보기 피드백 반영 연계 - T06-C33)
                </label>
                <textarea
                  rows={3}
                  value={newSuccessCriteria}
                  onChange={(e) => setNewSuccessCriteria(e.target.value)}
                  placeholder="달성 목표 및 돌아보기에서 도출된 개선점을 입력하세요"
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-sm text-neutral-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="hover-lift active-press cursor-pointer rounded-xl bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="hover-lift active-press cursor-pointer rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                >
                  새 계획 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
