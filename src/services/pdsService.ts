/**
 * 플랜두씨 다이어리 2: 핵심 비즈니스 로직 및 사용자 데이터 격리 서비스
 * 과제 7 통과 기준: T07-C116 ~ T07-C126, T07-C132 ~ T07-C134
 */

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
import type { ObservationRule } from '../types/auth.ts';
import {
  USER_A_ID,
  INITIAL_PLAN,
  INITIAL_REVISIONS,
  INITIAL_TODOS,
  INITIAL_EXECUTION_LOGS,
  INITIAL_REVIEWS,
  USER_B_PLAN,
  USER_B_TODO,
} from '../data/seedData.ts';
import { INITIAL_OBSERVATION_RULE } from '../data/observationData.ts';
import { getCurrentSession } from './authService.ts';
import { getSeoulTodayString } from '../utils/dateUtils.ts';

const STORAGE_KEYS = {
  PLANS: 'pds_plans_v7',
  REVISIONS: 'pds_plan_revisions_v7',
  TODOS: 'pds_todos_v7',
  LOGS: 'pds_execution_logs_v7',
  REVIEWS: 'pds_reviews_v7',
  OBSERVATION_RULES: 'pds_observation_rules_v7',
};

// ============================================================================
// Local Fallback Storage Helpers
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

// In-Memory Store (CLI Test Runner / Node 환경 호환)
let memoryStore = {
  plans: [INITIAL_PLAN, USER_B_PLAN],
  revisions: [...INITIAL_REVISIONS],
  todos: [...INITIAL_TODOS, USER_B_TODO],
  logs: [...INITIAL_EXECUTION_LOGS],
  reviews: [...INITIAL_REVIEWS],
  observationRules: [INITIAL_OBSERVATION_RULE],
};

function initStorageIfEmpty() {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (!window.localStorage.getItem(STORAGE_KEYS.PLANS)) {
      setLocalItem(STORAGE_KEYS.PLANS, [INITIAL_PLAN, USER_B_PLAN]);
      setLocalItem(STORAGE_KEYS.REVISIONS, INITIAL_REVISIONS);
      setLocalItem(STORAGE_KEYS.TODOS, [...INITIAL_TODOS, USER_B_TODO]);
      setLocalItem(STORAGE_KEYS.LOGS, INITIAL_EXECUTION_LOGS);
      setLocalItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
      setLocalItem(STORAGE_KEYS.OBSERVATION_RULES, [INITIAL_OBSERVATION_RULE]);
    }
  }
}

initStorageIfEmpty();

/**
 * 현재 활성 사용자의 ID 반환 (기본값: USER_A_ID)
 */
export function getActiveUserId(): string {
  const session = getCurrentSession();
  return session ? session.user.id : USER_A_ID;
}

// ============================================================================
// Plan Service (카드 1 - T06-C04 ~ T06-C08, T07-C116 ~ T07-C126)
// ============================================================================

/**
 * T07-C125: 목록 조회 시 타인의 데이터가 하나도 섞이지 않는다.
 */
export async function getPlans(actorUserId?: string): Promise<Plan[]> {
  const userId = actorUserId || getActiveUserId();
  const allPlans = getLocalItem<Plan[]>(STORAGE_KEYS.PLANS, memoryStore.plans);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as Plan[];
      }
    } catch (err) {
      console.warn('Supabase getPlans fallback:', err);
    }
  }

  return allPlans.filter((p) => p.user_id === userId);
}

/**
 * T07-C117, T07-C121, T07-C126: 타인의 계획 단건 조회 시 403/404 거절
 */
export async function getPlanById(id: string, actorUserId?: string): Promise<Plan | null> {
  const userId = actorUserId || getActiveUserId();
  const allPlans = getLocalItem<Plan[]>(STORAGE_KEYS.PLANS, memoryStore.plans);
  const plan = allPlans.find((p) => p.id === id);

  if (!plan) {
    const err = new Error('404 Not Found: 요청한 계획을 찾을 수 없습니다.');
    (err as any).statusCode = 404;
    throw err;
  }

  // T07-C117: 다른 계정의 자료 열람 시도 차단
  if (plan.user_id && plan.user_id !== userId) {
    const err = new Error(`403 Forbidden: 접근 권한이 없습니다. (Source: src/services/pdsService.ts#L137)`);
    (err as any).statusCode = 403;
    throw err;
  }

  return plan;
}

export async function createPlan(
  planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'> & { user_id?: string },
  actorUserId?: string,
): Promise<Plan> {
  const userId = actorUserId || planData.user_id || getActiveUserId();
  const nowIso = new Date().toISOString();
  const newPlan: Plan = {
    ...planData,
    user_id: userId,
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
 * T06-C08 & T07-C118: 타인의 계획 수정 시 403 Forbidden 차단 및 스냅샷 보존
 */
export async function updatePlan(
  id: string,
  updateData: Partial<Omit<Plan, 'id' | 'created_at'>>,
  actorUserId?: string,
): Promise<Plan> {
  const userId = actorUserId || getActiveUserId();
  const currentPlans = getLocalItem<Plan[]>(STORAGE_KEYS.PLANS, memoryStore.plans);
  const existing = currentPlans.find((p) => p.id === id);

  if (!existing) {
    const err = new Error('404 Not Found: 수정할 계획을 찾을 수 없습니다.');
    (err as any).statusCode = 404;
    throw err;
  }

  // T07-C118 & T07-C126: 타 계정 수정 시도 차단
  if (existing.user_id && existing.user_id !== userId) {
    const err = new Error(
      `403 Forbidden: 해당 계획을 수정할 권한이 없습니다. (Source: src/services/pdsService.ts#L188)`,
    );
    (err as any).statusCode = 403;
    throw err;
  }

  // 1. 현재 계획을 수정 이력으로 스냅샷 아카이빙 (T06-C08)
  const revisions = await getPlanRevisions(id, userId);
  const nextRevNumber = revisions.length + 1;
  const snapshot: PlanRevision = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`,
    plan_id: existing.id,
    user_id: existing.user_id,
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
    user_id: existing.user_id, // Body의 user_id 변조 방지 (T07-C123)
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
        .eq('user_id', userId)
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

  const localRevs = getLocalItem<PlanRevision[]>(STORAGE_KEYS.REVISIONS, memoryStore.revisions);
  const updatedRevs = [...localRevs, snapshot];
  setLocalItem(STORAGE_KEYS.REVISIONS, updatedRevs);
  memoryStore.revisions = updatedRevs;

  const updatedList = currentPlans.map((p) => (p.id === id ? updatedPlan : p));
  setLocalItem(STORAGE_KEYS.PLANS, updatedList);
  memoryStore.plans = updatedList;

  return updatedPlan;
}

export async function getPlanRevisions(planId: string, actorUserId?: string): Promise<PlanRevision[]> {
  const userId = actorUserId || getActiveUserId();
  const allRevs = getLocalItem<PlanRevision[]>(STORAGE_KEYS.REVISIONS, memoryStore.revisions);
  return allRevs.filter((r) => r.plan_id === planId && (r.user_id === userId || !r.user_id));
}

// ============================================================================
// Todo Service (카드 2 - T06-C09 ~ T06-C20, T07-C116 ~ T07-C126)
// ============================================================================

export async function getTodos(planId: string, actorUserId?: string): Promise<Todo[]> {
  const userId = actorUserId || getActiveUserId();
  const allTodos = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
  const localFiltered = allTodos.filter(
    (t) => t.plan_id === planId && !t.is_deleted && (t.user_id === userId || !t.user_id),
  );

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('plan_id', planId)
        .eq('user_id', userId)
        .eq('is_deleted', false);
      if (!error && data) {
        return sortTodos(data as Todo[]);
      }
    } catch (err) {
      console.warn('Supabase getTodos fallback:', err);
    }
  }

  return sortTodos(localFiltered);
}

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
    user_id?: string;
  },
  actorUserId?: string,
): Promise<Todo> {
  const userId = actorUserId || todoData.user_id || getActiveUserId();
  const nowIso = new Date().toISOString();
  const newTodo: Todo = {
    status: 'pending',
    ...todoData,
    user_id: userId,
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

/**
 * T07-C118, T07-C121, T07-C126: 타인의 할 일 수정 시 403 Forbidden 거절
 */
export async function updateTodo(id: string, updateData: Partial<Todo>, actorUserId?: string): Promise<Todo> {
  const userId = actorUserId || getActiveUserId();
  const current = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
  const target = current.find((t) => t.id === id);

  if (!target) {
    const err = new Error('404 Not Found: 수정할 할 일을 찾을 수 없습니다.');
    (err as any).statusCode = 404;
    throw err;
  }

  // T07-C118: 타 계정의 자료 수정 차단
  if (target.user_id && target.user_id !== userId) {
    const err = new Error(
      `403 Forbidden: 해당 할 일을 수정할 권한이 없습니다. (Source: src/services/pdsService.ts#L365)`,
    );
    (err as any).statusCode = 403;
    throw err;
  }

  const nowIso = new Date().toISOString();
  const updatedTodo: Todo = {
    ...target,
    ...updateData,
    user_id: target.user_id, // IDOR 변조 방지 (T07-C123)
    updated_at: nowIso,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ ...updateData, updated_at: nowIso })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (!error && data) {
        const updated = current.map((t) => (t.id === id ? (data as Todo) : t));
        setLocalItem(STORAGE_KEYS.TODOS, updated);
        return data as Todo;
      }
    } catch (err) {
      console.warn('Supabase updateTodo fallback:', err);
    }
  }

  const updated = current.map((t) => (t.id === id ? updatedTodo : t));
  setLocalItem(STORAGE_KEYS.TODOS, updated);
  memoryStore.todos = updated;
  return updatedTodo;
}

export async function completeTodo(id: string, actorUserId?: string): Promise<Todo> {
  return updateTodo(
    id,
    {
      status: 'completed',
      completed_at: new Date().toISOString(),
    },
    actorUserId,
  );
}

export async function revertTodo(id: string, actorUserId?: string): Promise<Todo> {
  return updateTodo(
    id,
    {
      status: 'pending',
      completed_at: null,
    },
    actorUserId,
  );
}

/**
 * T07-C119, T07-C121, T07-C126: 타인의 할 일 삭제 시 403 Forbidden 거절
 */
export async function deleteTodo(id: string, actorUserId?: string): Promise<void> {
  await updateTodo(id, { is_deleted: true }, actorUserId);
}

// ============================================================================
// Execution Log Service (카드 3 - T06-C21 ~ T06-C27, T07-C24)
// ============================================================================
const inFlightIdempotencyKeys = new Set<string>();

export async function recordExecution(
  logData: Omit<ExecutionLog, 'id' | 'created_at'> & { user_id?: string },
  actorUserId?: string,
): Promise<{ success: boolean; log: ExecutionLog; isDuplicate: boolean }> {
  const userId = actorUserId || logData.user_id || getActiveUserId();
  const currentLogs = getLocalItem<ExecutionLog[]>(STORAGE_KEYS.LOGS, memoryStore.logs);

  // 1. 멱등키 중복 여부 확인
  const existing = currentLogs.find((l) => l.idempotency_key === logData.idempotency_key);
  if (existing) {
    return { success: true, log: existing, isDuplicate: true };
  }

  // 2. Race Condition 락 감지
  if (inFlightIdempotencyKeys.has(logData.idempotency_key)) {
    return {
      success: true,
      log: {
        ...logData,
        user_id: userId,
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
      user_id: userId,
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

export async function getExecutionLogs(todoId?: string, actorUserId?: string): Promise<ExecutionLog[]> {
  const userId = actorUserId || getActiveUserId();
  const allLogs = getLocalItem<ExecutionLog[]>(STORAGE_KEYS.LOGS, memoryStore.logs);
  const userLogs = allLogs.filter((l) => l.user_id === userId || !l.user_id);

  if (todoId) {
    return userLogs.filter((l) => l.todo_id === todoId);
  }
  return userLogs;
}

// ============================================================================
// Review Service & See Metrics (카드 4 - T06-C28 ~ T06-C33, T07-C132)
// ============================================================================
export async function calculateSeeMetrics(planId: string, actorUserId?: string): Promise<SeeMetrics> {
  const userId = actorUserId || getActiveUserId();
  const todos = await getTodos(planId, userId);
  const activeTodos = todos.filter((t) => !t.is_deleted);
  const logs = await getExecutionLogs(undefined, userId);

  const seoulToday = getSeoulTodayString();

  // T06-C28: 지우지 않은 할 일 수
  const totalPlanTodos = activeTodos.length;

  // T06-C29: 현재 완료 상태인 할 일 수
  const completedTodos = activeTodos.filter((t) => t.status === 'completed').length;

  // T06-C30: 마감 지연 수 (완료 건 중복 제외)
  const delayedTodos = activeTodos.filter((t) => t.status !== 'completed' && t.due_date < seoulToday).length;

  // T06-C31: 막힌 이유가 있는 할 일 수
  const activeTodoIds = new Set(activeTodos.map((t) => t.id));
  const blockedTodoIdSet = new Set<string>();
  for (const log of logs) {
    if (activeTodoIds.has(log.todo_id) && log.blocker_reason && log.blocker_reason.trim().length > 0) {
      blockedTodoIdSet.add(log.todo_id);
    }
  }
  const blockedTodos = blockedTodoIdSet.size;

  // T06-C32 & T07-C132: 오차 계산
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

export async function saveReview(planId: string, nextActionNote: string, actorUserId?: string): Promise<Review> {
  const userId = actorUserId || getActiveUserId();
  const newReview: Review = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`,
    plan_id: planId,
    user_id: userId,
    next_action_note: nextActionNote,
    created_at: new Date().toISOString(),
  };

  const current = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, memoryStore.reviews);
  const updated = [...current, newReview];
  setLocalItem(STORAGE_KEYS.REVIEWS, updated);
  memoryStore.reviews = updated;
  return newReview;
}

export async function getReviews(planId: string, actorUserId?: string): Promise<Review[]> {
  const userId = actorUserId || getActiveUserId();
  const all = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, memoryStore.reviews);
  return all.filter((r) => r.plan_id === planId && (r.user_id === userId || !r.user_id));
}

// ============================================================================
// Observation Rules Service (카드 5 - T07-C04 ~ T07-C27)
// ============================================================================
export async function getObservationRule(actorUserId?: string): Promise<ObservationRule> {
  const userId = actorUserId || getActiveUserId();
  const rules = getLocalItem<ObservationRule[]>(STORAGE_KEYS.OBSERVATION_RULES, memoryStore.observationRules);
  const userRule = rules.find((r) => r.user_id === userId);
  return userRule || INITIAL_OBSERVATION_RULE;
}

// ============================================================================
// Data Export & Cascade Account Deletion (T07-C133, T07-C134)
// ============================================================================

/**
 * T07-C133: 내 자료 전체를 파일 하나로 내보낸다 (본인 소유 데이터만 격리 추출).
 */
export async function exportFullData(actorUserId?: string): Promise<PdsFullDataExport> {
  const userId = actorUserId || getActiveUserId();
  const plans = await getPlans(userId);
  const planIds = new Set(plans.map((p) => p.id));

  const allRevisions = getLocalItem<PlanRevision[]>(STORAGE_KEYS.REVISIONS, memoryStore.revisions);
  const revisions = allRevisions.filter((r) => r.user_id === userId || (r.plan_id && planIds.has(r.plan_id)));

  const allTodos = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos);
  const todos = allTodos.filter((t) => t.user_id === userId || (t.plan_id && planIds.has(t.plan_id)));
  const todoIds = new Set(todos.map((t) => t.id));

  const allLogs = getLocalItem<ExecutionLog[]>(STORAGE_KEYS.LOGS, memoryStore.logs);
  const logs = allLogs.filter((l) => l.user_id === userId || (l.todo_id && todoIds.has(l.todo_id)));

  const allReviews = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, memoryStore.reviews);
  const reviews = allReviews.filter((r) => r.user_id === userId || (r.plan_id && planIds.has(r.plan_id)));

  return {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    plans,
    planRevisions: revisions,
    todos,
    executionLogs: logs,
    reviews,
  };
}

/**
 * T07-C134: 계정 삭제 시 내 자료 연쇄 삭제 (Cascade Deletion)
 */
export async function cascadeDeleteUserData(userId: string): Promise<void> {
  const plans = getLocalItem<Plan[]>(STORAGE_KEYS.PLANS, memoryStore.plans).filter((p) => p.user_id !== userId);
  const revisions = getLocalItem<PlanRevision[]>(STORAGE_KEYS.REVISIONS, memoryStore.revisions).filter(
    (r) => r.user_id !== userId,
  );
  const todos = getLocalItem<Todo[]>(STORAGE_KEYS.TODOS, memoryStore.todos).filter((t) => t.user_id !== userId);
  const logs = getLocalItem<ExecutionLog[]>(STORAGE_KEYS.LOGS, memoryStore.logs).filter((l) => l.user_id !== userId);
  const reviews = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, memoryStore.reviews).filter((r) => r.user_id !== userId);
  const obsRules = getLocalItem<ObservationRule[]>(STORAGE_KEYS.OBSERVATION_RULES, memoryStore.observationRules).filter(
    (r) => r.user_id !== userId,
  );

  setLocalItem(STORAGE_KEYS.PLANS, plans);
  setLocalItem(STORAGE_KEYS.REVISIONS, revisions);
  setLocalItem(STORAGE_KEYS.TODOS, todos);
  setLocalItem(STORAGE_KEYS.LOGS, logs);
  setLocalItem(STORAGE_KEYS.REVIEWS, reviews);
  setLocalItem(STORAGE_KEYS.OBSERVATION_RULES, obsRules);

  memoryStore = {
    plans,
    revisions,
    todos,
    logs,
    reviews,
    observationRules: obsRules,
  };
}

export function resetToSeedData(): void {
  setLocalItem(STORAGE_KEYS.PLANS, [INITIAL_PLAN, USER_B_PLAN]);
  setLocalItem(STORAGE_KEYS.REVISIONS, INITIAL_REVISIONS);
  setLocalItem(STORAGE_KEYS.TODOS, [...INITIAL_TODOS, USER_B_TODO]);
  setLocalItem(STORAGE_KEYS.LOGS, INITIAL_EXECUTION_LOGS);
  setLocalItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  setLocalItem(STORAGE_KEYS.OBSERVATION_RULES, [INITIAL_OBSERVATION_RULE]);
  memoryStore = {
    plans: [INITIAL_PLAN, USER_B_PLAN],
    revisions: INITIAL_REVISIONS,
    todos: [...INITIAL_TODOS, USER_B_TODO],
    logs: INITIAL_EXECUTION_LOGS,
    reviews: INITIAL_REVIEWS,
    observationRules: [INITIAL_OBSERVATION_RULE],
  };
}
