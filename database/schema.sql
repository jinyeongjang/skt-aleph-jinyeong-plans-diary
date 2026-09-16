-- ============================================================================
-- SKT ALEPH 과제 6: 플랜두씨 다이어리 1 — Supabase PostgreSQL 통합 스크립트
-- Target: PostgreSQL 15+ / Supabase
-- Reference: contracts/pds-schema-v2.json
-- ============================================================================

-- ============================================================================
-- 1. 테이블 생성 (Schema Definition)
-- ============================================================================

-- 1-1. 계획 테이블 (카드 1: T06-C04 ~ T06-C08)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  success_criteria TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-2. 계획 수정 이력 스냅샷 테이블 (T06-C08: 원본 계획 보존)
CREATE TABLE IF NOT EXISTS plan_revisions (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  revised_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-3. 할 일 테이블 (카드 2: T06-C09 ~ T06-C20)
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-4. 실제 실행 기록 테이블 (카드 3: T06-C21 ~ T06-C27)
CREATE TABLE IF NOT EXISTS execution_logs (
  id TEXT PRIMARY KEY,
  todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_minutes INTEGER NOT NULL,
  blocker_reason TEXT,
  idempotency_key TEXT UNIQUE, -- T06-C21 연타 멱등성 중복 방지 제약
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-5. 돌아보기 및 회고 테이블 (카드 4: T06-C28 ~ T06-C33)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  next_action_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. Row Level Security (RLS) 및 무로그인 공개 정책 (T06-C01)
-- ============================================================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 중복 에러 방지를 위해 삭제 후 재생성
DROP POLICY IF EXISTS "Allow public all on plans" ON plans;
DROP POLICY IF EXISTS "Allow public all on plan_revisions" ON plan_revisions;
DROP POLICY IF EXISTS "Allow public all on todos" ON todos;
DROP POLICY IF EXISTS "Allow public all on execution_logs" ON execution_logs;
DROP POLICY IF EXISTS "Allow public all on reviews" ON reviews;

CREATE POLICY "Allow public all on plans" ON plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on plan_revisions" ON plan_revisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on todos" ON todos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on execution_logs" ON execution_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 3. 초기 시드 데이터 삽입 (T06-C78 ~ T06-C81)
-- ============================================================================

-- 3-1. 초기 계획 1건 (T06-C78)
INSERT INTO plans (id, title, start_date, end_date, priority, success_criteria, estimated_minutes, created_at, updated_at)
VALUES (
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'SKT ALEPH 1기: 기업 현장 중심 보안 & 네트워크 인프라 트랙 마스터',
  '2026-09-01',
  '2026-09-30',
  'high',
  'TCP/IP 계층별 패킷 분석, DNS/IP 라우팅 망구성, 방화벽·IDS/IPS 보안 정책 수립 및 Python 로그 자동화 파이프라인 구축 완료',
  480,
  '2026-09-01T09:00:00+09:00',
  '2026-09-15T11:00:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 3-2. 초기 계획 수정 이력 스냅샷 1건 (T06-C08)
INSERT INTO plan_revisions (id, plan_id, revision_number, title, start_date, end_date, priority, success_criteria, estimated_minutes, revised_at)
VALUES (
  'f1a9b201-3829-4d22-91bf-55bc678a1001',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  1,
  'SKT ALEPH 1기: 네트워크 기초 및 시스템 보안 초안',
  '2026-09-01',
  '2026-09-25',
  'medium',
  '네트워크 기초 이론 학습 및 단순 리눅스 방화벽 명령어 실습',
  360,
  '2026-09-01T09:00:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 3-3. 초기 할 일 5건 (T06-C79)
INSERT INTO todos (id, plan_id, content, status, due_date, priority, tags, estimated_minutes, is_deleted, completed_at, created_at, updated_at)
VALUES 
(
  't01-tcpip-wireshark',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'TCP/IP 4계층 프로토콜 분석 및 Wireshark 3-Way Handshake 패킷 캡처 실습',
  'completed',
  '2026-09-08',
  'high',
  ARRAY['네트워크', 'TCP/IP', 'Wireshark'],
  90,
  false,
  '2026-09-08T11:40:00+09:00',
  '2026-09-01T10:00:00+09:00',
  '2026-09-08T11:40:00+09:00'
),
(
  't02-dns-routing',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'DNS 계층 구조 및 재귀적/반복적 쿼리 응답 캐싱 메커니즘 분석',
  'completed',
  '2026-09-11',
  'high',
  ARRAY['네트워크', 'DNS', '인프라'],
  60,
  false,
  '2026-09-11T14:15:00+09:00',
  '2026-09-01T10:05:00+09:00',
  '2026-09-11T14:15:00+09:00'
),
(
  't03-vlan-switching',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'L2/L3 스위치 기반 VLAN 분할 및 IP 라우팅 망구성 시뮬레이션',
  'completed',
  '2026-09-14',
  'high',
  ARRAY['네트워크', '라우팅', 'VLAN'],
  90,
  false,
  '2026-09-14T15:55:00+09:00',
  '2026-09-01T10:10:00+09:00',
  '2026-09-14T15:55:00+09:00'
),
(
  't04-firewall-iptables',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  '리눅스(Ubuntu/Kali) iptables 및 ufw 방화벽 인바운드/아웃바운드 보안 정책 수립',
  'pending',
  '2026-09-18',
  'high',
  ARRAY['보안', '방화벽', 'Linux'],
  75,
  false,
  null,
  '2026-09-01T10:15:00+09:00',
  '2026-09-01T10:15:00+09:00'
),
(
  't06-zero-trust-audit',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  '제로 트러스트(Zero Trust) 아키텍처 원칙 기반 엔드포인트 접근 제어 및 네트워크 감사',
  'pending',
  '2026-09-10', -- 지연(Delayed) 항목
  'medium',
  ARRAY['보안', 'ZeroTrust', 'ZTA'],
  75,
  false,
  null,
  '2026-09-01T10:25:00+09:00',
  '2026-09-01T10:25:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 3-4. 초기 실행 기록 3건 (T06-C80)
INSERT INTO execution_logs (id, todo_id, start_time, end_time, actual_minutes, blocker_reason, idempotency_key, created_at)
VALUES 
(
  'exec-net-01',
  't01-tcpip-wireshark',
  '2026-09-08T10:00:00+09:00',
  '2026-09-08T11:40:00+09:00',
  100,
  null,
  'key-exec-net-01',
  '2026-09-08T11:40:00+09:00'
),
(
  'exec-net-02',
  't02-dns-routing',
  '2026-09-11T13:00:00+09:00',
  '2026-09-11T14:15:00+09:00',
  75,
  null,
  'key-exec-net-02',
  '2026-09-11T14:15:00+09:00'
),
(
  'exec-net-03',
  't03-vlan-switching',
  '2026-09-14T14:00:00+09:00',
  '2026-09-14T15:55:00+09:00',
  115,
  '라우터 간 서브넷 마스크 불일치로 인한 OSPF 인접 관계(Adjacency) 미형성 문제 디버깅 및 해결',
  'key-exec-net-03',
  '2026-09-14T15:55:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 3-5. 초기 회고 1건 (T06-C33 피드백 연계)
INSERT INTO reviews (id, plan_id, next_action_note, created_at)
VALUES (
  'rev-net-01',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  '네트워크 시뮬레이션 시 라우팅 테이블 및 서브넷 설정을 사전 다이어그램으로 먼저 도식화한 뒤 실습에 착수하여 트러블슈팅 시간 단축하기',
  '2026-09-14T16:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;
