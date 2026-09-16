import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Tag } from 'lucide-react';
import type { Todo, Priority } from '../types/pds.ts';
import { getSeoulTodayString } from '../utils/dateUtils.ts';
import { LoadingProcessModal, type LoadingStep } from './LoadingProcessModal.tsx';

interface NewTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  onCreateTodo: (
    todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'is_deleted' | 'status'> & {
      status?: Todo['status'];
    },
  ) => Promise<Todo>;
}

const DEFAULT_TAGS = '네트워크, 보안, AI';
const SUGGESTED_TAGS = ['네트워크', '보안', 'AI', '인프라', '리눅스'];

const TODO_LOADING_STEPS: LoadingStep[] = [
  {
    id: 'validate',
    label: '1단계: 할 일 데이터 및 속성 검증',
    desc: '마감일, 우선순위, 태그, 예상 시간 유효성을 확인합니다.',
  },
  {
    id: 'persist',
    label: '2단계: DB 및 스토리지 영속화',
    desc: 'PostgreSQL DB와 로컬 스토어에 할 일 레코드를 안전하게 저장합니다.',
  },
  {
    id: 'sync',
    label: '3단계: 할 일 목록 및 집계 동기화',
    desc: '새 할 일을 목록에 반영하고 대시보드 통계를 갱신합니다.',
  },
];

export const NewTodoModal: React.FC<NewTodoModalProps> = ({ isOpen, onClose, planId, onCreateTodo }) => {
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState(getSeoulTodayString());
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  // 로딩 프로세스 모달 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitProgress(15);
    setCurrentStepIndex(0);

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      // 1단계: 할 일 데이터 유효성 검증 시각화
      await new Promise((resolve) => setTimeout(resolve, 200));
      setSubmitProgress(45);
      setCurrentStepIndex(1);

      // 2단계: 실제 DB / 스토어 생성 호출
      const todoPromise = onCreateTodo({
        plan_id: planId,
        content: content.trim(),
        due_date: dueDate || getSeoulTodayString(),
        priority,
        tags: parsedTags.length > 0 ? parsedTags : ['네트워크', '보안', 'AI'],
        estimated_minutes: Number(estimatedMinutes) || 60,
      });

      await Promise.all([todoPromise, new Promise((resolve) => setTimeout(resolve, 350))]);

      // 3단계: 화면 동기화 시각화
      setSubmitProgress(85);
      setCurrentStepIndex(2);
      await new Promise((resolve) => setTimeout(resolve, 250));

      // 완료
      setSubmitProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setContent('');
      setTags(DEFAULT_TAGS);
      onClose();
    } catch (error) {
      console.error('할 일 등록 중 오류 발생:', error);
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
      setCurrentStepIndex(0);
    }
  };

  const handleToggleTag = (tagToToggle: string) => {
    if (isSubmitting) return;
    const currentTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (currentTags.includes(tagToToggle)) {
      const filtered = currentTags.filter((t) => t !== tagToToggle);
      setTags(filtered.join(', '));
    } else {
      setTags([...currentTags, tagToToggle].join(', '));
    }
  };

  return (
    <>
      {createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) onClose();
          }}
          className="animate-in fade-in fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/60 p-4 duration-200 sm:p-6"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:border-neutral-800/90 dark:bg-neutral-900 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
            {/* Top Rimlight */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
              aria-hidden="true"
            />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-neutral-200/80 px-6 py-5 dark:border-neutral-800/80">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
                      새 할 일 만들기
                    </h3>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      T06-C09
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    마감일·우선순위·태그·예상 시간을 지정하여 생성합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="custom-scrollbar relative flex flex-col overflow-y-auto">
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    할 일 내용
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="예: 리눅스 방화벽 iptables 규칙 검증 및 포트 포워딩 실습"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:text-neutral-100 dark:focus:bg-neutral-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      마감일 (T06-C14)
                    </label>
                    <input
                      type="date"
                      disabled={isSubmitting}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-xs text-neutral-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:text-neutral-100 dark:focus:bg-neutral-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      우선순위 (T06-C15)
                    </label>
                    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-neutral-200/80 bg-neutral-100/80 p-1 dark:border-neutral-800/80 dark:bg-neutral-950/80">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setPriority('high')}
                        className={`hover-lift active-press flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                          priority === 'high'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${priority === 'high' ? 'bg-white' : 'bg-rose-500'}`}
                        />
                        높음
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setPriority('medium')}
                        className={`hover-lift active-press flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                          priority === 'medium'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${priority === 'medium' ? 'bg-white' : 'bg-amber-500'}`}
                        />
                        보통
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setPriority('low')}
                        className={`hover-lift active-press flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                          priority === 'low'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${priority === 'low' ? 'bg-white' : 'bg-emerald-500'}`}
                        />
                        낮음
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        태그 (쉼표 구분) (T06-C16)
                      </label>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">클릭하여 선택</span>
                    </div>
                    <input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="네트워크, 보안, AI"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:text-neutral-100 dark:focus:bg-neutral-900"
                    />
                    {/* 빠른 태그 프리셋 칩 */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.map((tag) => {
                        const activeTags = tags
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean);
                        const isSelected = activeTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleToggleTag(tag)}
                            className={`hover-lift active-press inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                              isSelected
                                ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'border border-neutral-200/80 bg-neutral-100/70 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-200/70 dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-400 dark:hover:bg-neutral-700'
                            }`}
                          >
                            <Tag className="h-2.5 w-2.5 opacity-60" />
                            <span>#{tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      예상 시간(분) (T06-C17)
                    </label>
                    <input
                      type="number"
                      disabled={isSubmitting}
                      min="1"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                      className="w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:text-neutral-100 dark:focus:bg-neutral-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-neutral-200/80 px-6 py-4 dark:border-neutral-800/80">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="hover-lift active-press cursor-pointer rounded-2xl border border-neutral-200/80 bg-neutral-100/80 px-4.5 py-2.5 text-xs font-semibold text-neutral-700 transition-all hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800/80 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hover-lift active-press inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  새 할 일 등록
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}

      {/* 할 일 등록 전용 로딩 프로세스 모달 */}
      <LoadingProcessModal
        isOpen={isSubmitting}
        title="새 할 일을 등록하고 있습니다"
        subtitle="할 일 속성을 안전하게 저장하고 목록을 동기화합니다"
        theme="emerald"
        progress={submitProgress}
        currentStepIndex={currentStepIndex}
        steps={TODO_LOADING_STEPS}
      />
    </>
  );
};
