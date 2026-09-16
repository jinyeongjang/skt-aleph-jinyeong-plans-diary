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
  ExternalLink,
} from 'lucide-react';

interface VerificationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationGuideModal: React.FC<VerificationGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'4lines' | '3lines' | 'supabase'>('4lines');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- Supabase SQL Editor에서 실행
-- contracts/pds-schema-v2.json 명세 준수
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

CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_minutes INTEGER NOT NULL,
  blocker_reason TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  next_action_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on plans" ON plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on plan_revisions" ON plan_revisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on todos" ON todos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on execution_logs" ON execution_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);`;

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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-neutral-700/50" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-neutral-200/80 px-6 py-5 dark:border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-50/80 text-indigo-600 shadow-xs dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-neutral-900 sm:text-lg dark:text-neutral-100">
                  과제 6 검증 가이드 및 평가 기준
                </h2>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  T06-C59 • C60
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                제출 규격(T06-C59, T06-C60) 및 Supabase DB 연동 절차
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
              확인 방법 4줄 (C59)
            </button>
            <button
              onClick={() => setActiveTab('3lines')}
              className={`hover-lift active-press flex-1 cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                activeTab === '3lines'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-neutral-900 dark:text-indigo-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              AI와 내 판단 3줄 (C60)
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
          {/* Tab 1: 짧은 확인 방법 4줄 (T06-C59) */}
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
                  배포된 웹 URL(새 시크릿 창)로 접속하여 첫 화면 상단의 공개 안내 배너를 확인합니다.
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
                  1) [Plan]에서 [계획 수정]을 눌러 내용을 변경하고 [수정 이력]에서 원본 보존을 확인합니다.
                  <br />
                  2) [Do]에서 특정 할 일의 [실행 기록]을 열고 [연타 멱등성 검증] 버튼을 누릅니다.
                  <br />
                  3) [See]에서 집계 숫자(지연/막힘)를 클릭하여 해당 할 일로 드릴다운 이동하고, 고칠 점을 입력하여 [다음
                  계획으로 넘기기]를 누릅니다.
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
                  수정 전 스냅샷이 이력 모달에 보존되고, 연타 시에도 실행 기록과 완료 집계가 정확히 1건만 늘어나며,
                  새로고침 후에도 서버 DB로부터 데이터가 그대로 복원됩니다.
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
                  계획 수정 시 이전 내용이 사라지거나, 연타 클릭 시 실행 기록이 2건 중복 등록되어 완료 수가 2 이상
                  늘어나거나, 새로고침 시 데이터가 초기화됩니다.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: AI와 내 판단 3줄 (T06-C60) */}
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
                  PostgreSQL DDL 스키마 작성, React 19 + Tailwind v4 반응형 컴포넌트 구현, 멱등키 생성 및 KST 시간대
                  차이 계산 로직 작성을 맡겼습니다.
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
                  더미 데이터 대신 진영님의 공식 블로그(https://skt-aleph-jinyeongblog.vercel.app)에 수록된 실제 교육
                  과정인 'SKT ALEPH 1기 기업 현장 중심 보안 & 네트워크 인프라 트랙'의 핵심 커리큘럼(TCP/IP, DNS, VLAN
                  라우팅, 리눅스 방화벽, Snort IDS/IPS, 제로 트러스트)을 토대로 실제 계획과 할 일, 실행 기록을
                  반영했습니다.
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
                  AI가 제안한 단순 브라우저 버튼 비활성화(disabled) 방식만으로는 완벽한 멱등성이 보장되지 않는다고
                  판단하여, DB 유니크 제약(`UNIQUE(idempotency_key)`) 및 병렬 연타 시뮬레이터 버튼을 직접 추가하도록
                  수정했습니다.
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
                  <span>Supabase 연동 3분 완성 가이드:</span>
                </div>
                <ol className="list-inside list-decimal space-y-1.5 leading-relaxed">
                  <li>
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold underline hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Supabase 대시보드 <ExternalLink className="inline h-3 w-3" />
                    </a>
                    에서 새 프로젝트를 생성합니다.
                  </li>
                  <li>
                    좌측 메뉴의 <strong>SQL Editor</strong>로 이동하여 아래 SQL을 복사해 붙여넣고 [Run]을 누릅니다.
                  </li>
                  <li>
                    <strong>Project Settings ➔ API</strong>에서 Project URL과 anon key를 복사하여 프로젝트 루트의{' '}
                    <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[11px] text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                      .env.local
                    </code>
                    에 추가합니다.
                  </li>
                </ol>
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
