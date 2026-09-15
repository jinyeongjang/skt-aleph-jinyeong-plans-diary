-- ==========================================================
-- SKT ALEPH 과제 6: 플랜두씨 다이어리 1 Supabase DDL Script
-- Target: PostgreSQL / Supabase
-- Reference: contracts/pds-schema-v2.json
-- ==========================================================

-- 1. 계획 (Plans) 테이블
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  success_criteria TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 계획 수정 이력 (Plan Revisions) 테이블 (T06-C08: 원본 보존)
CREATE TABLE IF NOT EXISTS plan_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  revised_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 할 일 (Todos) 테이블 (T06-C09 ~ T06-C20)
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
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

-- 4. 실제 실행 기록 (Execution Logs) 테이블 (T06-C21 ~ T06-C27)
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_minutes INTEGER NOT NULL,
  blocker_reason TEXT,
  idempotency_key TEXT UNIQUE, -- T06-C21: 연타 시 중복 저장 방지 유니크 제약
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. 돌아보기 및 회고 (Reviews) 테이블 (T06-C33)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  next_action_note TEXT NOT NULL, -- 다음 계획으로 넘길 한 줄 피드백
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. 무로그인 공개 읽기/쓰기 RLS 정책 (T06-C01, T06-C21 무로그인 웹)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있으면 정리 후 재등록
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
