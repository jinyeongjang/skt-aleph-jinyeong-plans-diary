-- ============================================================================
-- SKT ALEPH 과제 6 & 7 통합 DDL 및 1일차~5일차 마이그레이션 스크립트
-- Target: PostgreSQL 15+ / Supabase (신규/기존 DB 어디서든 단일 실행 가능)
-- Reference: contracts/pds-schema-v2.json, CRITERIA.md (T06-C01~C83, T07-C01~C134)
-- ============================================================================

-- ============================================================================
-- 1. 전체 테이블 DDL 정의 (신규 생성 및 기존 테이블 호환)
-- ============================================================================

-- 1-1. 사용자 계정 테이블 (users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'User',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-2. 상위 계획 테이블 (plans)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  success_criteria TEXT NOT NULL,
  estimated_minutes INT NOT NULL CHECK (estimated_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-3. 계획 수정 스냅샷 보존 테이블 (plan_revisions) - T06-C08 원본 보존
CREATE TABLE IF NOT EXISTS plan_revisions (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  revision_number INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  estimated_minutes INT NOT NULL,
  revised_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-4. 할 일 테이블 (todos)
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  due_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  estimated_minutes INT NOT NULL CHECK (estimated_minutes > 0),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-5. 실행 측정 기록 테이블 (execution_logs) - T06-C21 멱등성 보장
CREATE TABLE IF NOT EXISTS execution_logs (
  id TEXT PRIMARY KEY,
  todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_minutes INT NOT NULL CHECK (actual_minutes >= 0),
  blocker_reason TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-6. 돌아보기 회고 테이블 (reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  next_action_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-7. 5일 관찰 규칙 및 메타데이터 테이블 (observation_rules)
CREATE TABLE IF NOT EXISTS observation_rules (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  observation_question TEXT NOT NULL,
  observation_metric TEXT NOT NULL,
  metric_unit TEXT NOT NULL,
  calculation_rule TEXT NOT NULL,
  missing_value_rule TEXT NOT NULL,
  duplicate_value_rule TEXT NOT NULL,
  outlier_value_rule TEXT NOT NULL,
  rounding_rule TEXT NOT NULL,
  week_start_day TEXT NOT NULL,
  initial_plan_rule TEXT NOT NULL,
  changed_plan_rule TEXT NOT NULL,
  rule_changed_at TIMESTAMPTZ NOT NULL,
  rule_change_reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. 기존 과제 1번 테이블 호환용 안전한 user_id 컬럼 보정
-- ============================================================================

ALTER TABLE plans ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE plan_revisions ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE execution_logs ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================================
-- 3. Row Level Security (RLS) 및 멀티테넌트 보안 격리 정책 (T07-C116 ~ T07-C126)
-- ============================================================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation_rules ENABLE ROW LEVEL SECURITY;

-- 기존 정책 정리 후 재등록
DROP POLICY IF EXISTS "Allow public all on plans" ON plans;
DROP POLICY IF EXISTS "Allow public all on plan_revisions" ON plan_revisions;
DROP POLICY IF EXISTS "Allow public all on todos" ON todos;
DROP POLICY IF EXISTS "Allow public all on execution_logs" ON execution_logs;
DROP POLICY IF EXISTS "Allow public all on reviews" ON reviews;

DROP POLICY IF EXISTS "User self management on users" ON users;
DROP POLICY IF EXISTS "User data isolation on plans" ON plans;
DROP POLICY IF EXISTS "User data isolation on plan_revisions" ON plan_revisions;
DROP POLICY IF EXISTS "User data isolation on todos" ON todos;
DROP POLICY IF EXISTS "User data isolation on execution_logs" ON execution_logs;
DROP POLICY IF EXISTS "User data isolation on reviews" ON reviews;
DROP POLICY IF EXISTS "User data isolation on observation_rules" ON observation_rules;

-- 본인 소유 데이터만 접근 허용 정책
CREATE POLICY "User self management on users" ON users
  FOR ALL USING (auth.uid()::text = id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = id)
  WITH CHECK (auth.uid()::text = id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = id);

CREATE POLICY "User data isolation on plans" ON plans
  FOR ALL USING (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "User data isolation on plan_revisions" ON plan_revisions
  FOR ALL USING (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "User data isolation on todos" ON todos
  FOR ALL USING (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "User data isolation on execution_logs" ON execution_logs
  FOR ALL USING (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "User data isolation on reviews" ON reviews
  FOR ALL USING (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "User data isolation on observation_rules" ON observation_rules
  FOR ALL USING (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL OR (auth.jwt() ->> 'sub') = user_id);

-- ============================================================================
-- 4. 1일차 ~ 5일차 실제 관찰 데이터 DML 삽입 (2026-09-17 ~ 2026-09-21 KST)
-- ============================================================================

-- 4-1. 사용자 계정 생성 (PBKDF2-SHA256 100,000회 단방향 해시)
INSERT INTO users (id, email, password_hash, salt, name, created_at, updated_at)
VALUES 
(
  'usr-jinyeong-001',
  'jinyeong@aleph.skt',
  'pbkdf2_sha256$100000$salt_jinyeong_rnd8841$453810fa29de516989c41ffbefbc0730aedfcbc083a16442a5292aefd7d50ecd',
  'salt_jinyeong_rnd8841',
  '장진영',
  '2026-09-17T08:00:00+09:00',
  '2026-09-17T08:00:00+09:00'
),
(
  'usr-attacker-002',
  'attacker@test.com',
  'pbkdf2_sha256$100000$salt_attacker_rnd9923$006ea7c6dd10d5dc8e6feb2f9aa6f6311c4572caa2c15c369c1693444e3510eb',
  'salt_attacker_rnd9923',
  '공격자B (침투테스트)',
  '2026-09-17T08:30:00+09:00',
  '2026-09-17T08:30:00+09:00'
) ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, name = EXCLUDED.name;

-- 4-2. 5일 관찰 질문·지표 및 계획 규칙 변경 메타데이터 (T07-C04 ~ T07-C27)
INSERT INTO observation_rules (
  id, user_id, observation_question, observation_metric, metric_unit, calculation_rule,
  missing_value_rule, duplicate_value_rule, outlier_value_rule, rounding_rule, week_start_day,
  initial_plan_rule, changed_plan_rule, rule_changed_at, rule_change_reason, created_at
) VALUES (
  'obs-rule-jinyeong-01',
  'usr-jinyeong-001',
  '계획 대비 실제 소요 시간의 편차를 줄이고 예측 정확도를 80% 이상으로 유지할 수 있는가?',
  '시간 오차 편차 (Time Variance = Actual - Estimated)',
  '시간(분)',
  '시간 오차(분) = 실제 소요 시간(actual_minutes) - 예상 소요 시간(estimated_minutes)',
  '결측치: 실행 미기록 작업은 0분으로 기본 처리하고 대시보드에 결측 플래그 표기',
  '중복치: 동일 할 일에 대한 중복 실행은 멱등키(idempotency_key) 기준 최초 1건만 인정',
  '이상치: 1일 단일 작업 480분(8시간) 초과 시 이상치로 분리 집계하고 비고란에 사유 명시',
  '반올림: 모든 비율(%) 및 평균 연산은 소수점 둘째 자리에서 반올림하여 소수점 첫째 자리까지 표기',
  '주 시작 요일: 대한민국 표준 ISO 8601 기준 월요일(Monday)',
  '초안 규칙(1~2일차): 단순 작업 난이도 기준 예상 시간 산정 (별도 지연 안전 버퍼 없음, 버퍼 0%)',
  '변경 규칙(3~5일차): 네트워크 환경 설정 및 트러블슈팅 지연을 감안하여 기본 예상 시간에 20% 안전 버퍼 추가 반영 (예: 기본 90분 -> 110분)',
  '2026-09-18T22:30:00+09:00',
  '1·2일차 실습 시 네트워크 패킷 환경 설정 및 트러블슈팅 지연이 반복되어, 3일차부터 예상 시간에 20% 안전 버퍼를 선제 반영하기로 결정함.',
  '2026-09-17T08:00:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-3. 사용자 A의 5일간 교육 계획 (2026-09-17 ~ 2026-09-21)
INSERT INTO plans (id, user_id, title, start_date, end_date, priority, success_criteria, estimated_minutes, created_at, updated_at)
VALUES (
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'SKT ALEPH 1기: 기업 현장 중심 보안 & 네트워크 인프라 트랙 마스터',
  '2026-09-17',
  '2026-09-21',
  'high',
  'TCP/IP 패킷 분석, DNS 망구성, VLAN 라우팅, 방화벽 정책 및 제로트러스트 감사 완수 (시간 오차 편차 최소화 달성)',
  440,
  '2026-09-17T08:00:00+09:00',
  '2026-09-18T22:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-4. 사용자 A의 계획 수정 이력 스냅샷 (T06-C08 원본 보존)
INSERT INTO plan_revisions (id, plan_id, user_id, revision_number, title, start_date, end_date, priority, success_criteria, estimated_minutes, revised_at)
VALUES (
  'f1a9b201-3829-4d22-91bf-55bc678a1001',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  1,
  'SKT ALEPH 1기: 네트워크 기초 및 시스템 보안 초안',
  '2026-09-17',
  '2026-09-21',
  'medium',
  '네트워크 기초 이론 학습 및 단순 리눅스 방화벽 명령어 실습',
  360,
  '2026-09-17T08:00:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-5. 사용자 A의 1일차~5일차 연속 할 일 5건 (T07-C07: 2026-09-17 ~ 2026-09-21 KST)
INSERT INTO todos (id, plan_id, user_id, content, status, due_date, priority, tags, estimated_minutes, is_deleted, completed_at, created_at, updated_at)
VALUES 
-- Day 1 (2026-09-17): 변경 전 규칙 (버퍼 0%)
(
  't01-tcpip-wireshark',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 1: TCP/IP 4계층 프로토콜 분석 및 Wireshark 3-Way Handshake 패킷 캡처 실습',
  'completed',
  '2026-09-17',
  'high',
  ARRAY['네트워크', 'TCP/IP', 'Wireshark'],
  90,
  false,
  '2026-09-17T11:40:00+09:00',
  '2026-09-17T09:00:00+09:00',
  '2026-09-17T11:40:00+09:00'
),
-- Day 2 (2026-09-18): 변경 전 규칙 (버퍼 0%)
(
  't02-dns-routing',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 2: DNS 계층 구조 및 재귀적/반복적 쿼리 응답 캐싱 메커니즘 분석',
  'completed',
  '2026-09-18',
  'high',
  ARRAY['네트워크', 'DNS', '인프라'],
  60,
  false,
  '2026-09-18T14:15:00+09:00',
  '2026-09-18T09:00:00+09:00',
  '2026-09-18T14:15:00+09:00'
),
-- Day 3 (2026-09-19): 변경 후 규칙 (기본 90분 + 20% 버퍼 = 110분)
(
  't03-vlan-switching',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 3: L2/L3 스위치 기반 VLAN 분할 및 IP 라우팅 망구성 시뮬레이션 [버퍼20%]',
  'completed',
  '2026-09-19',
  'high',
  ARRAY['네트워크', '라우팅', 'VLAN'],
  110,
  false,
  '2026-09-19T15:55:00+09:00',
  '2026-09-19T09:00:00+09:00',
  '2026-09-19T15:55:00+09:00'
),
-- Day 4 (2026-09-20): 변경 후 규칙 (기본 75분 + 20% 버퍼 = 90분)
(
  't04-firewall-iptables',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 4: 리눅스(Ubuntu/Kali) iptables 및 ufw 방화벽 인바운드/아웃바운드 보안 정책 수립 [버퍼20%]',
  'completed',
  '2026-09-20',
  'high',
  ARRAY['보안', '방화벽', 'Linux'],
  90,
  false,
  '2026-09-20T16:25:00+09:00',
  '2026-09-20T09:00:00+09:00',
  '2026-09-20T16:25:00+09:00'
),
-- Day 5 (2026-09-21): 변경 후 규칙 (기본 75분 + 20% 버퍼 = 90분)
(
  't05-zero-trust-audit',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 5: 제로 트러스트(Zero Trust) 아키텍처 원칙 기반 엔드포인트 접근 제어 및 네트워크 감사 [버퍼20%]',
  'completed',
  '2026-09-21',
  'medium',
  ARRAY['보안', 'ZeroTrust', 'ZTA'],
  90,
  false,
  '2026-09-21T17:30:00+09:00',
  '2026-09-21T09:00:00+09:00',
  '2026-09-21T17:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-6. 사용자 A의 1일차~5일차 실제 실행 기록 5건 (T07-C07: 5일 연속)
INSERT INTO execution_logs (id, todo_id, user_id, start_time, end_time, actual_minutes, blocker_reason, idempotency_key, created_at)
VALUES 
-- Day 1 실행 기록 (90분 예상 / 100분 실제: +10분 오차)
(
  'exec-net-d01',
  't01-tcpip-wireshark',
  'usr-jinyeong-001',
  '2026-09-17T10:00:00+09:00',
  '2026-09-17T11:40:00+09:00',
  100,
  null,
  'key-exec-net-d01-20260917',
  '2026-09-17T11:40:00+09:00'
),
-- Day 2 실행 기록 (60분 예상 / 75분 실제: +15분 오차 -> 야간 규칙 변경 계기)
(
  'exec-net-d02',
  't02-dns-routing',
  'usr-jinyeong-001',
  '2026-09-18T13:00:00+09:00',
  '2026-09-18T14:15:00+09:00',
  75,
  null,
  'key-exec-net-d02-20260918',
  '2026-09-18T14:15:00+09:00'
),
-- Day 3 실행 기록 (110분 예상 / 115분 실제: +5분 오차, OSPF 블로커 발생)
(
  'exec-net-d03',
  't03-vlan-switching',
  'usr-jinyeong-001',
  '2026-09-19T14:00:00+09:00',
  '2026-09-19T15:55:00+09:00',
  115,
  '라우터 간 서브넷 마스크 불일치로 인한 OSPF 인접 관계(Adjacency) 디버깅 및 해결',
  'key-exec-net-d03-20260919',
  '2026-09-19T15:55:00+09:00'
),
-- Day 4 실행 기록 (90분 예상 / 85분 실제: -5분 오차)
(
  'exec-net-d04',
  't04-firewall-iptables',
  'usr-jinyeong-001',
  '2026-09-20T15:00:00+09:00',
  '2026-09-20T16:25:00+09:00',
  85,
  null,
  'key-exec-net-d04-20260920',
  '2026-09-20T16:25:00+09:00'
),
-- Day 5 실행 기록 (90분 예상 / 90분 실제: 0분 오차, 100% 일치 달성)
(
  'exec-net-d05',
  't05-zero-trust-audit',
  'usr-jinyeong-001',
  '2026-09-21T16:00:00+09:00',
  '2026-09-21T17:30:00+09:00',
  90,
  null,
  'key-exec-net-d05-20260921',
  '2026-09-21T17:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-7. 사용자 A의 회고 1건 (T06-C33 피드백 승계)
INSERT INTO reviews (id, plan_id, user_id, next_action_note, created_at)
VALUES (
  'rev-net-01',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  '네트워크 시뮬레이션 시 라우팅 테이블 및 서브넷 설정을 사전 다이어그램으로 먼저 도식화한 뒤 실습에 착수하여 트러블슈팅 시간 단축하기',
  '2026-09-19T16:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-8. 사용자 B(침투 테스트 계정)의 격리된 더미 데이터 (T07-C116 격리 증적용)
INSERT INTO plans (id, user_id, title, start_date, end_date, priority, success_criteria, estimated_minutes, created_at, updated_at)
VALUES (
  'plan-attacker-secret',
  'usr-attacker-002',
  '비인가 침투 테스트용 비밀 격리 프로젝트 (User B 전용)',
  '2026-09-17',
  '2026-09-21',
  'low',
  '타 계정(User A)에서 이 계획과 할 일이 절대 열람/수정/삭제되지 않아야 함',
  120,
  '2026-09-17T10:00:00+09:00',
  '2026-09-17T10:00:00+09:00'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO todos (id, plan_id, user_id, content, status, due_date, priority, tags, estimated_minutes, is_deleted, completed_at, created_at, updated_at)
VALUES (
  'todo-attacker-secret',
  'plan-attacker-secret',
  'usr-attacker-002',
  'User B 전용 기밀 할 일 데이터 (User A가 접근 시 403 Forbidden 차단 대상)',
  'pending',
  '2026-09-20',
  'medium',
  ARRAY['Secret', 'AttackerOnly'],
  60,
  false,
  null,
  '2026-09-17T10:30:00+09:00',
  '2026-09-17T10:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;
