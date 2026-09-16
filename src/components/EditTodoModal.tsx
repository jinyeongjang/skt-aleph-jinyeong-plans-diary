import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, X } from 'lucide-react';
import type { Todo, Priority } from '../types/pds.ts';

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo;
  onUpdateTodo: (id: string, data: Partial<Todo>) => Promise<Todo>;
}

export const EditTodoModal: React.FC<EditTodoModalProps> = ({ isOpen, onClose, todo, onUpdateTodo }) => {
  const [content, setContent] = useState(todo.content);
  const [dueDate, setDueDate] = useState(todo.due_date);
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [tags, setTags] = useState(todo.tags.join(', '));
  const [estimatedMinutes, setEstimatedMinutes] = useState(todo.estimated_minutes);

  useEffect(() => {
    const timer = setTimeout(() => {
      setContent(todo.content);
      setDueDate(todo.due_date);
      setPriority(todo.priority);
      setTags(todo.tags.join(', '));
      setEstimatedMinutes(todo.estimated_minutes);
    }, 0);
    return () => clearTimeout(timer);
  }, [todo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await onUpdateTodo(todo.id, {
      content: content.trim(),
      due_date: dueDate,
      priority,
      tags: parsedTags.length > 0 ? parsedTags : ['일반'],
      estimated_minutes: Number(estimatedMinutes),
    });

    onClose();
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/60 p-4 duration-200 sm:p-6"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:border-neutral-800/90 dark:bg-neutral-900 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
        {/* Top Rimlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-neutral-200/80 px-6 py-5 dark:border-neutral-800/80">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-50 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
                  할 일 내용 고치기
                </h3>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  T06-C10
                </span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                내용·마감일·우선순위·태그·예상 시간을 수정합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
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
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                  className="w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-xs text-neutral-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                    onClick={() => setPriority('high')}
                    className={`hover-lift active-press flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all ${
                      priority === 'high'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${priority === 'high' ? 'bg-white' : 'bg-rose-500'}`} />
                    높음
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('medium')}
                    className={`hover-lift active-press flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all ${
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
                    onClick={() => setPriority('low')}
                    className={`hover-lift active-press flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all ${
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
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  태그 (쉼표 구분) (T06-C16)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:text-neutral-100 dark:focus:bg-neutral-900"
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
                  className="w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:text-neutral-100 dark:focus:bg-neutral-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-neutral-200/80 px-6 py-4 dark:border-neutral-800/80">
            <button
              type="button"
              onClick={onClose}
              className="hover-lift active-press cursor-pointer rounded-2xl border border-neutral-200/80 bg-neutral-100/80 px-4.5 py-2.5 text-xs font-semibold text-neutral-700 transition-all hover:bg-neutral-200 dark:border-neutral-800/80 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              취소
            </button>
            <button
              type="submit"
              className="hover-lift active-press cursor-pointer rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500"
            >
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
