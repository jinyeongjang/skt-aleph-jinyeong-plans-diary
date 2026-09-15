/**
 * 플랜두씨 다이어리 1 (Plan-Do-See Diary) 타입 정의
 * 기준 명세: contracts/pds-schema-v2.json
 */

export type Priority = 'high' | 'medium' | 'low';
export type TodoStatus = 'pending' | 'completed';

export interface Plan {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  priority: Priority;
  success_criteria: string;
  estimated_minutes: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface PlanRevision {
  id: string;
  plan_id: string;
  revision_number: number;
  title: string;
  start_date: string;
  end_date: string;
  priority: Priority;
  success_criteria: string;
  estimated_minutes: number;
  revised_at: string; // ISO 8601
}

export interface Todo {
  id: string;
  plan_id: string;
  content: string;
  status: TodoStatus;
  due_date: string; // YYYY-MM-DD
  priority: Priority;
  tags: string[];
  estimated_minutes: number;
  is_deleted: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutionLog {
  id: string;
  todo_id: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  actual_minutes: number;
  blocker_reason: string | null;
  idempotency_key: string;
  created_at: string;
}

export interface Review {
  id: string;
  plan_id: string;
  next_action_note: string;
  created_at: string;
}

/**
 * 돌아보기 집계 통계 지표 (카드 4 - T06-C28~C32)
 */
export interface SeeMetrics {
  totalPlanTodos: number; // T06-C28: 딸린 지우지 않은 할 일 수
  completedTodos: number; // T06-C29: 현재 완료 상태인 할 일 수
  delayedTodos: number; // T06-C30: 마감일 지난 미완료 건 (지연 수)
  blockedTodos: number; // T06-C31: 막힌 이유가 있는 건
  totalEstimatedMinutes: number; // T06-C32: 예상 시간 합계
  totalActualMinutes: number; // T06-C32: 실제 시간 합계
  varianceMinutes: number; // T06-C32: 실제 시간 - 예상 시간
}

/**
 * 전체 백업 및 내보내기 (Export / Import - T06-C36)
 */
export interface PdsFullDataExport {
  exportedAt: string;
  version: string;
  plans: Plan[];
  planRevisions: PlanRevision[];
  todos: Todo[];
  executionLogs: ExecutionLog[];
  reviews: Review[];
}

/**
 * 사전 고정 10대 검사 케이스 및 실행 결과 타입
 */
export interface FixedTestCase {
  id: string; // T06-TEST-01 ~ T06-TEST-10
  name: string;
  category: 'metadata' | 'ingestion' | 'resilience' | 'storage' | 'analysis' | 'boundary' | 'security';
  inputDescription: string;
  expectedDescription: string;
  boundaryNote?: string;
  passedInA: boolean;
  passedInB: boolean;
}

export interface TestExecutionResult {
  testId: string;
  name: string;
  passed: boolean;
  actualOutput: string;
  executionTimeMs: number;
  logs: string[];
}
