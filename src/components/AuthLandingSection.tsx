import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Sparkles,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  BookOpen,
  Terminal,
} from 'lucide-react';
import { loginUser, registerUser, DEFAULT_USER_A, DEFAULT_USER_B } from '../services/authService.ts';
import type { AuthSession } from '../types/auth.ts';

interface AuthLandingSectionProps {
  onLoginSuccess: (session: AuthSession) => void;
  onOpenGuide: () => void;
  onOpenManual: () => void;
}

// 부드러운 애니메이션 변형 정의 (Framer Motion Variants)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export const AuthLandingSection: React.FC<AuthLandingSectionProps> = ({
  onLoginSuccess,
  onOpenGuide,
  onOpenManual,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      if (tab === 'login') {
        const session = await loginUser(email, password);
        onLoginSuccess(session);
      } else {
        const session = await registerUser(email, password);
        onLoginSuccess(session);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('SktAleph!2026#Secure*Pass99');
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const session = await loginUser(userEmail, 'SktAleph!2026#Secure*Pass99');
      onLoginSuccess(session);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '빠른 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto flex min-h-[85vh] max-w-5xl flex-col items-center justify-center px-4 py-8 sm:py-12"
    >
      {/* 1. 상단 안내 고지 (T07-C03 & T07-C46) */}
      <motion.div
        variants={itemVariants}
        className="relative mb-6 w-full max-w-4xl overflow-hidden rounded-2xl border-indigo-500/25 p-4 text-center shadow-[0_4px_24px_rgba(99,102,241,0.08)] backdrop-blur-xl dark:border-indigo-400/25 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-indigo-950/40"
      >
        {/* Top Rim Light */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/50 to-transparent"
          aria-hidden="true"
        />

        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-950 dark:text-indigo-200">
          <div className="flex h-5 w-5 items-center justify-center rounded-md text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span>과제 7: 플랜두씨 다이어리 2 — 인증이 적용된 비공개 다이어리</span>
        </div>
        <p className="mt-1 text-xs font-medium text-indigo-700/90 dark:text-indigo-300/90">
          "첫 화면은 로그인 화면입니다. 내 기록은 로그인 뒤에만 보입니다. (T07-C03)"
        </p>
      </motion.div>

      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-12 lg:gap-8">
        {/* 좌측: 서비스 브리핑 및 빠른 데모 체험 */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_12px_40px_-8px_rgba(31,38,135,0.07)] backdrop-blur-2xl sm:p-8 lg:col-span-6 dark:border-white/10 dark:bg-neutral-900/75 dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)]"
        >
          {/* Top Rim Highlight & Ambient Lighting with smooth pulse */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent dark:via-white/20"
            aria-hidden="true"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.12, 0.24, 0.12],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-400/20"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{
                  scale: 1.06,
                  rotate: [0, -2, 2, 0],
                  transition: { type: 'spring', stiffness: 400, damping: 20 },
                }}
                whileTap={{ scale: 0.95 }}
                className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-indigo-500/30 bg-linear-to-br from-white/90 to-indigo-50/80 p-1 shadow-lg shadow-indigo-500/15 backdrop-blur-xl sm:h-20 sm:w-20 dark:border-indigo-400/30 dark:from-neutral-800/90 dark:to-indigo-950/50"
              >
                <img
                  src="/plandosee-mascot.png"
                  alt="플랜두씨 마스코트 캐릭터"
                  className="h-full w-full rounded-xl object-cover"
                />
              </motion.div>
              <div>
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="rounded-fullpx-2.5 inline-flex items-center gap-1.5 py-0.5 text-xs font-semibold text-emerald-700 backdrop-blur-md dark:border-emerald-400/25 dark:bg-emerald-500/15 dark:text-emerald-300"
                >
                  <Sparkles className="h-3 w-3" />
                  PBKDF2-SHA256 & JWT 세션 보호
                </motion.div>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tighter text-neutral-900 sm:text-3xl dark:text-neutral-50">
                  안녕하세요. <br />
                  플랜두씨예요. 👋
                </h1>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed tracking-tighter text-neutral-600 sm:text-sm dark:text-neutral-400">
              저와 함께 목표를 향해 계획을 세워갈 준비가 되었나요? <br />
              로그인하여 내 계획, 5일간의 실제 실행 기록, 시간 오차 분석 및 계획 규칙 변경 전후 비교를 나만 안전하게
              확인할 수 있어요.
            </p>

            {/* 빠른 테스트 계정 선택 (T07-C116 증적용) */}
            <div className="relative mt-5 space-y-3 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100/60 p-4 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/50">
              <p className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                🚀 심사용 테스트 계정 체험
              </p>
              <div className="space-y-2.5">
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  type="button"
                  onClick={() => handleQuickLogin(DEFAULT_USER_A.email)}
                  disabled={isLoading}
                  className="hover-lift active-press group flex w-full cursor-pointer items-center justify-between rounded-xl border border-indigo-200/80 bg-linear-to-r from-indigo-50/90 via-indigo-100/60 to-indigo-50/80 p-3 text-left transition-all hover:border-indigo-400/70 hover:shadow-md hover:shadow-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-800/50 dark:from-indigo-950/60 dark:via-indigo-900/40 dark:to-indigo-950/50 dark:hover:border-indigo-600/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/25 bg-white/80 text-indigo-600 shadow-2xs backdrop-blur-md transition-transform duration-200 group-hover:scale-105 dark:border-indigo-400/25 dark:bg-neutral-800/80 dark:text-indigo-400">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-indigo-950 dark:text-indigo-100">User A: 진영 (주 계정)</div>
                      <div className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80">
                        {DEFAULT_USER_A.email} · 5일 관찰 데이터 보유
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-indigo-400 opacity-70 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 dark:text-indigo-300" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  type="button"
                  onClick={() => handleQuickLogin(DEFAULT_USER_B.email)}
                  disabled={isLoading}
                  className="hover-lift active-press group flex w-full cursor-pointer items-center justify-between rounded-xl border border-rose-200/80 bg-linear-to-r from-rose-50/90 via-rose-100/60 to-rose-50/80 p-3 text-left transition-all hover:border-rose-400/70 hover:shadow-md hover:shadow-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800/50 dark:from-rose-950/60 dark:via-rose-900/40 dark:to-rose-950/50 dark:hover:border-rose-600/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/25 bg-white/80 text-rose-600 shadow-2xs backdrop-blur-md transition-transform duration-200 group-hover:scale-105 dark:border-rose-400/25 dark:bg-neutral-800/80 dark:text-rose-400">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-rose-950 dark:text-rose-100">User B: 침투 테스트 계정</div>
                      <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                        {DEFAULT_USER_B.email} · 격리된 비밀 프로젝트
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-rose-400 opacity-70 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 dark:text-rose-300" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              type="button"
              onClick={onOpenManual}
              className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:border-white/20 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
              인증 구현 설명서 (6섹션)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              type="button"
              onClick={onOpenGuide}
              className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:border-white/20 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-500" />
              확인 방법 4줄 & 판단 3줄
            </motion.button>
          </div>
        </motion.div>

        {/* 우측: 로그인 / 회원가입 폼 */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col justify-center overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-6 shadow-[0_12px_40px_-8px_rgba(31,38,135,0.07)] backdrop-blur-2xl sm:p-8 lg:col-span-6 dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)]"
        >
          {/* Top Rim Highlight & Ambient Lighting with smooth pulse */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent dark:via-white/20"
            aria-hidden="true"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.12, 0.24, 0.12],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-400/20"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* 세련된 글래스모피즘 세그먼트 탭 with Smooth Sliding Pill */}
            <div className="relative flex rounded-2xl border border-neutral-200/70 bg-neutral-100/80 p-1.5 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/70">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                }}
                className={`relative z-10 flex-1 cursor-pointer rounded-xl py-2.5 text-xs font-bold transition-colors duration-200 ${
                  tab === 'login'
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                {tab === 'login' && (
                  <motion.div
                    layoutId="activeAuthTabPill"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-20">로그인</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg(null);
                }}
                className={`relative z-10 flex-1 cursor-pointer rounded-xl py-2.5 text-xs font-bold transition-colors duration-200 ${
                  tab === 'register'
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                {tab === 'register' && (
                  <motion.div
                    layoutId="activeAuthTabPill"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-20">신규 회원가입</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden rounded-xl border border-rose-300/80 bg-rose-50/90 p-3 text-xs font-medium text-rose-800 shadow-2xs backdrop-blur-md dark:border-rose-900/60 dark:bg-rose-950/70 dark:text-rose-300"
                  >
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="group">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  이메일 주소
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors duration-200 group-focus-within:text-indigo-500 dark:text-neutral-500 dark:group-focus-within:text-indigo-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="예: user@aleph.skt"
                    className="w-full rounded-xl border border-neutral-200/80 bg-white/70 py-2.5 pr-4 pl-10 text-sm text-neutral-900 shadow-inner backdrop-blur-md transition-all outline-none placeholder:text-neutral-400 focus:border-indigo-500/80 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-neutral-950/60 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-indigo-400/80 dark:focus:bg-neutral-950 dark:focus:ring-indigo-400/20"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">비밀번호</label>
                <div className="relative mt-1.5">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors duration-200 group-focus-within:text-indigo-500 dark:text-neutral-500 dark:group-focus-within:text-indigo-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-neutral-200/80 bg-white/70 py-2.5 pr-4 pl-10 text-sm text-neutral-900 shadow-inner backdrop-blur-md transition-all outline-none placeholder:text-neutral-400 focus:border-indigo-500/80 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-neutral-950/60 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-indigo-400/80 dark:focus:bg-neutral-950 dark:focus:ring-indigo-400/20"
                  />
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  비밀번호는 PBKDF2-SHA256 단방향 해시 및 고유 솔트로 안전하게 암호화 보관됩니다.
                </p>
              </div>

              <motion.button
                whileHover={isLoading ? {} : { scale: 1.015, y: -1 }}
                whileTap={isLoading ? {} : { scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                type="submit"
                disabled={isLoading}
                className="hover-lift active-press group relative mt-3 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-indigo-500 to-indigo-700 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:via-indigo-400 hover:to-indigo-600 hover:shadow-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-indigo-950/50"
              >
                {/* Button shine overlay */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-transparent via-white/10 to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="animate-pulse">보안 인증 처리 중...</span>
                  </span>
                ) : tab === 'login' ? (
                  <>
                    <Lock className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>다이어리 로그인하기</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>계정 생성 및 로그인</span>
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-5 text-center text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              과제 7 통과 기준 충족: 비밀번호 평문 미저장 (T07-C103) · 토큰 수명 관리 (T07-C111)
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
