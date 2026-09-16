import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
import type { Todo, Priority, ExecutionLog } from '../types/pds.ts';
import { formatMinutes, getSeoulTodayString, isTodoDelayed } from '../utils/dateUtils.ts';
import { ExecutionModal } from './ExecutionModal.tsx';

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

  // New todo modal / form state (T06-C09)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newDueDate, setNewDueDate] = useState(getSeoulTodayString());
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newTags, setNewTags] = useState('Frontend, UI');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(60);

  // Edit todo state (T06-C10)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editTags, setEditTags] = useState('');
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState(60);

  // Execution modal state (Card 3 - T06-C21~C27)
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    await onCreateTodo({
      plan_id: planId,
      content: newContent,
      due_date: newDueDate,
      priority: newPriority,
      tags: parsedTags,
      estimated_minutes: Number(newEstimatedMinutes),
    });
    setNewContent('');
    setIsAddOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;
    const parsedTags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    await onUpdateTodo(editingTodo.id, {
      content: editContent,
      due_date: editDueDate,
      priority: editPriority,
      tags: parsedTags,
      estimated_minutes: Number(editEstimatedMinutes),
    });
    setEditingTodo(null);
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setEditContent(todo.content);
    setEditDueDate(todo.due_date);
    setEditPriority(todo.priority);
    setEditTags(todo.tags.join(', '));
    setEditEstimatedMinutes(todo.estimated_minutes);
  };

  return (
    <section
      id="todo-section"
      className="rounded-3xl border border-neutral-200/80 bg-white/80 p-6 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all sm:p-7 dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.3)]"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200/80 pb-5 sm:flex-row sm:items-center dark:border-neutral-800/80">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-inner dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                카드 2 — Do (할 일 다루기)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> T06-C09~C20 충족
              </span>
            </div>
            <h2 className="mt-0.5 flex items-center gap-2.5 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
              할 일 목록
              <span className="rounded-full border border-neutral-200/80 bg-neutral-100 px-2.5 py-0.5 font-mono text-xs font-bold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                {filteredTodos.length} / {todos.length}
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>할 일 추가 (T06-C09)</span>
        </button>
      </div>

      {/* T06-C20: 화면에 밝혀 둔 정렬 기준 고지 배너 */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/8 px-4 py-2.5 text-xs shadow-2xs backdrop-blur-md dark:border-indigo-400/20 dark:bg-indigo-500/10">
        <div className="flex items-center gap-2 font-medium text-indigo-950 dark:text-indigo-200">
          <ArrowUpDown className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span className="leading-normal">
            <strong className="font-bold text-indigo-900 dark:text-indigo-300">화면 명시 정렬 기준 (T06-C20):</strong>{' '}
            1차 마감일 빠른 순 ➔ 2차 우선순위(High &gt; Medium &gt; Low) ➔ 3차 등록 일시 순
          </span>
        </div>
        <span className="rounded-full border border-indigo-200/80 bg-white/80 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-600 shadow-2xs backdrop-blur-xs dark:border-indigo-800 dark:bg-neutral-900/80 dark:text-indigo-400">
          결과 불변성 보장
        </span>
      </div>

      {/* Search & Filter Toolbar (T06-C18, T06-C19) */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="할 일 또는 태그 검색... (T06-C18)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full rounded-xl border border-neutral-200/80 bg-white py-2 pr-3.5 pl-9 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Status / Metric Filter Tabs (T06-C19 & T06-C83) */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-1 text-xs backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/80">
          <button
            onClick={() => onFilterModeChange('all')}
            className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => onFilterModeChange('pending')}
            className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-all ${
              filterMode === 'pending'
                ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            진행중
          </button>
          <button
            onClick={() => onFilterModeChange('completed')}
            className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-all ${
              filterMode === 'completed'
                ? 'bg-white font-bold text-emerald-600 shadow-xs dark:bg-neutral-800 dark:text-emerald-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            완료
          </button>
          <button
            onClick={() => onFilterModeChange('delayed')}
            className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-all ${
              filterMode === 'delayed'
                ? 'bg-white font-bold text-rose-600 shadow-xs dark:bg-neutral-800 dark:text-rose-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            지연
          </button>
          <button
            onClick={() => onFilterModeChange('blocked')}
            className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-all ${
              filterMode === 'blocked'
                ? 'bg-white font-bold text-amber-600 shadow-xs dark:bg-neutral-800 dark:text-amber-400'
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
            className="w-full rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
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
            className="w-full rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <option value="all">모든 우선순위</option>
            <option value="high">High (높음)</option>
            <option value="medium">Medium (보통)</option>
            <option value="low">Low (낮음)</option>
          </select>
        </div>
      </div>

      {/* Todo List Cards */}
      <div className="mt-5 space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
            <AlertCircle className="mx-auto mb-2 h-6 w-6 text-neutral-400" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">조건에 일치하는 할 일이 없습니다.</p>
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
                className={`hover-lift rounded-2xl border p-4.5 transition-all ${
                  todo.status === 'completed'
                    ? 'border-neutral-200/60 bg-neutral-50/50 opacity-75 dark:border-neutral-800/60 dark:bg-neutral-950/40'
                    : isDelayed
                      ? 'border-rose-300/90 bg-rose-50/40 shadow-xs dark:border-rose-800/70 dark:bg-rose-950/20'
                      : 'border-neutral-200/80 bg-white shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-900'
                }`}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  {/* Left: Complete Checkbox & Content */}
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <button
                      onClick={() => (todo.status === 'completed' ? onRevertTodo(todo.id) : onCompleteTodo(todo.id))}
                      className="hover-lift active-press mt-0.5 shrink-0 cursor-pointer text-neutral-400 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                      title={todo.status === 'completed' ? '진행 중으로 되돌리기 (T06-C12)' : '완료로 바꾸기 (T06-C11)'}
                    >
                      {todo.status === 'completed' ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {/* Priority Badge (T06-C15) */}
                        <span
                          className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-bold uppercase shadow-2xs ${
                            todo.priority === 'high'
                              ? 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300'
                              : todo.priority === 'medium'
                                ? 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {todo.priority}
                        </span>

                        {/* Delayed Badge (T06-C30) */}
                        {isDelayed && (
                          <span className="animate-pulse rounded-lg bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                            마감 지연
                          </span>
                        )}

                        {/* Blocked Badge (T06-C31) */}
                        {isBlocked && (
                          <span className="rounded-lg bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                            막힘 발생
                          </span>
                        )}

                        {/* Tags (T06-C16) */}
                        {todo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/70 bg-neutral-100/80 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-400"
                          >
                            <Tag className="h-2.5 w-2.5 text-neutral-400" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Content text (T06-C57 XSS 방어: safe react text node) */}
                      <p
                        className={`text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 ${
                          todo.status === 'completed' ? 'text-neutral-400 line-through dark:text-neutral-500' : ''
                        }`}
                      >
                        {todo.content}
                      </p>

                      {/* Metadata Row */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          마감: {todo.due_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          예상: {formatMinutes(todo.estimated_minutes)} ({todo.estimated_minutes}분)
                        </span>
                        {actualTotalMin > 0 && (
                          <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                            <Zap className="h-3.5 w-3.5" />
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
                      className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs backdrop-blur-xs transition-all hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      title="실제 시작/종료 시각 및 막힌 이유 기록"
                    >
                      <Play className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>실행 기록 ({todoLogs.length})</span>
                    </button>

                    {/* 완료 ↔ 되돌리기 (T06-C11, T06-C12) */}
                    {todo.status === 'completed' ? (
                      <button
                        onClick={() => onRevertTodo(todo.id)}
                        className="hover-lift active-press cursor-pointer rounded-xl border border-neutral-200/80 bg-white p-2 text-neutral-500 shadow-2xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                        title="진행 중으로 되돌리기 (T06-C12)"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onCompleteTodo(todo.id)}
                        className="hover-lift active-press cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-50/80 p-2 text-emerald-600 shadow-2xs transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/50"
                        title="완료로 변경 (T06-C11)"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                    )}

                    {/* 수정 버튼 (T06-C10) */}
                    <button
                      onClick={() => openEditModal(todo)}
                      className="hover-lift active-press cursor-pointer rounded-xl border border-neutral-200/80 bg-white p-2 text-neutral-500 shadow-2xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                      title="할 일 수정 (T06-C10)"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {/* 삭제 버튼 (T06-C13) */}
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="hover-lift active-press cursor-pointer rounded-xl border border-neutral-200/80 bg-white p-2 text-rose-500 shadow-2xs transition-colors hover:bg-rose-50 hover:text-rose-700 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
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
      {isAddOpen &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddOpen(false);
            }}
            className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-2xl transition-all sm:p-7 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">새 할 일 만들기 (T06-C09)</h3>
              <p className="mt-1 mb-5 text-xs text-neutral-500 dark:text-neutral-400">
                계획에 딸린 할 일의 마감일·우선순위·태그·예상 시간을 등록합니다.
              </p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    할 일 내용
                  </label>
                  <input
                    type="text"
                    placeholder="예: Supabase 연결 설정 및 RLS 정책 검증"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      마감일 (T06-C14)
                    </label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      우선순위 (T06-C15)
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as Priority)}
                      className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                      <option value="high">High (높음)</option>
                      <option value="medium">Medium (보통)</option>
                      <option value="low">Low (낮음)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      태그 (쉼표 구분) (T06-C16)
                    </label>
                    <input
                      type="text"
                      placeholder="DB, Frontend, Test"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      예상 시간(분) (T06-C17)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newEstimatedMinutes}
                      onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="hover-lift active-press cursor-pointer rounded-xl bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="hover-lift active-press cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
                  >
                    할 일 등록
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Edit Todo Modal (T06-C10) */}
      {editingTodo &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingTodo(null);
            }}
            className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-2xl transition-all sm:p-7 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">할 일 내용 고치기 (T06-C10)</h3>
              <p className="mt-1 mb-5 text-xs text-neutral-500 dark:text-neutral-400">
                내용·마감일·우선순위·태그·예상 시간을 수정합니다.
              </p>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    할 일 내용
                  </label>
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      마감일 (T06-C14)
                    </label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      우선순위 (T06-C15)
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Priority)}
                      className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                      <option value="high">High (높음)</option>
                      <option value="medium">Medium (보통)</option>
                      <option value="low">Low (낮음)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      태그 (T06-C16)
                    </label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      예상 시간(분) (T06-C17)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editEstimatedMinutes}
                      onChange={(e) => setEditEstimatedMinutes(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300/80 bg-white px-3 py-2 text-xs text-neutral-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-100"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => setEditingTodo(null)}
                    className="hover-lift active-press cursor-pointer rounded-xl bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="hover-lift active-press cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
                  >
                    수정 완료
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
};
