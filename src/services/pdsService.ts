import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import type {
  Plan,
  PlanRevision,
  Todo,
  TodoStatus,
  ExecutionLog,
  Review,
  SeeMetrics,
  PdsFullDataExport,
} from '../types/pds.ts';
import {
  INITIAL_PLAN,
  INITIAL_REVISIONS,
  INITIAL_TODOS,
  INITIAL_EXECUTION_LOGS,
  INITIAL_REVIEWS,
} from '../data/seedData.ts';
import { getSeoulTodayString } from '../utils/dateUtils.ts';

const STORAGE_KEYS = {
  PLANS: 'pds_plans_net_sec_v1',
  REVISIONS: 'pds_plan_revisions_net_sec_v1',
  TODOS: 'pds_todos_net_sec_v1',
  LOGS: 'pds_execution_logs_net_sec_v1',
  REVIEWS: 'pds_reviews_net_sec_v1',
};

// ============================================================================
// Local Fallback Storage Helpers (브라우저 새로고침 및 오프라인/테스트 지원)
// ============================================================================
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

// In-Memory store (SSR or Node CLI test runner support)
let memoryStore = {
  plans: [...[INITIAL_PLAN]],
  revisions: [...INITIAL_REVISIONS],
  todos: [...INITIAL_TODOS],
  logs: [...INITIAL_EXECUTION_LOGS],
  reviews: [...INITIAL_REVIEWS],
};

function initStorageIfEmpty() {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (!window.localStorage.getItem(STORAGE_KEYS.PLANS)) {
      setLocalItem(STORAGE_KEYS.PLANS, [INITIAL_PLAN]);
      setLocalItem(STORAGE_KEYS.REVISIONS, INITIAL_REVISIONS);
      setLocalItem(STORAGE_KEYS.TODOS, INITIAL_TODOS);
      setLocalItem(STORAGE_KEYS.LOGS, INITIAL_EXECUTION_LOGS);
      setLocalItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    }
  }
}

initStorageIfEmpty();

// ============================================================================
// Plan Service (카드 1 - T06-C04 ~ T06-C08)
// ============================================================================
export async function getPlans(): Promise<Plan[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('plans').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocalItem(STORAGE_KEYS.PLANS, data);
        return data as Plan[];
      }
    } catch (err) {
      console.warn('Supabase getPlans fallback to local:', err);
    }
  }
  return getLocalItem<Plan[]>(STORAGE_KEYS.PLANS, memoryStore.plans);
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const plans = await getPlans();
  return plans.find((p) => p.id === id) || null;
}

export async function createPlan(planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> {
  const nowIso = new Date().toISOString();
  const newPlan: Plan = {
    ...planData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}`,
    created_at: nowIso,
    updated_at: nowIso,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('plans').insert(newPlan).select().single();
      if (!error && data) {
        const current = getLocalItem<Plan[]>(STORAGE_KEYS.PLANS, memoryStore.plans);
        setLocalItem(STORAGE_KEYS.PLANS, [data as Plan, ...current]);
        return data as Plan;
      }
    } catch (err) {
      console.warn('Supabase createPlan fallback:', err);
    }
  }

  const current = getLocalItem<Plan[]>(STORAGE_KEYS.PLANS, memoryStore.plans);
  const updated = [newPlan, ...current];
  setLocalItem(STORAGE_KEYS.PLANS, updated);
  memoryStore.plans = updated;
  return newPlan;
}

/**
 * T06-C08: 계획을 고쳐도 고치기 전 계획이 그대로 남아 있다.
 * - 수정 전 스냅샷을 plan_revisions에 보존
 * - 계획 ID는 그대로 두고 내용만 갱신
 */
export async function updatePlan(id: string, updateData: Partial<Omit<Plan, 'id' | 'created_at'>>): Promise<Plan> {
  const currentPlans = await getPlans();
  const existing = currentPlans.find((p) => p.id === id);
  if (!existing) throw new Error('Plan not found');

  // 1. 현재 계획을 수정 이력(Revision)으로 스냅샷 아카이빙
  const revisions = await getPlanRevisions(id);
  const nextRevNumber = revisions.length + 1;
  const snapshot: PlanRevision = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`,
    plan_id: existing.id,
    revision_number: nextRevNumber,
    title: existing.title,
    start_date: existing.start_date,
    end_date: existing.end_date,
    priority: existing.priority,
    success_criteria: existing.success_criteria,
    estimated_minutes: existing.estimated_minutes,
    revised_at: new Date().toISOString(),
  };

  const nowIso = new Date().toISOString();
  const updatedPlan: Plan = {
    ...existing,
    ...updateData,
    updated_at: nowIso,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('plan_revisions').insert(snapshot);
      const { data, error } = await supabase
        .from('plans')
        .update({
          title: updatedPlan.title,
          start_date: updatedPlan.start_date,
          end_date: updatedPlan.end_date,
          priority: updatedPlan.priority,
          success_criteria: updatedPlan.success_criteria,
          estimated_minutes: updatedPlan.estimated_minutes,
          updated_at: nowIso,
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const localRevs = getLocalItem<PlanRevision[]>(STORAGE_KEYS.REVISIONS, memoryStore.revisions);
        setLocalItem(STORAGE_KEYS.REVISIONS, [...localRevs, snapshot]);
        const updatedList = currentPlans.map((p) => (p.id === id ? (data as Plan) : p));
        setLocalItem(STORAGE_KEYS.PLANS, updatedList);
        return data as Plan;
      }
    } catch (err) {
      console.warn('Supabase updatePlan fallback:', err);
    }
  }

  // Local fallback
  const localRevs = getLocalItem<PlanRevision[]>(STORAGE_KEYS.REVISIONS, memoryStore.revisions);
  const updatedRevs = [...localRevs, snapshot];
  setLocalItem(STORAGE_KEYS.REVISIONS, updatedRevs);
  memoryStore.revisions = updatedRevs;

  const updatedList = currentPlans.map((p) => (p.id === id ? updatedPlan : p));
  setLocalItem(STORAGE_KEYS.PLANS, updatedList);
  memoryStore.plans = updatedList;

  return updatedPlan;
}

export async function getPlanRevisions(planId: string): Promise<PlanRevision[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('plan_revisions')
        .select('*')
        .eq('plan_id', planId)
        .order('revision_number', { ascending: true });
      if (!error && data) return data as PlanRevision[];
    } catch (err) {
      console.warn('Supabase getPlanRevisions fallback:', err);
    }
  }
  const allRevs = getLocalItem<PlanRevision[]>(STORAGE_KEYS.REVISIONS, memoryStore.revisions);
  return allRevs.filter((r) => r.plan_id === planId);
}

// ============================================================================
// Todo Service (카드 2 - T06-C09 ~ T06-C20)
// ============================================================================
export async function getTodos(planId: string): Promise<Todo[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('todos').select('*').eq('plan_id', planId).eq('is_deleted', false);
      if (!error && data) {
        return sortTodos(data as Todo[]);
      }
    } catch (err) {
      console.warn('Supabase getTodos fallback:', err);
    }
  }
  const allTodos = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
  const filtered = allTodos.filter((t) => t.plan_id === planId && !t.is_deleted);
  return sortTodos(filtered);
}

/**
 * T06-C20: 화면에 밝혀 둔 기준대로 할 일이 정렬된다.
 * 정렬 기준: 1차 마감일 빠른 순 ➔ 2차 우선순위(높음>보통>낮음) ➔ 3차 등록순
 */
export function sortTodos(todos: Todo[]): Todo[] {
  const priorityRank: Record<string, number> = { high: 3, medium: 2, low: 1 };
  return [...todos].sort((a, b) => {
    // 1차: 마감일 오름차순
    if (a.due_date !== b.due_date) {
      return a.due_date.localeCompare(b.due_date);
    }
    // 2차: 우선순위 높은 순
    const pDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    // 3차 타이브레이커: 생성순 오름차순
    return a.created_at.localeCompare(b.created_at);
  });
}

export async function createTodo(
  todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'is_deleted' | 'status'> & {
    status?: TodoStatus;
  },
): Promise<Todo> {
  const nowIso = new Date().toISOString();
  const newTodo: Todo = {
    status: 'pending',
    ...todoData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `todo-${Date.now()}`,
    is_deleted: false,
    completed_at: null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('todos').insert(newTodo).select().single();
      if (!error && data) {
        const current = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
        setLocalItem(STORAGE_KEYS.TODOS, [...current, data as Todo]);
        return data as Todo;
      }
    } catch (err) {
      console.warn('Supabase createTodo fallback:', err);
    }
  }

  const current = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
  const updated = [...current, newTodo];
  setLocalItem(STORAGE_KEYS.TODOS, updated);
  memoryStore.todos = updated;
  return newTodo;
}

export async function updateTodo(id: string, updateData: Partial<Todo>): Promise<Todo> {
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ ...updateData, updated_at: nowIso })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const current = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
        const updated = current.map((t) => (t.id === id ? (data as Todo) : t));
        setLocalItem(STORAGE_KEYS.TODOS, updated);
        return data as Todo;
      }
    } catch (err) {
      console.warn('Supabase updateTodo fallback:', err);
    }
  }

  const current = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
  const target = current.find((t) => t.id === id);
  if (!target) throw new Error('Todo not found');
  const updatedTodo: Todo = { ...target, ...updateData, updated_at: nowIso };
  const updated = current.map((t) => (t.id === id ? updatedTodo : t));
  setLocalItem(STORAGE_KEYS.TODOS, updated);
  memoryStore.todos = updated;
  return updatedTodo;
}

/**
 * T06-C11: 할 일을 완료로 바꿀 수 있다.
 */
export async function completeTodo(id: string): Promise<Todo> {
  return updateTodo(id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  });
}

/**
 * T06-C12: 완료한 할 일을 다시 진행 중으로 되돌릴 수 있다.
 */
export async function revertTodo(id: string): Promise<Todo> {
  return updateTodo(id, {
    status: 'pending',
    completed_at: null,
  });
}

/**
 * T06-C13: 할 일을 지울 수 있다 (소프트 삭제).
 */
export async function deleteTodo(id: string): Promise<void> {
  await updateTodo(id, { is_deleted: true });
}

// ============================================================================
// Execution Log Service (카드 3 - T06-C21 ~ T06-C27)
// ============================================================================
/**
 * T06-C21: 완료 버튼을 연달아 두 번 눌러도 완료 기록은 한 건만 남는다 (멱등성).
 * T06-C27: 실행 기록을 저장해도 원래 계획 값은 덮어쓰이지 않는다.
 */
// In-flight concurrency lock for duplicate key race condition prevention
const inFlightIdempotencyKeys = new Set<string>();

export async function recordExecution(
  logData: Omit<ExecutionLog, 'id' | 'created_at'>,
): Promise<{ success: boolean; log: ExecutionLog; isDuplicate: boolean }> {
  const currentLogs = getLocalItem<ExecutionLog[]>(STORAGE_KEYS.LOGS, memoryStore.logs);

  // 1. 클라이언트/메모리 레벨에서 멱등키 중복 여부 확인
  const existing = currentLogs.find((l) => l.idempotency_key === logData.idempotency_key);
  if (existing) {
    return { success: true, log: existing, isDuplicate: true };
  }

  // 2. 동시 병렬 연타(In-flight Race Condition) 락 감지
  if (inFlightIdempotencyKeys.has(logData.idempotency_key)) {
    return {
      success: true,
      log: {
        ...logData,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `exec-dup-${Date.now()}`,
        created_at: new Date().toISOString(),
      },
      isDuplicate: true,
    };
  }

  inFlightIdempotencyKeys.add(logData.idempotency_key);

  try {
    const newLog: ExecutionLog = {
      ...logData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `exec-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('execution_logs').insert(newLog).select().maybeSingle();
        if (!error && data) {
          const updated = [...currentLogs, data as ExecutionLog];
          setLocalItem(STORAGE_KEYS.LOGS, updated);
          return { success: true, log: data as ExecutionLog, isDuplicate: false };
        }
        // 만약 DB에서 idempotency_key UNIQUE 제약 조건에 걸렸다면 기존 레코드 조회 반환
        const isConflict =
          error &&
          (error.code === '23505' ||
            (error as any).status === 409 ||
            (error as any).statusCode === 409 ||
            error.message?.toLowerCase().includes('duplicate') ||
            error.message?.toLowerCase().includes('unique') ||
            error.message?.toLowerCase().includes('idempotency_key'));

        if (isConflict) {
          const { data: duplicate } = await supabase
            .from('execution_logs')
            .select('*')
            .eq('idempotency_key', logData.idempotency_key)
            .maybeSingle();
          if (duplicate) {
            return { success: true, log: duplicate as ExecutionLog, isDuplicate: true };
          }
          return { success: true, log: newLog, isDuplicate: true };
        }
      } catch (err) {
        console.warn('Supabase recordExecution fallback:', err);
      }
    }

    const updated = [...currentLogs, newLog];
    setLocalItem(STORAGE_KEYS.LOGS, updated);
    memoryStore.logs = updated;
    return { success: true, log: newLog, isDuplicate: false };
  } finally {
    inFlightIdempotencyKeys.delete(logData.idempotency_key);
  }
}

export async function getExecutionLogs(todoId?: string): Promise<ExecutionLog[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('execution_logs').select('*').order('created_at', { ascending: false });
      if (todoId) {
        query = query.eq('todo_id', todoId);
      }
      const { data, error } = await query;
      if (!error && data) return data as ExecutionLog[];
    } catch (err) {
      console.warn('Supabase getExecutionLogs fallback:', err);
    }
  }
  const allLogs = getLocalItem<ExecutionLog[]>(STORAGE_KEYS.LOGS, memoryStore.logs);
  if (todoId) {
    return allLogs.filter((l) => l.todo_id === todoId);
  }
  return allLogs;
}

// ============================================================================
// Review Service & See Metrics (카드 4 - T06-C28 ~ T06-C33, T06-C83)
// ============================================================================
export async function calculateSeeMetrics(planId: string): Promise<SeeMetrics> {
  const todos = await getTodos(planId);
  const activeTodos = todos.filter((t) => !t.is_deleted);
  const logs = await getExecutionLogs();

  const seoulToday = getSeoulTodayString();

  // T06-C28: 그 계획에 딸린 지우지 않은 할 일 수
  const totalPlanTodos = activeTodos.length;

  // T06-C29: 그중 지금 완료 상태인 할 일 수
  const completedTodos = activeTodos.filter((t) => t.status === 'completed').length;

  // T06-C30: 완료되지 않았고 마감일이 서울 시간 기준 오늘보다 앞선 할 일 수 (완료 건 중복 제외)
  const delayedTodos = activeTodos.filter((t) => t.status !== 'completed' && t.due_date < seoulToday).length;

  // T06-C31: 막힌 이유가 하나라도 적힌 할 일 수
  const activeTodoIds = new Set(activeTodos.map((t) => t.id));
  const blockedTodoIdSet = new Set<string>();
  for (const log of logs) {
    if (activeTodoIds.has(log.todo_id) && log.blocker_reason && log.blocker_reason.trim().length > 0) {
      blockedTodoIdSet.add(log.todo_id);
    }
  }
  const blockedTodos = blockedTodoIdSet.size;

  // T06-C32: 대상 할 일의 예상 시간 합계, 실제 시간은 실행 기록 합계, 차이는 실제 - 예상
  const totalEstimatedMinutes = activeTodos.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
  const totalActualMinutes = logs
    .filter((l) => activeTodoIds.has(l.todo_id))
    .reduce((sum, l) => sum + (l.actual_minutes || 0), 0);

  const varianceMinutes = totalActualMinutes - totalEstimatedMinutes;

  return {
    totalPlanTodos,
    completedTodos,
    delayedTodos,
    blockedTodos,
    totalEstimatedMinutes,
    totalActualMinutes,
    varianceMinutes,
  };
}

export async function saveReview(planId: string, nextActionNote: string): Promise<Review> {
  const newReview: Review = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`,
    plan_id: planId,
    next_action_note: nextActionNote,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
      if (!error && data) {
        const current = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, memoryStore.reviews);
        setLocalItem(STORAGE_KEYS.REVIEWS, [...current, data as Review]);
        return data as Review;
      }
    } catch (err) {
      console.warn('Supabase saveReview fallback:', err);
    }
  }

  const current = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, memoryStore.reviews);
  const updated = [...current, newReview];
  setLocalItem(STORAGE_KEYS.REVIEWS, updated);
  memoryStore.reviews = updated;
  return newReview;
}

export async function getReviews(planId: string): Promise<Review[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Review[];
    } catch (err) {
      console.warn('Supabase getReviews fallback:', err);
    }
  }
  const all = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, memoryStore.reviews);
  return all.filter((r) => r.plan_id === planId);
}

// ============================================================================
// 카드 5: 내보내기 & 전체 데이터 복원 (T06-C36)
// ============================================================================
export async function exportFullData(): Promise<PdsFullDataExport> {
  const plans = await getPlans();
  const revisions = getLocalItem<PlanRevision[]>(STORAGE_KEYS.REVISIONS, memoryStore.revisions);
  const todos = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
  const executionLogs = await getExecutionLogs();
  const reviews = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, memoryStore.reviews);

  return {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    plans,
    planRevisions: revisions,
    todos,
    executionLogs,
    reviews,
  };
}

export function resetToSeedData(): void {
  setLocalItem(STORAGE_KEYS.PLANS, [INITIAL_PLAN]);
  setLocalItem(STORAGE_KEYS.REVISIONS, INITIAL_REVISIONS);
  setLocalItem(STORAGE_KEYS.TODOS, INITIAL_TODOS);
  setLocalItem(STORAGE_KEYS.LOGS, INITIAL_EXECUTION_LOGS);
  setLocalItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  memoryStore = {
    plans: [INITIAL_PLAN],
    revisions: INITIAL_REVISIONS,
    todos: INITIAL_TODOS,
    logs: INITIAL_EXECUTION_LOGS,
    reviews: INITIAL_REVIEWS,
  };
}
