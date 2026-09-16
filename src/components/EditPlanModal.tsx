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
      className="animate-in fade-in fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/60 p-4 duration-200 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-50 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">계획 수정하기</h3>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  T06-C08
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                수정 시 기존 내용은 <span className="font-semibold text-indigo-600 dark:text-indigo-400">스냅샷</span>
                으로 자동 보존됩니다.
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
        <form onSubmit={handleSubmit} className="custom-scrollbar relative flex flex-col overflow-y-auto">
          <div className="space-y-4 p-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                계획 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  우선순위 (T06-C05)
                </label>
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-950">
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      priority === 'high'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    높음
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('medium')}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      priority === 'medium'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    보통
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('low')}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      priority === 'low'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    낮음
                  </button>
                </div>
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
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                placeholder="성공 기준 및 목표를 입력하세요"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
                required
              />
            </div>

            {/* Snapshot preservation notice */}
            <div className="flex items-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-50 p-3 text-xs text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>
                저장 시 이전 계획이 <code>plan_revisions</code> 테이블에 자동으로 안전하게 아카이빙됩니다.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="hover-lift cursor-pointer rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-xs font-semibold text-neutral-600 transition-all hover:bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              취소
            </button>
            <button
              type="submit"
              className="hover-lift cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500"
            >
              계획 수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
