import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  RotateCcw,
  Trash2,
  Edit2,
  Plus,
  Search,
  Tag,
  Clock,
  Calendar,
  AlertCircle,
  Play,
  ArrowUpDown,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import type { Todo, ExecutionLog } from '../types/pds.ts';
import { formatMinutes, isTodoDelayed } from '../utils/dateUtils.ts';
import { ExecutionModal } from './ExecutionModal.tsx';
import { NewTodoModal } from './NewTodoModal.tsx';
import { EditTodoModal } from './EditTodoModal.tsx';

interface TodoSectionProps {
  planId: string;
  todos: Todo[];
  executionLogs: ExecutionLog[];
  filterMode: 'all' | 'pending' | 'completed' | 'delayed' | 'blocked';
  onFilterModeChange: (mode: 'all' | 'pending' | 'completed' | 'delayed' | 'blocked') => void;
  onCreateTodo: (
    todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'is_deleted' | 'status'> & {
      status?: Todo['status'];
    },
  ) => Promise<Todo>;
  onUpdateTodo: (id: string, data: Partial<Todo>) => Promise<Todo>;
  onCompleteTodo: (id: string) => Promise<Todo>;
  onRevertTodo: (id: string) => Promise<Todo>;
  onDeleteTodo: (id: string) => Promise<void>;
  onRecordExecution: (logData: {
    todo_id: string;
    start_time: string;
    end_time: string;
    actual_minutes: number;
    blocker_reason: string | null;
    idempotency_key: string;
  }) => Promise<{ success: boolean; log: ExecutionLog; isDuplicate: boolean }>;
}

export const TodoSection: React.FC<TodoSectionProps> = ({
  planId,
  todos,
  executionLogs,
  filterMode,
  onFilterModeChange,
  onCreateTodo,
  onUpdateTodo,
  onCompleteTodo,
  onRevertTodo,
  onDeleteTodo,
  onRecordExecution,
}) => {
  // Search state (T06-C18)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeExecTodo, setActiveExecTodo] = useState<Todo | null>(null);

  // Collect all unique tags for filtering
  const allTags = useMemo(() => {
    const set = new Set<string>();
    todos.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [todos]);

  // Set of blocked todo IDs
  const blockedTodoIds = useMemo(() => {
    const set = new Set<string>();
    executionLogs.forEach((log) => {
      if (log.blocker_reason && log.blocker_reason.trim().length > 0) {
        set.add(log.todo_id);
      }
    });
    return set;
  }, [executionLogs]);

  // Filter and Search logic (T06-C18, T06-C19)
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // 1. Keyword search (T06-C18)
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchContent = todo.content.toLowerCase().includes(query);
        const matchTags = todo.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchContent && !matchTags) return false;
      }

      // 2. Tag filter
      if (selectedTag !== 'all' && !todo.tags.includes(selectedTag)) {
        return false;
      }

      // 3. Priority filter
      if (selectedPriority !== 'all' && todo.priority !== selectedPriority) {
        return false;
      }

      // 4. Status / Metrics filter (T06-C19 & T06-C83 드릴다운)
      if (filterMode === 'completed' && todo.status !== 'completed') return false;
      if (filterMode === 'pending' && todo.status !== 'pending') return false;
      if (filterMode === 'delayed') {
        return isTodoDelayed(todo.due_date, todo.status);
      }
      if (filterMode === 'blocked') {
        return blockedTodoIds.has(todo.id);
      }

      return true;
    });
  }, [todos, searchKeyword, selectedTag, selectedPriority, filterMode, blockedTodoIds]);

  return (
    <section
      id="todo-section"
      className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-2xl transition-all duration-300 sm:p-8 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
    >
      {/* 상단 은은한 림라이트 (유리 반사 효과) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      {/* Decorative subtle ambient glows */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-400/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-400/15"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-neutral-200/70 pb-6 sm:flex-row sm:items-center dark:border-white/[0.08]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-500/15 text-emerald-600 shadow-inner backdrop-blur-md dark:border-emerald-400/30 dark:text-emerald-400">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                카드 2 — Do (할 일 다루기)
              </span>
              <span className="glass-pill inline-flex items-center gap-1 rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> T06-C09~C20 충족
              </span>
            </div>
            <h2 className="mt-1 flex items-center gap-2.5 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
              할 일 목록
              <span className="inline-flex items-center rounded-full border border-neutral-200/80 bg-neutral-100/80 px-2.5 py-0.5 font-mono text-xs font-bold text-neutral-700 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-300">
                {filteredTodos.length} / {todos.length}
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="hover-lift active-press group inline-flex cursor-pointer items-center gap-2 self-start rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-500 sm:self-auto"
        >
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          <span>할 일 추가 (T06-C09)</span>
        </button>
      </div>

      {/* T06-C20: 화면에 밝혀 둔 정렬 기준 고지 배너 */}
      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.07] px-4 py-3 text-xs shadow-xs backdrop-blur-md dark:border-indigo-400/20 dark:bg-indigo-500/10">
        <div className="flex items-center gap-2.5 font-medium text-indigo-950 dark:text-indigo-200">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300">
            <ArrowUpDown className="h-3.5 w-3.5" />
          </div>
          <span className="leading-relaxed">
            <strong className="font-bold text-indigo-900 dark:text-indigo-300">화면 명시 정렬 기준 (T06-C20):</strong>{' '}
            1차 마감일 빠른 순 ➔ 2차 우선순위(High &gt; Medium &gt; Low) ➔ 3차 등록 일시 순
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-white/70 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-700 shadow-2xs backdrop-blur-md dark:border-indigo-400/30 dark:bg-neutral-900/70 dark:text-indigo-300">
          결과 불변성 보장
        </span>
      </div>

      {/* Search & Filter Toolbar (T06-C18, T06-C19) */}
      <div className="relative z-10 mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="할 일 또는 태그 검색... (T06-C18)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200/80 bg-white/70 py-2.5 pr-3.5 pl-9 text-xs text-neutral-900 shadow-xs backdrop-blur-md transition-all placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:text-neutral-100 dark:focus:bg-neutral-900"
          />
        </div>

        {/* Status / Metric Filter Tabs (T06-C19 & T06-C83) */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white/50 p-1 text-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/50">
          <button
            onClick={() => onFilterModeChange('all')}
            className={`cursor-pointer rounded-xl px-2.5 py-1.5 font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-white font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => onFilterModeChange('pending')}
            className={`cursor-pointer rounded-xl px-2.5 py-1.5 font-medium transition-all ${
              filterMode === 'pending'
                ? 'bg-white font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            진행중
          </button>
          <button
            onClick={() => onFilterModeChange('completed')}
            className={`cursor-pointer rounded-xl px-2.5 py-1.5 font-medium transition-all ${
              filterMode === 'completed'
                ? 'border border-emerald-500/20 bg-emerald-500/15 font-bold text-emerald-700 shadow-xs dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            완료
          </button>
          <button
            onClick={() => onFilterModeChange('delayed')}
            className={`cursor-pointer rounded-xl px-2.5 py-1.5 font-medium transition-all ${
              filterMode === 'delayed'
                ? 'border border-rose-500/20 bg-rose-500/15 font-bold text-rose-700 shadow-xs dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-300'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            지연
          </button>
          <button
            onClick={() => onFilterModeChange('blocked')}
            className={`cursor-pointer rounded-xl px-2.5 py-1.5 font-medium transition-all ${
              filterMode === 'blocked'
                ? 'border border-amber-500/20 bg-amber-500/15 font-bold text-amber-700 shadow-xs dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-300'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            막힘
          </button>
        </div>

        {/* Tag Filter */}
        <div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200/80 bg-white/70 px-3.5 py-2.5 text-xs text-neutral-900 shadow-xs backdrop-blur-md transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:text-neutral-100 dark:focus:bg-neutral-900"
          >
            <option value="all">모든 태그 (전체)</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200/80 bg-white/70 px-3.5 py-2.5 text-xs text-neutral-900 shadow-xs backdrop-blur-md transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:text-neutral-100 dark:focus:bg-neutral-900"
          >
            <option value="all">모든 우선순위</option>
            <option value="high">High (높음)</option>
            <option value="medium">Medium (보통)</option>
            <option value="low">Low (낮음)</option>
          </select>
        </div>
      </div>

      {/* Todo List Cards */}
      <div className="relative z-10 mt-5 space-y-3.5">
        {filteredTodos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300/80 bg-neutral-50/40 p-10 text-center backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-900/40">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-200/60 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">일치하는 할 일이 없습니다</h4>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              검색 키워드나 필터 조건을 변경하여 다시 확인해보세요.
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isDelayed = isTodoDelayed(todo.due_date, todo.status);
            const isBlocked = blockedTodoIds.has(todo.id);
            const todoLogs = executionLogs.filter((l) => l.todo_id === todo.id);
            const actualTotalMin = todoLogs.reduce((s, l) => s + l.actual_minutes, 0);

            return (
              <div
                key={todo.id}
                className={`group relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-200 sm:p-5 ${
                  todo.status === 'completed'
                    ? 'border-neutral-200/50 bg-neutral-50/40 opacity-75 backdrop-blur-xs hover:opacity-90 dark:border-neutral-800/50 dark:bg-neutral-950/30'
                    : isDelayed
                      ? 'border-rose-300/80 bg-rose-50/40 shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:border-rose-400/80 hover:bg-rose-50/70 hover:shadow-md dark:border-rose-900/60 dark:bg-rose-950/20 dark:hover:border-rose-800/80 dark:hover:bg-rose-950/40'
                      : 'border-white/80 bg-white/65 shadow-xs backdrop-blur-md hover:-translate-y-0.5 hover:border-emerald-300/80 hover:bg-white/85 hover:shadow-md dark:border-white/10 dark:bg-neutral-800/50 dark:hover:border-emerald-500/40 dark:hover:bg-neutral-800/80'
                }`}
              >
                {/* Status Indicator Left Strip for Delayed/Blocked */}
                {isDelayed && todo.status !== 'completed' && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-rose-500" />
                )}
                {isBlocked && todo.status !== 'completed' && !isDelayed && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-amber-500" />
                )}

                <div className="flex flex-col justify-between gap-3.5 sm:flex-row sm:items-center">
                  {/* Left: Complete Checkbox & Content */}
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <button
                      onClick={() => (todo.status === 'completed' ? onRevertTodo(todo.id) : onCompleteTodo(todo.id))}
                      className="hover-lift active-press mt-0.5 shrink-0 cursor-pointer transition-transform"
                      title={todo.status === 'completed' ? '진행 중으로 되돌리기 (T06-C12)' : '완료로 바꾸기 (T06-C11)'}
                    >
                      {todo.status === 'completed' ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                          <CheckSquare className="h-4 w-4 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-xl border-2 border-neutral-300 bg-white/80 text-transparent backdrop-blur-xs transition-colors hover:border-emerald-500 hover:text-emerald-500 dark:border-neutral-700 dark:bg-neutral-800/80 dark:hover:border-emerald-400">
                          <Square className="h-4 w-4" />
                        </div>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      {/* Top Badges & Tags Row */}
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        {/* Priority Badge (T06-C15) */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase backdrop-blur-xs ${
                            todo.priority === 'high'
                              ? 'border-rose-300/40 bg-rose-500/15 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/50 dark:text-rose-300'
                              : todo.priority === 'medium'
                                ? 'border-amber-300/40 bg-amber-500/15 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'border-emerald-300/40 bg-emerald-500/15 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/50 dark:text-emerald-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              todo.priority === 'high'
                                ? 'bg-rose-500 ring-1 ring-rose-300'
                                : todo.priority === 'medium'
                                  ? 'bg-amber-500 ring-1 ring-amber-300'
                                  : 'bg-emerald-500 ring-1 ring-emerald-300'
                            }`}
                          />
                          {todo.priority}
                        </span>

                        {/* Delayed Badge (T06-C30) */}
                        {isDelayed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                            마감 지연
                          </span>
                        )}

                        {/* Blocked Badge (T06-C31) */}
                        {isBlocked && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            막힘 발생
                          </span>
                        )}

                        {/* Tags (T06-C16) */}
                        {todo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-100/70 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-600 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-400"
                          >
                            <Tag className="h-2.5 w-2.5 opacity-60" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Content text (T06-C57 XSS 방어: safe react text node) */}
                      <p
                        className={`text-sm font-bold tracking-tight text-neutral-900 sm:text-[15px] dark:text-neutral-100 ${
                          todo.status === 'completed' ? 'text-neutral-400 line-through dark:text-neutral-500' : ''
                        }`}
                      >
                        {todo.content}
                      </p>

                      {/* Metadata Row (Capsules) */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1 rounded-xl border border-neutral-200/70 bg-neutral-50/70 px-2.5 py-1 text-neutral-600 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
                          <Calendar className="h-3 w-3 text-neutral-400" />
                          마감: {todo.due_date}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl border border-indigo-500/20 bg-indigo-50/50 px-2.5 py-1 text-indigo-700 backdrop-blur-xs dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300">
                          <Clock className="h-3 w-3 text-indigo-500" />
                          예상: {formatMinutes(todo.estimated_minutes)} ({todo.estimated_minutes}분)
                        </span>
                        {actualTotalMin > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-50/70 px-2.5 py-1 font-bold text-emerald-700 backdrop-blur-xs dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Zap className="h-3 w-3 text-emerald-500" />
                            실제: {formatMinutes(actualTotalMin)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
                    {/* 실행 기록 작성 버튼 (카드 3) */}
                    <button
                      onClick={() => setActiveExecTodo(todo)}
                      className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-2xs backdrop-blur-xs transition-all hover:bg-emerald-500/20 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                      title="실제 시작/종료 시각 및 막힌 이유 기록"
                    >
                      <Play className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />
                      <span>실행 기록 ({todoLogs.length})</span>
                    </button>

                    {/* 완료 ↔ 되돌리기 (T06-C11, T06-C12) */}
                    {todo.status === 'completed' ? (
                      <button
                        onClick={() => onRevertTodo(todo.id)}
                        className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white/80 text-neutral-500 shadow-2xs backdrop-blur-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                        title="진행 중으로 되돌리기 (T06-C12)"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onCompleteTodo(todo.id)}
                        className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50/80 text-emerald-600 shadow-2xs backdrop-blur-xs transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        title="완료로 변경 (T06-C11)"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                    )}

                    {/* 수정 버튼 (T06-C10) */}
                    <button
                      onClick={() => setEditingTodo(todo)}
                      className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white/80 text-neutral-500 shadow-2xs backdrop-blur-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                      title="할 일 수정 (T06-C10)"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {/* 삭제 버튼 (T06-C13) */}
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white/80 text-rose-500 shadow-2xs backdrop-blur-xs transition-colors hover:bg-rose-50 hover:text-rose-700 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                      title="할 일 삭제 (T06-C13)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Execution Record Modal (Card 3 - T06-C21~C27) */}
      <ExecutionModal
        isOpen={Boolean(activeExecTodo)}
        onClose={() => setActiveExecTodo(null)}
        todo={activeExecTodo}
        existingLogs={activeExecTodo ? executionLogs.filter((l) => l.todo_id === activeExecTodo.id) : []}
        onRecordExecution={onRecordExecution}
        onCompleteTodo={onCompleteTodo}
      />

      {/* Add Todo Modal (T06-C09) */}
      <NewTodoModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        planId={planId}
        onCreateTodo={onCreateTodo}
      />

      {/* Edit Todo Modal (T06-C10) */}
      {editingTodo && (
        <EditTodoModal
          isOpen={Boolean(editingTodo)}
          onClose={() => setEditingTodo(null)}
          todo={editingTodo}
          onUpdateTodo={onUpdateTodo}
        />
      )}
    </section>
  );
};
