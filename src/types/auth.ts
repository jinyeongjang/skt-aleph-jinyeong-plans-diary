/**
 * 과제 7: 인증 및 보안 타입 정의 (Auth & Security Types)
 * 기준 문서: condition/condi_7-1.txt ~ condi_7-6.txt
 */

export interface User {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User;
  token: string; // Bearer JWT Token
  expiresAt: number; // Unix timestamp in ms
}

export interface AuthAuditRecord {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  requestPayload?: unknown;
  status: number; // 200, 201, 401, 403, 404
  responseBody: unknown;
  actorUserId: string;
  targetUserId?: string;
  outcome: 'SUCCESS' | 'BLOCKED_401' | 'BLOCKED_403' | 'BLOCKED_404';
  description: string;
}

export interface ObservationRule {
  id: string;
  user_id: string;
  observation_question: string; // T07-C04: 1일차 관찰 질문
  observation_metric: string; // T07-C05: 관찰 지표
  metric_unit: string; // T07-C06: 단위
  calculation_rule: string; // T07-C08: 계산 규칙
  missing_value_rule: string; // T07-C23: 결측치 처리 규칙
  duplicate_value_rule: string; // T07-C24: 중복치 처리 규칙
  outlier_value_rule: string; // T07-C25: 이상치 처리 규칙
  rounding_rule: string; // T07-C26: 반올림 규칙
  week_start_day: string; // T07-C27: 주 시작 요일
  initial_plan_rule: string; // 변경 전 계획 규칙
  changed_plan_rule: string; // T07-C09: 변경 후 계획 규칙
  rule_changed_at: string; // T07-C10: 규칙 변경 시각
  rule_change_reason: string; // T07-C11: 규칙 변경 사유
  created_at: string;
}
