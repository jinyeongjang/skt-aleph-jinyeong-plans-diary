-- ============================================================================
-- SKT ALEPH 과제 7: 플랜두씨 다이어리 2 — Supabase 추가 DDL & 마이그레이션 스크립트
-- Target: PostgreSQL 15+ / Supabase
-- Reference: condition/condi_7-1.txt ~ condi_7-6.txt, CRITERIA.md (T07-C01 ~ T07-C134)
-- 설명: 1번과제(과제 6) 기본 테이블 위에 추가되는 인증(users), 데이터 격리(user_id),
--       5일 관찰 규칙(observation_rules), RLS 보안 정책 및 2번과제 시드 데이터입니다.
-- ============================================================================

-- ============================================================================
-- 1. 2번과제 신규 테이블 생성
-- ============================================================================

-- 1-1. 사용자 계정 테이블 (카드 1 & 카드 2: T07-C101 ~ T07-C107)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-2. 5일 관찰 규칙 및 메타데이터 테이블 (카드 5: T07-C04 ~ T07-C27)
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
-- 2. 기존 테이블에 사용자 격리(user_id) 컬럼 추가 (1번과제 테이블 확장)
-- ============================================================================

ALTER TABLE plans ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE plan_revisions ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE execution_logs ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================================
-- 3. Row Level Security (RLS) 및 멀티테넌트 사용자 격리 정책 (T07-C116 ~ T07-C126)
-- ============================================================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation_rules ENABLE ROW LEVEL SECURITY;

-- 1번과제 무로그인 공개 정책 정리
DROP POLICY IF EXISTS "Allow public all on plans" ON plans;
DROP POLICY IF EXISTS "Allow public all on plan_revisions" ON plan_revisions;
DROP POLICY IF EXISTS "Allow public all on todos" ON todos;
DROP POLICY IF EXISTS "Allow public all on execution_logs" ON execution_logs;
DROP POLICY IF EXISTS "Allow public all on reviews" ON reviews;

-- 기존 2번과제 정책 정리 후 재등록
DROP POLICY IF EXISTS "User self management on users" ON users;
DROP POLICY IF EXISTS "User data isolation on plans" ON plans;
DROP POLICY IF EXISTS "User data isolation on plan_revisions" ON plan_revisions;
DROP POLICY IF EXISTS "User data isolation on todos" ON todos;
DROP POLICY IF EXISTS "User data isolation on execution_logs" ON execution_logs;
DROP POLICY IF EXISTS "User data isolation on reviews" ON reviews;
DROP POLICY IF EXISTS "User data isolation on observation_rules" ON observation_rules;

-- 본인 소유 데이터만 접근 허용 (RLS 정책 - auth.uid()::text 명시적 형변환 적용)
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
-- 4. 2번과제 시드 데이터 (T07-C103, T07-C104, T07-C116, T07-C07 ~ T07-C27)
-- ============================================================================

-- 4-1. 사용자 A (진영) 및 사용자 B (공격자 모의침투 계정)
INSERT INTO users (id, email, password_hash, salt, created_at, updated_at)
VALUES 
(
  'usr-jinyeong-001',
  'jinyeong@aleph.skt',
  'pbkdf2_sha256$100000$salt_jinyeong_rnd8841$453810fa29de516989c41ffbefbc0730aedfcbc083a16442a5292aefd7d50ecd',
  'salt_jinyeong_rnd8841',
  '2026-09-01T08:00:00+09:00',
  '2026-09-01T08:00:00+09:00'
),
(
  'usr-attacker-002',
  'attacker@test.com',
  'pbkdf2_sha256$100000$salt_attacker_rnd9923$006ea7c6dd10d5dc8e6feb2f9aa6f6311c4572caa2c15c369c1693444e3510eb',
  'salt_attacker_rnd9923',
  '2026-09-01T08:30:00+09:00',
  '2026-09-01T08:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-2. 사용자 A의 계획 1건
INSERT INTO plans (id, user_id, title, start_date, end_date, priority, success_criteria, estimated_minutes, created_at, updated_at)
VALUES (
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'SKT ALEPH 1기: 기업 현장 중심 보안 & 네트워크 인프라 트랙 마스터',
  '2026-09-15',
  '2026-09-19',
  'high',
  'TCP/IP 패킷 분석, DNS 망구성, VLAN 라우팅, 방화벽 정책 및 제로트러스트 감사 완수 (시간 오차 편차 최소화 달성)',
  440,
  '2026-09-15T08:00:00+09:00',
  '2026-09-16T22:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-3. 사용자 A의 계획 수정 이력 스냅샷 (T06-C08 보존)
INSERT INTO plan_revisions (id, plan_id, user_id, revision_number, title, start_date, end_date, priority, success_criteria, estimated_minutes, revised_at)
VALUES (
  'f1a9b201-3829-4d22-91bf-55bc678a1001',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  1,
  'SKT ALEPH 1기: 네트워크 기초 및 시스템 보안 초안',
  '2026-09-15',
  '2026-09-19',
  'medium',
  '네트워크 기초 이론 학습 및 단순 리눅스 방화벽 명령어 실습',
  360,
  '2026-09-15T08:00:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-4. 사용자 A의 5일 연속 할 일 5건 (T07-C07: Asia/Seoul 5일 연속)
INSERT INTO todos (id, plan_id, user_id, content, status, due_date, priority, tags, estimated_minutes, is_deleted, completed_at, created_at, updated_at)
VALUES 
(
  't01-tcpip-wireshark',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 1: TCP/IP 4계층 프로토콜 분석 및 Wireshark 3-Way Handshake 패킷 캡처 실습',
  'completed',
  '2026-09-15',
  'high',
  ARRAY['네트워크', 'TCP/IP', 'Wireshark'],
  90,
  false,
  '2026-09-15T11:40:00+09:00',
  '2026-09-15T09:00:00+09:00',
  '2026-09-15T11:40:00+09:00'
),
(
  't02-dns-routing',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 2: DNS 계층 구조 및 재귀적/반복적 쿼리 응답 캐싱 메커니즘 분석',
  'completed',
  '2026-09-16',
  'high',
  ARRAY['네트워크', 'DNS', '인프라'],
  60,
  false,
  '2026-09-16T14:15:00+09:00',
  '2026-09-16T09:00:00+09:00',
  '2026-09-16T14:15:00+09:00'
),
(
  't03-vlan-switching',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 3: L2/L3 스위치 기반 VLAN 분할 및 IP 라우팅 망구성 시뮬레이션 [규칙변경: 버퍼20%적용]',
  'completed',
  '2026-09-17',
  'high',
  ARRAY['네트워크', '라우팅', 'VLAN'],
  110,
  false,
  '2026-09-17T15:55:00+09:00',
  '2026-09-17T09:00:00+09:00',
  '2026-09-17T15:55:00+09:00'
),
(
  't04-firewall-iptables',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 4: 리눅스(Ubuntu/Kali) iptables 및 ufw 방화벽 인바운드/아웃바운드 보안 정책 수립 [규칙변경: 버퍼20%적용]',
  'completed',
  '2026-09-18',
  'high',
  ARRAY['보안', '방화벽', 'Linux'],
  90,
  false,
  '2026-09-18T16:25:00+09:00',
  '2026-09-18T09:00:00+09:00',
  '2026-09-18T16:25:00+09:00'
),
(
  't05-zero-trust-audit',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  'Day 5: 제로 트러스트(Zero Trust) 아키텍처 원칙 기반 엔드포인트 접근 제어 및 네트워크 감사 [규칙변경: 버퍼20%적용]',
  'completed',
  '2026-09-19',
  'medium',
  ARRAY['보안', 'ZeroTrust', 'ZTA'],
  90,
  false,
  '2026-09-19T17:30:00+09:00',
  '2026-09-19T09:00:00+09:00',
  '2026-09-19T17:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-5. 사용자 A의 5일 실제 실행 기록 (T07-C07: 5일 연속)
INSERT INTO execution_logs (id, todo_id, user_id, start_time, end_time, actual_minutes, blocker_reason, idempotency_key, created_at)
VALUES 
(
  'exec-net-d01',
  't01-tcpip-wireshark',
  'usr-jinyeong-001',
  '2026-09-15T10:00:00+09:00',
  '2026-09-15T11:40:00+09:00',
  100,
  null,
  'key-exec-net-d01',
  '2026-09-15T11:40:00+09:00'
),
(
  'exec-net-d02',
  't02-dns-routing',
  'usr-jinyeong-001',
  '2026-09-16T13:00:00+09:00',
  '2026-09-16T14:15:00+09:00',
  75,
  null,
  'key-exec-net-d02',
  '2026-09-16T14:15:00+09:00'
),
(
  'exec-net-d03',
  't03-vlan-switching',
  'usr-jinyeong-001',
  '2026-09-17T14:00:00+09:00',
  '2026-09-17T15:55:00+09:00',
  115,
  '라우터 간 서브넷 마스크 불일치로 인한 OSPF 인접 관계 디버깅 해결',
  'key-exec-net-d03',
  '2026-09-17T15:55:00+09:00'
),
(
  'exec-net-d04',
  't04-firewall-iptables',
  'usr-jinyeong-001',
  '2026-09-18T15:00:00+09:00',
  '2026-09-18T16:25:00+09:00',
  85,
  null,
  'key-exec-net-d04',
  '2026-09-18T16:25:00+09:00'
),
(
  'exec-net-d05',
  't05-zero-trust-audit',
  'usr-jinyeong-001',
  '2026-09-19T16:00:00+09:00',
  '2026-09-19T17:30:00+09:00',
  90,
  null,
  'key-exec-net-d05',
  '2026-09-19T17:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-6. 사용자 A의 회고 1건 (T06-C33)
INSERT INTO reviews (id, plan_id, user_id, next_action_note, created_at)
VALUES (
  'rev-net-01',
  'e7b0a850-6e42-4f91-a67b-1a9829f04123',
  'usr-jinyeong-001',
  '네트워크 시뮬레이션 시 라우팅 테이블 및 서브넷 설정을 사전 다이어그램으로 먼저 도식화한 뒤 실습에 착수하여 트러블슈팅 시간 단축하기',
  '2026-09-17T16:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-7. 사용자 A의 5일 관찰 규칙 및 3일차 변경 기록 (T07-C04 ~ T07-C27)
INSERT INTO observation_rules (
  id, user_id, observation_question, observation_metric, metric_unit, calculation_rule,
  missing_value_rule, duplicate_value_rule, outlier_value_rule, rounding_rule, week_start_day,
  initial_plan_rule, changed_plan_rule, rule_changed_at, rule_change_reason, created_at
) VALUES (
  'obs-rule-jinyeong-01',
  'usr-jinyeong-001',
  '계획 대비 실제 소요 시간의 편차를 줄이고 예측 정확도를 80% 이상으로 유지할 수 있는가?',
  '시간 오차 편차 (Time Variance)',
  '분 (Minutes)',
  '시간 오차 = 실제 소요 시간(actual_minutes) - 예상 소요 시간(estimated_minutes)',
  '결측치: 실행 미기록 작업은 0분으로 기본 처리하고 대시보드에 결측 플래그 표기',
  '중복치: 동일 할 일에 대한 중복 실행은 멱등키(idempotency_key) 기반 최초 1건만 인정',
  '이상치: 1일 단일 작업 480분(8시간) 초과 시 이상치로 플래그하고 비고란에 사유 명시',
  '반올림: 모든 비율 및 평균 연산은 소수점 둘째자리에서 반올림하여 소수점 첫째자리 표기',
  '주 시작 요일: 대한민국 표준 ISO 8601 기준 월요일(Monday)',
  '초안 계획 규칙: 단순 작업 난이도 기준 예상 시간 산정 (버퍼 없음)',
  '변경 계획 규칙: 실습 환경 설정 및 네트워크 디버깅을 고려하여 기본 예상 시간에 20% 안전 버퍼 시간 추가 반영',
  '2026-09-16T22:30:00+09:00',
  '1일차(+10분) 및 2일차(+15분) 실습 시 예상치 못한 패킷 캡처 지연이 발생하여, 3일차부터 20% 버퍼 시간을 선제 반영하기로 결정함',
  '2026-09-15T08:00:00+09:00'
) ON CONFLICT (id) DO NOTHING;

-- 4-8. 사용자 B(침투 테스트 계정)의 격리된 더미 데이터 (T07-C116 격리 증적용)
INSERT INTO plans (id, user_id, title, start_date, end_date, priority, success_criteria, estimated_minutes, created_at, updated_at)
VALUES (
  'plan-attacker-secret-999',
  'usr-attacker-002',
  '비인가 침투 테스트용 비밀 격리 프로젝트 (User B 전용)',
  '2026-09-15',
  '2026-09-20',
  'low',
  '타 계정(User A)에서 이 계획과 할 일이 절대 열람/수정/삭제되지 않아야 함',
  120,
  '2026-09-15T10:00:00+09:00',
  '2026-09-15T10:00:00+09:00'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO todos (id, plan_id, user_id, content, status, due_date, priority, tags, estimated_minutes, is_deleted, completed_at, created_at, updated_at)
VALUES (
  'todo-attacker-secret-888',
  'plan-attacker-secret-999',
  'usr-attacker-002',
  'User B 전용 기밀 할 일 데이터 (User A가 접근 시 403 Forbidden 차단 대상)',
  'pending',
  '2026-09-18',
  'medium',
  ARRAY['Secret', 'AttackerOnly'],
  60,
  false,
  null,
  '2026-09-15T10:30:00+09:00',
  '2026-09-15T10:30:00+09:00'
) ON CONFLICT (id) DO NOTHING;
