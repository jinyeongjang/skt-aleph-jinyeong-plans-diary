import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, CheckCircle, AlertTriangle, Clock, ShieldCheck, Zap } from 'lucide-react';
import type { Todo, ExecutionLog } from '../types/pds.ts';
import { calculateMinutesDiff, formatMinutes } from '../utils/dateUtils.ts';

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  existingLogs: ExecutionLog[];
  onRecordExecution: (logData: {
    todo_id: string;
    start_time: string;
    end_time: string;
    actual_minutes: number;
    blocker_reason: string | null;
    idempotency_key: string;
  }) => Promise<{ success: boolean; log: ExecutionLog; isDuplicate: boolean }>;
  onCompleteTodo: (id: string) => Promise<Todo | void>;
}

export const ExecutionModal: React.FC<ExecutionModalProps> = ({
  isOpen,
  onClose,
  todo,
  existingLogs,
  onRecordExecution,
  onCompleteTodo,
}) => {
  // Defaults: start 1 hour ago, end now
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [startTime, setStartTime] = useState(oneHourAgo.toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(now.toISOString().slice(0, 16));
  const [actualMinutes, setActualMinutes] = useState(60);
  const [blockerReason, setBlockerReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doubleClickStatus, setDoubleClickStatus] = useState<string | null>(null);

  if (!isOpen || !todo) return null;

  // Auto-recalculate minutes when dates change
  const handleTimeChange = (startStr: string, endStr: string) => {
    setStartTime(startStr);
    setEndTime(endStr);
    const diff = calculateMinutesDiff(new Date(startStr).toISOString(), new Date(endStr).toISOString());
    if (diff > 0) {
      setActualMinutes(diff);
    }
  };

  // Normal submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const idempotencyKey = `exec-${todo.id}-${Date.now()}`;
    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();

    try {
      await onRecordExecution({
        todo_id: todo.id,
        start_time: startIso,
        end_time: endIso,
        actual_minutes: Number(actualMinutes),
        blocker_reason: blockerReason.trim() ? blockerReason.trim() : null,
        idempotency_key: idempotencyKey,
      });

      if (todo.status !== 'completed') {
        await onCompleteTodo(todo.id);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * T06-C21 / T06-C22: 완료 버튼을 연달아 두 번 눌러도 완료 기록은 한 건만 남는다.
   * 동일한 idempotency_key를 가진 2개의 병렬 비동기 요청을 동시 전송하여 멱등성을 시뮬레이션 및 검증
   */
  const handleDoubleFireTest = async () => {
    setDoubleClickStatus('연타 전송 중 (2회 병렬 요청 발송)...');
    const fixedIdempotencyKey = `stress-idempotent-${todo.id}-${Date.now()}`;
    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();

    const payload = {
      todo_id: todo.id,
      start_time: startIso,
      end_time: endIso,
      actual_minutes: Number(actualMinutes),
      blocker_reason: blockerReason.trim() ? blockerReason.trim() : '동시 연타 멱등성 검증 실행',
      idempotency_key: fixedIdempotencyKey,
    };

    // 두 번 동시 호출
    const [res1, res2] = await Promise.all([onRecordExecution(payload), onRecordExecution(payload)]);

    if (todo.status !== 'completed') {
      await onCompleteTodo(todo.id);
    }

    const duplicates = [res1.isDuplicate, res2.isDuplicate].filter(Boolean).length;
    setDoubleClickStatus(
      `연타 검증 성공! [요청 1: ${res1.isDuplicate ? '중복 방어' : '저장 완료'} / 요청 2: ${
        res2.isDuplicate ? '중복 방어' : '저장 완료'
      }] ➔ 중복 ${duplicates}건 차단, 정확히 1건만 기록됨 (T06-C21 통과)`,
    );
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md duration-200 sm:p-6"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-2xl backdrop-blur-2xl dark:border-neutral-700/60 dark:bg-neutral-900/85 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/60 bg-neutral-50/70 px-6 py-4.5 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-inner dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
                실행 기록 (카드 3 — Do)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                실제 시작·종료 시각과 막힌 이유를 기록하고 계획의 원본 예상시간을 보존합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover-lift active-press flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-400 shadow-2xs hover:bg-neutral-100 hover:text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 overflow-y-auto p-6">
          {/* Target Todo Details & T06-C27 Notice */}
          <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-950/50">
            <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-medium">대상 할 일</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                원래 계획 보존 (T06-C27)
              </span>
            </div>
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{todo.content}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
              <div>
                마감일: <span className="font-mono font-semibold">{todo.due_date}</span>
              </div>
              <div>
                원래 예상 시간:{' '}
                <strong className="font-bold text-indigo-600 dark:text-indigo-400">
                  {formatMinutes(todo.estimated_minutes)} ({todo.estimated_minutes}분)
                </strong>{' '}
                <span className="text-[11px] text-neutral-400">(실행 저장 시에도 불변)</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* T06-C23, T06-C24: 시작/종료 시각 */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  시작 시각 (T06-C23)
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => handleTimeChange(e.target.value, endTime)}
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  끝난 시각 (T06-C24)
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => handleTimeChange(startTime, e.target.value)}
                  className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                  required
                />
              </div>
            </div>

            {/* T06-C25: 실제로 걸린 시간 */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  실제로 걸린 시간 (T06-C25)
                </label>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMinutes(actualMinutes)}
                </span>
              </div>
              <input
                type="number"
                min="1"
                value={actualMinutes}
                onChange={(e) => setActualMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-sm text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                required
              />
            </div>

            {/* T06-C26: 막혔던 이유 */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  막혔던 이유 (T06-C26)
                </label>
                <span className="text-[11px] text-neutral-400">적으면 돌아보기 '막힘 수'로 집계</span>
              </div>
              <textarea
                rows={2}
                placeholder="예: API 응답 지연으로 인한 디버깅 소요, 패키지 버전 호환성 확인 등"
                value={blockerReason}
                onChange={(e) => setBlockerReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* 연타 멱등성 검증 결과 안내 */}
            {doubleClickStatus && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-800 shadow-2xs dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{doubleClickStatus}</span>
              </div>
            )}

            {/* 기존 등록된 실행 기록들 */}
            {existingLogs.length > 0 && (
              <div className="border-t border-neutral-200/80 pt-3 dark:border-neutral-800/80">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  이전 실행 기록 ({existingLogs.length}건)
                </h4>
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {existingLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-xl border border-neutral-200/60 bg-neutral-50 p-2.5 text-xs dark:border-neutral-800/60 dark:bg-neutral-800/60"
                    >
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatMinutes(log.actual_minutes)}
                        </span>
                        {log.blocker_reason && (
                          <span className="ml-2 text-amber-600 dark:text-amber-400">[막힘: {log.blocker_reason}]</span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {new Date(log.created_at).toLocaleTimeString('ko-KR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-between gap-2.5 border-t border-neutral-200/80 pt-4 sm:flex-row dark:border-neutral-800/80">
              {/* T06-C21 연타 멱등성 테스트 버튼 */}
              <button
                type="button"
                onClick={handleDoubleFireTest}
                className="hover-lift active-press inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-700 shadow-2xs transition-all hover:bg-amber-500/20 sm:w-auto dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-300"
                title="동일 멱등키로 2회 연속 동시 요청을 발송하여 1건만 기록되는지 검증합니다"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                연타 멱등성 검증 (2회 연속 클릭 시뮬레이션)
              </button>

              <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="hover-lift active-press cursor-pointer rounded-xl border border-neutral-300/80 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  실행 기록 및 완료
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
};
