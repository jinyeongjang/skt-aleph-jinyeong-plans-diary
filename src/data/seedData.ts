import type { Plan, PlanRevision, Todo, ExecutionLog, Review } from '../types/pds.ts';

export const INITIAL_PLAN_ID = 'e7b0a850-6e42-4f91-a67b-1a9829f04123';

/**
 * SKT ALEPH 1기: 기업 현장 중심 보안 & 네트워크 인프라 트랙 실제 교육 계획
 * 출처: https://skt-aleph-jinyeongblog.vercel.app (장진영 블로그)
 */
export const INITIAL_PLAN: Plan = {
  id: INITIAL_PLAN_ID,
  title: 'SKT ALEPH 1기: 기업 현장 중심 보안 & 네트워크 인프라 트랙 마스터',
  start_date: '2026-09-01',
  end_date: '2026-09-30',
  priority: 'high',
  success_criteria:
    'TCP/IP 계층별 패킷 분석, DNS/IP 라우팅 망구성, 방화벽·IDS/IPS 보안 정책 수립 및 Python 로그 자동화 파이프라인 구축 완료',
  estimated_minutes: 480,
  created_at: '2026-09-01T09:00:00+09:00',
  updated_at: '2026-09-15T11:00:00+09:00',
};

export const INITIAL_REVISIONS: PlanRevision[] = [
  {
    id: 'f1a9b201-3829-4d22-91bf-55bc678a1001',
    plan_id: INITIAL_PLAN_ID,
    revision_number: 1,
    title: 'SKT ALEPH 1기: 네트워크 기초 및 시스템 보안 초안',
    start_date: '2026-09-01',
    end_date: '2026-09-25',
    priority: 'medium',
    success_criteria: '네트워크 기초 이론 학습 및 단순 리눅스 방화벽 명령어 실습',
    estimated_minutes: 360,
    revised_at: '2026-09-01T09:00:00+09:00',
  },
];

export const INITIAL_TODOS: Todo[] = [
  {
    id: 't01-tcpip-wireshark',
    plan_id: INITIAL_PLAN_ID,
    content: 'TCP/IP 4계층 프로토콜 분석 및 Wireshark 3-Way Handshake 패킷 캡처 실습',
    status: 'completed',
    due_date: '2026-09-08',
    priority: 'high',
    tags: ['네트워크', 'TCP/IP', 'Wireshark'],
    estimated_minutes: 90,
    is_deleted: false,
    completed_at: '2026-09-08T11:40:00+09:00',
    created_at: '2026-09-01T10:00:00+09:00',
    updated_at: '2026-09-08T11:40:00+09:00',
  },
  {
    id: 't02-dns-routing',
    plan_id: INITIAL_PLAN_ID,
    content: 'DNS 계층 구조 및 재귀적/반복적 쿼리 응답 캐싱 메커니즘 분석',
    status: 'completed',
    due_date: '2026-09-11',
    priority: 'high',
    tags: ['네트워크', 'DNS', '인프라'],
    estimated_minutes: 60,
    is_deleted: false,
    completed_at: '2026-09-11T14:15:00+09:00',
    created_at: '2026-09-01T10:05:00+09:00',
    updated_at: '2026-09-11T14:15:00+09:00',
  },
  {
    id: 't03-vlan-switching',
    plan_id: INITIAL_PLAN_ID,
    content: 'L2/L3 스위치 기반 VLAN 분할 및 IP 라우팅 망구성 시뮬레이션',
    status: 'completed',
    due_date: '2026-09-14',
    priority: 'high',
    tags: ['네트워크', '라우팅', 'VLAN'],
    estimated_minutes: 90,
    is_deleted: false,
    completed_at: '2026-09-14T15:55:00+09:00',
    created_at: '2026-09-01T10:10:00+09:00',
    updated_at: '2026-09-14T15:55:00+09:00',
  },
  {
    id: 't04-firewall-iptables',
    plan_id: INITIAL_PLAN_ID,
    content: '리눅스(Ubuntu/Kali) iptables 및 ufw 방화벽 인바운드/아웃바운드 보안 정책 수립',
    status: 'pending',
    due_date: '2026-09-18',
    priority: 'high',
    tags: ['보안', '방화벽', 'Linux'],
    estimated_minutes: 75,
    is_deleted: false,
    completed_at: null,
    created_at: '2026-09-01T10:15:00+09:00',
    updated_at: '2026-09-01T10:15:00+09:00',
  },
  {
    id: 't06-zero-trust-audit',
    plan_id: INITIAL_PLAN_ID,
    content: '제로 트러스트(Zero Trust) 아키텍처 원칙 기반 엔드포인트 접근 제어 및 네트워크 감사',
    status: 'pending',
    due_date: '2026-09-10', // 오늘(2026-09-15)보다 앞선 날짜 -> 마감 지연(Delayed) 항목 (T06-C30 충족)
    priority: 'medium',
    tags: ['보안', 'ZeroTrust', 'ZTA'],
    estimated_minutes: 75,
    is_deleted: false,
    completed_at: null,
    created_at: '2026-09-01T10:25:00+09:00',
    updated_at: '2026-09-01T10:25:00+09:00',
  },
];

export const INITIAL_EXECUTION_LOGS: ExecutionLog[] = [
  {
    id: 'exec-net-01',
    todo_id: 't01-tcpip-wireshark',
    start_time: '2026-09-08T10:00:00+09:00',
    end_time: '2026-09-08T11:40:00+09:00',
    actual_minutes: 100,
    blocker_reason: null,
    idempotency_key: 'key-exec-net-01',
    created_at: '2026-09-08T11:40:00+09:00',
  },
  {
    id: 'exec-net-02',
    todo_id: 't02-dns-routing',
    start_time: '2026-09-11T13:00:00+09:00',
    end_time: '2026-09-11T14:15:00+09:00',
    actual_minutes: 75,
    blocker_reason: null,
    idempotency_key: 'key-exec-net-02',
    created_at: '2026-09-11T14:15:00+09:00',
  },
  {
    id: 'exec-net-03',
    todo_id: 't03-vlan-switching',
    start_time: '2026-09-14T14:00:00+09:00',
    end_time: '2026-09-14T15:55:00+09:00',
    actual_minutes: 115,
    blocker_reason: '라우터 간 서브넷 마스크 불일치로 인한 OSPF 인접 관계(Adjacency) 미형성 문제 디버깅 및 해결',
    idempotency_key: 'key-exec-net-03',
    created_at: '2026-09-14T15:55:00+09:00',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-net-01',
    plan_id: INITIAL_PLAN_ID,
    next_action_note:
      '네트워크 시뮬레이션 시 라우팅 테이블 및 서브넷 설정을 사전 다이어그램으로 먼저 도식화한 뒤 실습에 착수하여 트러블슈팅 시간 단축하기',
    created_at: '2026-09-14T16:30:00+09:00',
  },
];
