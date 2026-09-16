import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import type { Todo, Priority } from '../types/pds.ts';
import { getSeoulTodayString } from '../utils/dateUtils.ts';

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

export const NewTodoModal: React.FC<NewTodoModalProps> = ({ isOpen, onClose, planId, onCreateTodo }) => {
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState(getSeoulTodayString());
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState('Frontend, UI');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await onCreateTodo({
      plan_id: planId,
      content: content.trim(),
      due_date: dueDate || getSeoulTodayString(),
      priority,
      tags: parsedTags.length > 0 ? parsedTags : ['일반'],
      estimated_minutes: Number(estimatedMinutes) || 60,
    });

    setContent('');
    setTags('Frontend, UI');
    onClose();
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/60 p-4 duration-200 sm:p-6"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
                  새 할 일 만들기
                </h3>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  T06-C09
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                마감일·우선순위·태그·예상 시간을 지정하여 생성합니다.
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
                할 일 내용
              </label>
              <input
                type="text"
                placeholder="예: Supabase 연결 설정 및 RLS 정책 검증"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  우선순위 (T06-C15)
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
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  태그 (쉼표 구분) (T06-C16)
                </label>
                <input
                  type="text"
                  placeholder="DB, Frontend, Test"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  예상 시간(분) (T06-C17)
                </label>
                <input
                  type="number"
                  min="1"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:bg-neutral-900"
                  required
                />
              </div>
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
              className="hover-lift cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-500"
            >
              할 일 등록
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
