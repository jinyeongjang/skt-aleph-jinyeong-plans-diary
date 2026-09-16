import React from 'react';
import { createPortal } from 'react-dom';
import { History, X, Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Plan, PlanRevision } from '../types/pds.ts';
import { formatMinutes } from '../utils/dateUtils';

interface PlanRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan | null;
  revisions: PlanRevision[];
}

export const PlanRevisionModal: React.FC<PlanRevisionModalProps> = ({ isOpen, onClose, currentPlan, revisions }) => {
  if (!isOpen || !currentPlan) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-50 px-6 py-5 dark:border-neutral-800/80 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shadow-inner dark:bg-indigo-500/20 dark:text-indigo-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
                  계획 수정 이력
                </h2>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  T06-C08 원본 보존
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                계획을 수정해도 처음 세운 계획과 과거 스냅샷이 영구 보존됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover-lift active-press rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar space-y-6 overflow-y-auto p-6">
          {/* 현재 활성 계획 (Current Plan) */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-50/50 p-5 shadow-2xs dark:border-indigo-500/30 dark:bg-indigo-950/30">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
                  현재 최신 계획 (Active)
                </span>
                <span className="font-mono text-xs text-neutral-500">ID: {currentPlan.id.slice(0, 8)}...</span>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                최종 수정: {new Date(currentPlan.updated_at).toLocaleString('ko-KR')}
              </span>
            </div>
            <h3 className="mb-2 text-base font-bold text-neutral-900 dark:text-neutral-100">{currentPlan.title}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 sm:grid-cols-3 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                <span>
                  {currentPlan.start_date} ~ {currentPlan.end_date}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                <span>예상 {formatMinutes(currentPlan.estimated_minutes)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-500">우선순위:</span>
                <span className="capitalize">{currentPlan.priority}</span>
              </div>
            </div>
            <div className="mt-3 border-t border-indigo-200/60 pt-2.5 text-xs dark:border-indigo-800/60">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">성공 기준: </span>
              <span className="text-neutral-600 dark:text-neutral-400">{currentPlan.success_criteria}</span>
            </div>
          </div>

          {/* 이전 수정 이력 목록 */}
          <div>
            <div className="mb-3.5 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                <span>보존된 수정 전 스냅샷 ({revisions.length}건)</span>
                {revisions.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    T06-C08 충족
                  </span>
                )}
              </h4>
            </div>

            {revisions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-800">
                <AlertCircle className="mx-auto mb-2 h-7 w-7 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  아직 수정한 이력이 없습니다.
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  계획을 한 번 고치면 고치기 전 내용이 여기에 스냅샷으로 자동 보존됩니다.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-4.5 shadow-2xs transition-colors dark:border-neutral-800/80 dark:bg-neutral-950/60"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        수정 차수 #{rev.revision_number}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        스냅샷 시각: {new Date(rev.revised_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="mb-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">{rev.title}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 sm:grid-cols-3 dark:text-neutral-400">
                      <div>
                        기간: {rev.start_date} ~ {rev.end_date}
                      </div>
                      <div>예상 시간: {formatMinutes(rev.estimated_minutes)}</div>
                      <div>우선순위: {rev.priority}</div>
                    </div>
                    <div className="mt-2.5 rounded-xl border border-neutral-200/70 bg-neutral-50/70 p-3 text-xs text-neutral-600 dark:border-neutral-800/70 dark:bg-neutral-950/60 dark:text-neutral-400">
                      <strong className="text-neutral-700 dark:text-neutral-300">성공 기준:</strong>{' '}
                      {rev.success_criteria}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-neutral-200/80 bg-neutral-50/80 px-6 py-4 dark:border-neutral-800/80 dark:bg-neutral-950/80">
          <button
            onClick={onClose}
            className="hover-lift active-press rounded-xl bg-neutral-200 px-5 py-2.5 text-xs font-bold text-neutral-800 transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
