import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileCheck2,
  Copy,
  Check,
  Compass,
  ListOrdered,
  CheckCircle2,
  AlertTriangle,
  Bot,
  UserCheck,
  ShieldAlert,
  Database,
} from 'lucide-react';

interface VerificationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationGuideModal: React.FC<VerificationGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'4lines' | '3lines' | 'supabase'>('4lines');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 과제 7 Supabase SQL Editor 실행 DDL (RLS 및 users 연동)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  success_criteria TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_revisions (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  revised_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS execution_logs (
  id TEXT PRIMARY KEY,
  todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_minutes INTEGER NOT NULL,
  blocker_reason TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  next_action_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User isolation on plans" ON plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User isolation on todos" ON todos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User isolation on execution_logs" ON execution_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User isolation on reviews" ON reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`;

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-in fade-in fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/60 p-4 duration-200 sm:p-6"
    >
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Top rim light */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-neutral-200/80 px-6 py-5 dark:border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-50/80 text-indigo-600 shadow-xs dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-neutral-900 sm:text-lg dark:text-neutral-100">
                  과제 7 확인 방법 & AI 판단 가이드
                </h2>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  T07-C39 • C40
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                제출 규격(T07-C39 짧은 확인 방법 4줄, T07-C40 AI 판단 3줄)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover-lift active-press flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-neutral-100 bg-neutral-50/60 px-6 py-2.5 dark:border-neutral-800/80 dark:bg-neutral-950/40">
          <div className="flex items-center gap-1.5 rounded-2xl border border-neutral-200/70 bg-neutral-100/80 p-1 dark:border-neutral-800/70 dark:bg-neutral-800/60">
            <button
              onClick={() => setActiveTab('4lines')}
              className={`hover-lift active-press flex-1 cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                activeTab === '4lines'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-neutral-900 dark:text-indigo-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              확인 방법 4줄 (T07-C39)
            </button>
            <button
              onClick={() => setActiveTab('3lines')}
              className={`hover-lift active-press flex-1 cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                activeTab === '3lines'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-neutral-900 dark:text-indigo-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              AI와 내 판단 3줄 (T07-C40)
            </button>
            <button
              onClick={() => setActiveTab('supabase')}
              className={`hover-lift active-press flex-1 cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                activeTab === 'supabase'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-neutral-900 dark:text-indigo-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              Supabase DB 설정
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="custom-scrollbar space-y-4 overflow-y-auto p-6">
          {/* Tab 1: 짧은 확인 방법 4줄 (T07-C39) */}
          {activeTab === '4lines' && (
            <div className="space-y-3.5">
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4.5 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Compass className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">① 어디로 가나요</span>
                </div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  배포된 웹 URL(새 시크릿 창)로 접속하여 첫 화면으로 나타나는 로그인 화면을 확인합니다. (T07-C03)
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4.5 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <ListOrdered className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    ② 세 단계 안에 무엇을 하나요
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-neutral-800 dark:text-neutral-200">
                  1) 데모 계정(User A)으로 로그인하여 5일간의 실제 기록과 3일차 진입 전(2일차 뒤) 계획 규칙 변경 내역을
                  확인합니다.
                  <br />
                  2) 상단 [보안 차단 검증]을 눌러 User A ⇄ User B 간의 양방향 읽기·수정·삭제 요청이 403 Forbidden으로
                  차단되는지 확인합니다.
                  <br />
                  3) 상단 [로그아웃]을 누른 뒤 동일 토큰 요청이 거절(401 Unauthorized)되는지 확인합니다.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4.5 shadow-2xs dark:border-emerald-500/30 dark:bg-emerald-950/30">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    ③ 무엇이 보이면 통과인가요
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-neutral-800 dark:text-neutral-200">
                  로그인 전에는 데이터가 비공개이고, 로그인 후에만 본인 데이터가 복원되며, 상대방 계정 데이터 침범 시
                  403/404로 거절되고 상대방 데이터가 100% 불변 보존되며, 화면 합계·평균이 수기 검산 값과 완벽히 일치할
                  때 통과입니다.
                </p>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-rose-50/50 p-4.5 shadow-2xs dark:border-rose-500/30 dark:bg-rose-950/30">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                    ④ 안 될 때는 무엇이 보이나요
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-neutral-800 dark:text-neutral-200">
                  로그인하지 않아도 데이터가 노출되거나, User A가 User B의 기밀 데이터를 읽거나 수정할 수 있거나,
                  로그아웃 후에도 예전 토큰으로 요청이 성공하는 경우 실패입니다.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: AI와 내 판단 3줄 (T07-C40) */}
          {activeTab === '3lines' && (
            <div className="space-y-3.5">
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4.5 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">① AI에게 맡긴 일</span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-neutral-800 dark:text-neutral-200">
                  PBKDF2-SHA256 (100,000 Iterations) 키 파생 함수 템플릿 작성, JWT 구조화 토큰 인코딩/만료 TTL 로직
                  작성, 자동화 테스트 스위트 코드 구성을 맡겼습니다.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4.5 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <UserCheck className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">② 내가 직접 판단한 일</span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-neutral-800 dark:text-neutral-200">
                  1일차 관찰 질문과 시간 오차 편차 지표를 확정하고, 3일차 진입 전 20% 버퍼 반영 규칙 변경
                  시점(2026-09-16 22:30 KST) 및 사유를 결정하였으며, 수기 검산 수식과 화면 통계 일치를 직접
                  검증하였습니다.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4.5 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    ③ AI 제안을 따르지 않은 일
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-neutral-800 dark:text-neutral-200">
                  AI가 제안한 단순 클라이언트 UI 숨김 방식은 IDOR 취약점이 발생하므로 거절하고, 서비스 레이어 403
                  Forbidden 강제 및 데이터베이스 RLS 정책을 결합한 2중 격리 아키텍처로 구현하였습니다.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Supabase DB 설정 가이드 */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-50/70 p-4 text-xs text-blue-950 shadow-2xs dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-200">
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>과제 7 Supabase PostgreSQL RLS 연동:</span>
                </div>
                <p className="leading-relaxed">
                  SQL Editor에서 아래 DDL 스크립트를 실행하여 users 테이블 및 user_id 외래키, RLS 격리 정책을
                  구성합니다.
                </p>
              </div>

              <div className="relative">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Supabase 테이블 & RLS 정책 DDL
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-400"
                  >
                    {copiedSql ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSql ? '복사 완료' : 'SQL 복사'}</span>
                  </button>
                </div>
                <pre className="custom-scrollbar max-h-56 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-300 shadow-inner">
                  {sqlCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800/80 dark:bg-neutral-950/40">
          <button
            onClick={onClose}
            className="hover-lift active-press cursor-pointer rounded-2xl border border-neutral-200/80 bg-neutral-100/80 px-5 py-2.5 text-xs font-semibold text-neutral-700 transition-all hover:bg-neutral-200 dark:border-neutral-800/80 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
