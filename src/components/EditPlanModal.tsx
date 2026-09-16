import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X, ShieldCheck } from 'lucide-react';
import type { Plan, Priority } from '../types/pds.ts';
import { getSeoulTodayString } from '../utils/dateUtils.ts';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan;
  onUpdatePlan: (data: Partial<Omit<Plan, 'id' | 'created_at'>>) => Promise<void>;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({ isOpen, onClose, currentPlan, onUpdatePlan }) => {
  const [title, setTitle] = useState(currentPlan.title);
  const [startDate, setStartDate] = useState(currentPlan.start_date || getSeoulTodayString());
  const [endDate, setEndDate] = useState(currentPlan.end_date || getSeoulTodayString());
  const [priority, setPriority] = useState<Priority>(currentPlan.priority || 'high');
  const [successCriteria, setSuccessCriteria] = useState(currentPlan.success_criteria || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(currentPlan.estimated_minutes || 60);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(currentPlan.title);
      setStartDate(currentPlan.start_date);
      setEndDate(currentPlan.end_date);
      setPriority(currentPlan.priority);
      setSuccessCriteria(currentPlan.success_criteria);
      setEstimatedMinutes(currentPlan.estimated_minutes);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPlan]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdatePlan({
      title: title.trim(),
      start_date: startDate || getSeoulTodayString(),
      end_date: endDate || getSeoulTodayString(),
      priority,
      success_criteria: successCriteria.trim() || '목표 달성',
      estimated_minutes: Number(estimatedMinutes) || 60,
    });
    onClose();
  };

  return createPortal(
    <div
      className="animate-in fade-in fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-md duration-200 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/85 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/70 px-6 py-5 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-600 shadow-inner backdrop-blur-md dark:border-indigo-400/30 dark:text-indigo-400">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">계획 수정하기</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                수정 시 기존 내용은{' '}
                <strong className="font-semibold text-indigo-600 dark:text-indigo-400">스냅샷(T06-C08)</strong>으로 자동
                보존됩니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover-lift flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="custom-scrollbar flex flex-col overflow-y-auto">
          <div className="space-y-4 p-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                계획 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5 text-xs text-neutral-900 shadow-2xs backdrop-blur-xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs backdrop-blur-xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-100 dark:focus:bg-neutral-900"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  종료일 (T06-C04)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs backdrop-blur-xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs backdrop-blur-xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-2.5 text-xs text-neutral-900 shadow-2xs backdrop-blur-xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5 text-xs text-neutral-900 shadow-2xs backdrop-blur-xs transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-100 dark:focus:bg-neutral-900"
                required
              />
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-50/40 p-3.5 text-xs text-indigo-700 backdrop-blur-xs dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-300">
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

          <div className="flex items-center justify-end gap-2.5 border-t border-neutral-200/70 px-6 py-4 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="hover-lift active-press cursor-pointer rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="hover-lift active-press cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-indigo-600"
            >
              수정 저장 (스냅샷 보존)
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
