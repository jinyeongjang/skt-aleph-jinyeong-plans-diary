import type { Plan, PlanRevision, Todo, ExecutionLog, Review } from '../types/pds.ts';

export const USER_A_ID = 'usr-jinyeong-001';
export const USER_B_ID = 'usr-attacker-002';

export const INITIAL_PLAN_ID = 'e7b0a850-6e42-4f91-a67b-1a9829f04123';
export const ATTACKER_PLAN_ID = 'plan-attacker-secret-999';

/**
 * SKT ALEPH 1기: 기업 현장 중심 보안 & 네트워크 인프라 트랙 실제 교육 계획
 * 출처: https://skt-aleph-jinyeongblog.vercel.app (장진영 블로그)
 */
export const INITIAL_PLAN: Plan = {
  id: INITIAL_PLAN_ID,
  user_id: USER_A_ID,
  title: 'SKT ALEPH 1기: 기업 현장 중심 보안 & 네트워크 인프라 트랙 마스터',
  start_date: '2026-09-15',
  end_date: '2026-09-19',
  priority: 'high',
  success_criteria:
    'TCP/IP 패킷 분석, DNS 망구성, VLAN 라우팅, 방화벽 정책 및 제로트러스트 감사 완수 (시간 오차 편차 최소화 달성)',
  estimated_minutes: 440,
  created_at: '2026-09-15T08:00:00+09:00',
  updated_at: '2026-09-16T22:30:00+09:00',
};

export const INITIAL_REVISIONS: PlanRevision[] = [
  {
    id: 'f1a9b201-3829-4d22-91bf-55bc678a1001',
    plan_id: INITIAL_PLAN_ID,
    user_id: USER_A_ID,
    revision_number: 1,
    title: 'SKT ALEPH 1기: 네트워크 기초 및 시스템 보안 초안',
    start_date: '2026-09-15',
    end_date: '2026-09-19',
    priority: 'medium',
    success_criteria: '네트워크 기초 이론 학습 및 단순 리눅스 방화벽 명령어 실습',
    estimated_minutes: 360,
    revised_at: '2026-09-15T08:00:00+09:00',
  },
];

export const INITIAL_TODOS: Todo[] = [
  {
    id: 't01-tcpip-wireshark',
    plan_id: INITIAL_PLAN_ID,
    user_id: USER_A_ID,
    content: 'Day 1: TCP/IP 4계층 프로토콜 분석 및 Wireshark 3-Way Handshake 패킷 캡처 실습',
    status: 'completed',
    due_date: '2026-09-15',
    priority: 'high',
    tags: ['네트워크', 'TCP/IP', 'Wireshark'],
    estimated_minutes: 90,
    is_deleted: false,
    completed_at: '2026-09-15T11:40:00+09:00',
    created_at: '2026-09-15T09:00:00+09:00',
    updated_at: '2026-09-15T11:40:00+09:00',
  },
  {
    id: 't02-dns-routing',
    plan_id: INITIAL_PLAN_ID,
    user_id: USER_A_ID,
    content: 'Day 2: DNS 계층 구조 및 재귀적/반복적 쿼리 응답 캐싱 메커니즘 분석',
    status: 'completed',
    due_date: '2026-09-16',
    priority: 'high',
    tags: ['네트워크', 'DNS', '인프라'],
    estimated_minutes: 60,
    is_deleted: false,
    completed_at: '2026-09-16T14:15:00+09:00',
    created_at: '2026-09-16T09:00:00+09:00',
    updated_at: '2026-09-16T14:15:00+09:00',
  },
  {
    id: 't03-vlan-switching',
    plan_id: INITIAL_PLAN_ID,
    user_id: USER_A_ID,
    content: 'Day 3: L2/L3 스위치 기반 VLAN 분할 및 IP 라우팅 망구성 시뮬레이션 [버퍼20%]',
    status: 'completed',
    due_date: '2026-09-17',
    priority: 'high',
    tags: ['네트워크', '라우팅', 'VLAN'],
    estimated_minutes: 110,
    is_deleted: false,
    completed_at: '2026-09-17T15:55:00+09:00',
    created_at: '2026-09-17T09:00:00+09:00',
    updated_at: '2026-09-17T15:55:00+09:00',
  },
  {
    id: 't04-firewall-iptables',
    plan_id: INITIAL_PLAN_ID,
    user_id: USER_A_ID,
    content: 'Day 4: 리눅스(Ubuntu/Kali) iptables 및 ufw 방화벽 인바운드/아웃바운드 보안 정책 수립 [버퍼20%]',
    status: 'completed',
    due_date: '2026-09-18',
    priority: 'high',
    tags: ['보안', '방화벽', 'Linux'],
    estimated_minutes: 90,
    is_deleted: false,
    completed_at: '2026-09-18T16:25:00+09:00',
    created_at: '2026-09-18T09:00:00+09:00',
    updated_at: '2026-09-18T16:25:00+09:00',
  },
  {
    id: 't05-zero-trust-audit',
    plan_id: INITIAL_PLAN_ID,
    user_id: USER_A_ID,
    content: 'Day 5: 제로 트러스트(Zero Trust) 아키텍처 원칙 기반 엔드포인트 접근 제어 및 네트워크 감사 [버퍼20%]',
    status: 'completed',
    due_date: '2026-09-19',
    priority: 'medium',
    tags: ['보안', 'ZeroTrust', 'ZTA'],
    estimated_minutes: 90,
    is_deleted: false,
    completed_at: '2026-09-19T17:30:00+09:00',
    created_at: '2026-09-19T09:00:00+09:00',
    updated_at: '2026-09-19T17:30:00+09:00',
  },
];

export const INITIAL_EXECUTION_LOGS: ExecutionLog[] = [
  {
    id: 'exec-net-d01',
    todo_id: 't01-tcpip-wireshark',
    user_id: USER_A_ID,
    start_time: '2026-09-15T10:00:00+09:00',
    end_time: '2026-09-15T11:40:00+09:00',
    actual_minutes: 100,
    blocker_reason: null,
    idempotency_key: 'key-exec-net-d01',
    created_at: '2026-09-15T11:40:00+09:00',
  },
  {
    id: 'exec-net-d02',
    todo_id: 't02-dns-routing',
    user_id: USER_A_ID,
    start_time: '2026-09-16T13:00:00+09:00',
    end_time: '2026-09-16T14:15:00+09:00',
    actual_minutes: 75,
    blocker_reason: null,
    idempotency_key: 'key-exec-net-d02',
    created_at: '2026-09-16T14:15:00+09:00',
  },
  {
    id: 'exec-net-d03',
    todo_id: 't03-vlan-switching',
    user_id: USER_A_ID,
    start_time: '2026-09-17T14:00:00+09:00',
    end_time: '2026-09-17T15:55:00+09:00',
    actual_minutes: 115,
    blocker_reason: '라우터 간 서브넷 마스크 불일치로 인한 OSPF 인접 관계(Adjacency) 디버깅 및 해결',
    idempotency_key: 'key-exec-net-d03',
    created_at: '2026-09-17T15:55:00+09:00',
  },
  {
    id: 'exec-net-d04',
    todo_id: 't04-firewall-iptables',
    user_id: USER_A_ID,
    start_time: '2026-09-18T15:00:00+09:00',
    end_time: '2026-09-18T16:25:00+09:00',
    actual_minutes: 85,
    blocker_reason: null,
    idempotency_key: 'key-exec-net-d04',
    created_at: '2026-09-18T16:25:00+09:00',
  },
  {
    id: 'exec-net-d05',
    todo_id: 't05-zero-trust-audit',
    user_id: USER_A_ID,
    start_time: '2026-09-19T16:00:00+09:00',
    end_time: '2026-09-19T17:30:00+09:00',
    actual_minutes: 90,
    blocker_reason: null,
    idempotency_key: 'key-exec-net-d05',
    created_at: '2026-09-19T17:30:00+09:00',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-net-01',
    plan_id: INITIAL_PLAN_ID,
    user_id: USER_A_ID,
    next_action_note:
      '네트워크 시뮬레이션 시 라우팅 테이블 및 서브넷 설정을 사전 다이어그램으로 먼저 도식화한 뒤 실습에 착수하여 트러블슈팅 시간 단축하기',
    created_at: '2026-09-17T16:30:00+09:00',
  },
];

/**
 * User B (격리된 침투 테스트 사용자)의 데이터 (T07-C116)
 */
export const USER_B_PLAN: Plan = {
  id: ATTACKER_PLAN_ID,
  user_id: USER_B_ID,
  title: '비인가 침투 테스트용 비밀 격리 프로젝트 (User B 전용)',
  start_date: '2026-09-15',
  end_date: '2026-09-20',
  priority: 'low',
  success_criteria: '타 계정(User A)에서 이 계획과 할 일이 절대 열람/수정/삭제되지 않아야 함',
  estimated_minutes: 120,
  created_at: '2026-09-15T10:00:00+09:00',
  updated_at: '2026-09-15T10:00:00+09:00',
};

export const USER_B_TODO: Todo = {
  id: 'todo-attacker-secret-888',
  plan_id: ATTACKER_PLAN_ID,
  user_id: USER_B_ID,
  content: 'User B 전용 기밀 할 일 데이터 (User A가 접근 시 403 Forbidden 차단 대상)',
  status: 'pending',
  due_date: '2026-09-18',
  priority: 'medium',
  tags: ['Secret', 'AttackerOnly'],
  estimated_minutes: 60,
  is_deleted: false,
  completed_at: null,
  created_at: '2026-09-15T10:30:00+09:00',
  updated_at: '2026-09-15T10:30:00+09:00',
};
