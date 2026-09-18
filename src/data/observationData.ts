/**
 * 과제 7: 5일 관찰 질문, 지표 및 계획 규칙 변경 메타데이터
 * 통과 기준: T07-C04 ~ T07-C27, T07-C132
 */

import type { ObservationRule } from '../types/auth.ts';

export const INITIAL_OBSERVATION_RULE: ObservationRule = {
  id: 'obs-rule-jinyeong-01',
  user_id: 'usr-jinyeong-001',
  // T07-C04: 1일차에 답하려는 질문 한 문장이 고정되어 있다
  observation_question: '계획 대비 실제 소요 시간의 편차를 줄이고 예측 정확도를 80% 이상으로 유지할 수 있는가?',
  // T07-C05: 1일차에 관찰 지표 한 개가 고정되어 있다
  observation_metric: '시간 오차 편차 (Time Variance = Actual - Estimated)',
  // T07-C06: 1일차에 관찰 지표의 단위가 고정되어 있다
  metric_unit: '분 (Minutes)',
  // T07-C08: 집계·계산 규칙 (동일 규칙 적용)
  calculation_rule: '시간 오차(분) = 실제 소요 시간(actual_minutes) - 예상 소요 시간(estimated_minutes)',
  // T07-C23: 값이 빠졌을 때(결측치) 처리 기준
  missing_value_rule: '결측치: 실행 시간이 누락된 작업은 기본 0분으로 대체 집계하고 대시보드에 결측 플래그 표기',
  // T07-C24: 값이 중복될 때(중복치) 처리 기준
  duplicate_value_rule: '중복치: 동일 할 일에 대한 중복 실행 기록은 멱등키(idempotency_key) 기반 최초 1건만 인정',
  // T07-C25: 값이 유난히 튈 때(이상치) 처리 기준
  outlier_value_rule: '이상치: 단일 작업 480분(8시간) 초과 시 이상치로 플래그하고 비고란에 구체적 지연 사유 명시',
  // T07-C26: 반올림 규칙
  rounding_rule:
    '반올림: 모든 비율(%) 및 평균 연산은 소수점 둘째 자리에서 반올림하여 소수점 첫째 자리까지 표기 (예: 12.5%)',
  // T07-C27: 주 시작 요일
  week_start_day: '대한민국 표준 ISO 8601 기준 월요일(Monday)',
  // 변경 전 계획 규칙 (1일차~2일차)
  initial_plan_rule: '단순 작업 난이도 기준 예상 시간 산정 (별도 지연 버퍼 없음)',
  // T07-C09: 변경 후 계획 규칙 (3일차~5일차)
  changed_plan_rule:
    '네트워크 환경 설정 및 트러블슈팅을 감안하여 기본 예상 시간에 20% 안전 버퍼 추가 반영 (예: 기본 90분 -> 110분)',
  // T07-C10: 계획 규칙 바꾼 시각 (2일차 뒤 ~ 3일차 앞)
  rule_changed_at: '2026-09-18T22:30:00+09:00',
  // T07-C11: 계획 규칙 바꾼 이유
  rule_change_reason:
    '1·2일차 실습 시 네트워크 패킷 환경 설정 및 트러블슈팅 지연이 반복되어, 3일차부터 예상 시간에 20%의 안전 버퍼를 선제 반영하기로 결정함.',
  created_at: '2026-09-17T08:00:00+09:00',
};

export interface DayObservationEntry {
  dayNumber: number; // 1 ~ 5
  date: string; // YYYY-MM-DD (Asia/Seoul)
  taskName: string;
  estimatedMinutes: number;
  actualMinutes: number;
  varianceMinutes: number; // actual - estimated
  rulePhase: 'BEFORE_CHANGE' | 'AFTER_CHANGE';
  note: string;
}

/**
 * T07-C07 & T07-C132: Asia/Seoul 기준 서로 다른 5일간의 실제 기록 세트
 */
export const FIVE_DAYS_OBSERVATION_DATA: DayObservationEntry[] = [
  {
    dayNumber: 1,
    date: '2026-09-17',
    taskName: 'TCP/IP 4계층 프로토콜 분석 및 Wireshark 패킷 캡처 실습',
    estimatedMinutes: 90,
    actualMinutes: 100,
    varianceMinutes: 10,
    rulePhase: 'BEFORE_CHANGE',
    note: '기본 규칙 적용: 캡처 필터 설정 과정에서 예상보다 10분 지연',
  },
  {
    dayNumber: 2,
    date: '2026-09-18',
    taskName: 'DNS 계층 구조 및 캐싱 메커니즘 쿼리 분석',
    estimatedMinutes: 60,
    actualMinutes: 75,
    varianceMinutes: 15,
    rulePhase: 'BEFORE_CHANGE',
    note: '기본 규칙 적용: 재귀 쿼리 DNS TTL 만료 대기로 15분 지연 (👉 22:30 계획 규칙 변경 결정)',
  },
  {
    dayNumber: 3,
    date: '2026-09-19',
    taskName: 'L2/L3 스위치 기반 VLAN 분할 및 IP 라우팅 망구성 [버퍼20%]',
    estimatedMinutes: 110,
    actualMinutes: 115,
    varianceMinutes: 5,
    rulePhase: 'AFTER_CHANGE',
    note: '새 규칙 적용 (기본 90분 + 20% 버퍼 = 110분): OSPF 인접 관계 트러블슈팅에도 오차 5분으로 대폭 축소',
  },
  {
    dayNumber: 4,
    date: '2026-09-20',
    taskName: '리눅스(Ubuntu) iptables 및 ufw 방화벽 보안 정책 수립 [버퍼20%]',
    estimatedMinutes: 90,
    actualMinutes: 85,
    varianceMinutes: -5,
    rulePhase: 'AFTER_CHANGE',
    note: '새 규칙 적용 (기본 75분 + 20% 버퍼 = 90분): 인바운드 룰셋 사전 템플릿화로 5분 단축 완료',
  },
  {
    dayNumber: 5,
    date: '2026-09-21',
    taskName: '제로 트러스트(Zero Trust) 엔드포인트 접근 제어 및 네트워크 감사 [버퍼20%]',
    estimatedMinutes: 90,
    actualMinutes: 90,
    varianceMinutes: 0,
    rulePhase: 'AFTER_CHANGE',
    note: '새 규칙 적용 (기본 75분 + 20% 버퍼 = 90분): 오차 0분으로 완벽한 계획 대비 실행 일치 달성',
  },
];

/**
 * 5일 관찰 손계산(수기 검산) 요약 (T07-C132)
 */
export const HAND_CALCULATION_SUMMARY = {
  totalEstimated: 440, // 90 + 60 + 110 + 90 + 90
  totalActual: 465, // 100 + 75 + 115 + 85 + 90
  totalVariance: 25, // 465 - 440
  beforeChangeAvgVariance: 12.5, // (10 + 15) / 2
  afterChangeAvgVariance: 0.0, // (5 + (-5) + 0) / 3
  accuracyImprovement: '규칙 변경 전 일평균 +12.5분 오차 ➔ 변경 후 일평균 0.0분으로 예측 정확도 대폭 향상 달성',
};
