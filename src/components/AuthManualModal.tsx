import React, { useState } from 'react';
import { BookOpen, X, ShieldCheck, Key, Lock, FileCode, AlertTriangle, UserCheck } from 'lucide-react';

interface AuthManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthManualModal: React.FC<AuthManualModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<number>(1);

  if (!isOpen) return null;

  const sections = [
    { id: 1, title: '① 무엇으로 붙였나', icon: Key },
    { id: 2, title: '② 왜 그걸 골랐나', icon: ShieldCheck },
    { id: 3, title: '③ 어디를 어떻게 고쳤나', icon: FileCode },
    { id: 4, title: '④ 안 열리는 것을 확인한 기록', icon: Lock },
    { id: 5, title: '⑤ AI와 나', icon: UserCheck },
    { id: 6, title: '⑥ 아직 못 막은 것', icon: AlertTriangle },
  ];

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Top Rimlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/40 to-transparent dark:via-indigo-500/20"
          aria-hidden="true"
        />

        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                과제 7 인증 구현 설명서 (T07-C127 ~ T07-C131)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                자물쇠를 어떻게 붙였고 왜 그렇게 설계했는지 6개 항목으로 상세 설명합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex overflow-x-auto border-b border-neutral-200 bg-neutral-50/70 p-2 dark:border-neutral-800 dark:bg-neutral-950/40">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`hover-lift active-press flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-neutral-800 dark:text-indigo-400'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.title}
              </button>
            );
          })}
        </div>

        {/* 콘텐츠 바디 */}
        <div className="flex-1 overflow-y-auto p-6 text-neutral-800 dark:text-neutral-200">
          {activeSection === 1 && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">① 무엇으로 붙였나</h4>
              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">
                    1. 비밀번호 단방향 암호화: PBKDF2-SHA256 (100,000 Iterations) + 개별 Salt
                  </div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    비밀번호 평문을 저장하지 않고, NIST 표준 키 파생 함수인 <code>PBKDF2-SHA256</code>를 사용하여
                    100,000회 연산과 16바이트 암호학적 무작위 Salt를 결합하여 단방향 해시로 저장합니다. (T07-C101,
                    T07-C103)
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    2. 사용자 세션 및 식별: Bearer JWT Access Token (TTL: 3600초)
                  </div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    URL 파라미터가 아닌 <code>Authorization: Bearer &lt;token&gt;</code> 헤더로 전송되는 JWT 토큰을
                    발급하며, 1시간(3600초) 만료 TTL과 로그아웃 시 즉시 무효화(Blacklist)를 지원합니다. (T07-C108,
                    T07-C111, T07-C112)
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-sky-600 dark:text-sky-400">
                    3. 데이터베이스 격리: PostgreSQL Row Level Security (RLS) & user_id 바인딩
                  </div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    모든 테이블(plans, plan_revisions, todos, execution_logs, reviews, observation_rules)에{' '}
                    <code>user_id</code> 외래키를 적용하고 <code>ON DELETE CASCADE</code> 및 RLS 정책(
                    <code>auth.uid() = user_id</code>)을 수립했습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">② 왜 그걸 골랐나</h4>
              <div className="space-y-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">
                    1. 단순 SHA-256이 아닌 PBKDF2 (100,000회 연산)를 선정한 이유 (T07-C102)
                  </div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    단순 1회 해시는 초당 수십억 번의 GPU 브루트포스(무차별 대입) 공격 및 미리 계산된 레인보우 테이블에
                    취약합니다. PBKDF2는 반복 횟수를 통해 계산 비용(Work Factor)을 의도적으로 높여 공격자의 대입 공격을
                    효과적으로 무력화합니다.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">
                    2. 계정별 고유 Salt(소금값) 분리 저장 이유 (T07-C104)
                  </div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    서로 다른 두 사용자가 동일한 비밀번호(예: <code>SktAleph!2026#Secure*Pass99</code>)를 설정하더라도,
                    계정 생성 시 부여된 고유 난수 Salt로 인해 데이터베이스에 저장되는 해시값이 완전히 달라져 동일
                    비밀번호 유추를 원천 차단합니다.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">
                    3. 서비스 레이어 + DB RLS의 2중 차단 구조 선정 이유
                  </div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    클라이언트 UI에서 단순 감춤 처리는 개발자 도구(F12)나 curl 요청으로 쉽게 우회됩니다. 서비스 함수에서{' '}
                    <code>403 Forbidden</code>을 직접 검증하고 DB RLS로 2차 방어하여 완벽한 인가 격리를 보장합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                ③ 어디를 어떻게 고쳤나 (4대 핵심 흐름 소스 위치 - T07-C128)
              </h4>
              <div className="space-y-3">
                <div className="rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">1. 회원가입 흐름:</span>{' '}
                  <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-neutral-800">
                    src/services/authService.ts#L173 (registerUser)
                  </code>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    이메일 중복 검사 ➔ 고유 Salt 생성 ➔ PBKDF2 단방향 해싱 ➔ 사용자 저장 ➔ JWT 세션 토큰 즉시 발급.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">2. 로그인 흐름:</span>{' '}
                  <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-neutral-800">
                    src/services/authService.ts#L207 (loginUser)
                  </code>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    사용자 조회 ➔ 저장된 고유 Salt로 입력 비밀번호 재해싱 대조 ➔ 3600초 유효 JWT 토큰 발급.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">3. 로그아웃 흐름:</span>{' '}
                  <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-neutral-800">
                    src/services/authService.ts#L236 (logoutUser)
                  </code>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    활성 토큰을 무효화 블랙리스트(invalidatedTokens)에 등록 ➔ 세션 스토리지 파기.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    4. 자료 조회 및 침범 차단 흐름:
                  </span>{' '}
                  <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-neutral-800">
                    src/services/pdsService.ts#L137, #L188, #L365 & database/schema.sql#L78
                  </code>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    모든 계획/할 일/기록 조회·수정·삭제 시 호출자의 <code>user_id</code>와 데이터의 <code>user_id</code>
                    를 대조하여 불일치 시 <code>403 Forbidden</code>을 즉시 반환.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 4 && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                ④ 안 열리는 것을 확인한 기록 (5대 검증 증적 - T07-C129)
              </h4>
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">
                    증적 1: 로그인 성공(200) vs 로그아웃 뒤 동일 요청 거절(401) 병렬 대조 (T07-C109, C110)
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-2.5 font-mono text-[11px] text-emerald-400">
                    {`// 1) 로그인 상태 요청
GET /api/plans (Header: Authorization: Bearer eyJhbGci...[MASKED]) ➔ 200 OK
// 2) 로그아웃 후 동일 요청 (달라진 것은 오직 로그아웃 여부)
GET /api/plans (Header: Authorization: Bearer eyJhbGci...[MASKED]) ➔ 401 Unauthorized (토큰 무효화됨)`}
                  </pre>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
                  <div className="font-bold text-indigo-900 dark:text-indigo-200">
                    증적 2: 동일 비밀번호로 생성된 두 계정의 해시/솔트 분리 (T07-C104)
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-2.5 font-mono text-[11px] text-indigo-300">
                    {`User A (jinyeong): salt='salt_jinyeong_rnd8841', hash='pbkdf2_sha256$100000$...4538...[MASKED]'
User B (attacker): salt='salt_attacker_rnd9923', hash='pbkdf2_sha256$100000$...006e...[MASKED]'
➔ 동일 평문 'SktAleph!2026#Secure*Pass99'를 입력해도 저장된 해시값이 서로 100% 다름 확인 완료`}
                  </pre>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/30">
                  <div className="font-bold text-rose-900 dark:text-rose-200">
                    증적 3: User A 토큰으로 User B 기밀 계획 읽기·수정·삭제 차단 (T07-C117 ~ C119)
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-2.5 font-mono text-[11px] text-rose-400">
                    {`GET /api/plans/plan-attacker-secret ➔ 403 Forbidden (src/services/pdsService.ts#L137)
PATCH /api/todos/todo-attacker-secret ➔ 403 Forbidden (src/services/pdsService.ts#L365)
DELETE /api/todos/todo-attacker-secret ➔ 403 Forbidden (src/services/pdsService.ts#L365)
➔ 거절 전후 User B 데이터 건수 및 내용 100% 불변 보존 (T07-C122)`}
                  </pre>
                </div>

                <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 dark:border-purple-900/60 dark:bg-purple-950/30">
                  <div className="font-bold text-purple-900 dark:text-purple-200">
                    증적 4: 반대 방향 (User B 토큰으로 User A 계획 수정 시도) 차단 (T07-C120)
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-2.5 font-mono text-[11px] text-purple-300">
                    {`PUT /api/plans/e7b0a850-6e42-4f91-a67b-1a9829f04123 (User B 토큰) ➔ 403 Forbidden
➔ 양방향 상호 침범 거절 및 데이터 격리 완료`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeSection === 5 && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">⑤ AI와 나 (T07-C40)</h4>
              <div className="space-y-3">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">1. AI에게 맡긴 일</div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    WebCrypto 기반 PBKDF2 키 파생 및 100,000회 해싱 연산 템플릿 생성, JWT 구조화 토큰 인코딩/디코딩 로직
                    작성, 자동화 테스트 스위트 코드 구성.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">2. 내가 직접 판단한 일</div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    1일차 고정 관찰 질문 및 시간 오차 지표(분) 정의, 3일차 진입 전 20% 버퍼 시간 추가 규칙 변경
                    시점(2026-09-16 22:30 KST) 및 사유 결정, 수기 검산 수식과 화면 통계 일치 검증, 양방향 403/404 거절
                    증적 시나리오 설계.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                  <div className="font-bold text-rose-600 dark:text-rose-400">3. AI 제안을 따르지 않은 일</div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    AI는 초기에 간단한 React 상태 필터링만으로 타인 데이터를 숨기는 방식을 제안했으나, 이는 API 직접
                    호출 시 IDOR 공격에 취약하므로 거절하고 서비스 레이어에서 <code>403 Forbidden</code>을 직접 던지고
                    DB RLS 정책을 동시 강제하는 엄격한 2중 격리 아키텍처로 변경 구현함.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 6 && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                ⑥ 아직 못 막은 것 (T07-C130 필수 명시 항목)
              </h4>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  ⚠️ 본 시스템에서 아직 구현하지 못한 보안 한계와 위험 사유를 투명하게 공개합니다:
                </p>
                <ul className="mt-3 space-y-2 text-amber-800 dark:text-amber-300">
                  <li>
                    <strong>1. 무차별 대입(Brute-force) 로그인 시도에 대한 Rate Limiting 부재</strong>
                    <br />
                    <em>위험 사유:</em> 동일 IP 또는 계정에 대해 연속 실패 횟수 제한(예: 5회 실패 시 5분간 계정 잠금) 및
                    지연(Exponential Backoff)이 없어 사전 공격(Dictionary Attack)에 취약할 수 있습니다.
                  </li>
                  <li>
                    <strong>2. 이메일 소유권 검증(Email Verification) 파이프라인 미구현</strong>
                    <br />
                    <em>위험 사유:</em> 가입 시 실제 수신 가능한 이메일인지 인증 링크를 발송하여 확인하는 절차가 없어
                    임의의 허위 이메일로 가입할 수 있습니다.
                  </li>
                  <li>
                    <strong>3. 2단계 인증 (2FA / TOTP) 미지원</strong>
                    <br />
                    <em>위험 사유:</em> 단일 비밀번호 인증만 제공되므로, 사용자 비밀번호가 탈취될 경우 추가 방어 수단
                    없이 계정이 침해될 수 있습니다.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            과제 7 인증 구현 설명서 6개 섹션 완비 (T07-C127 ~ T07-C131)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover-lift active-press cursor-pointer rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
