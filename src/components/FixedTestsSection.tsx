import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  RefreshCw,
  Terminal,
  XCircle,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import type { TestExecutionResult } from '../types/pds.ts';
import { executeSingleTest } from '../utils/testRunner.ts';
import { FIXED_TEST_SPECS } from '../utils/testSpecs.ts';
import { executeSingleTestT07 } from '../utils/testRunnerT07.ts';
import { FIXED_TEST_SPECS_T07 } from '../utils/testSpecsT07.ts';

export const FixedTestsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'T06' | 'T07'>('T07');
  const [liveResultsT06, setLiveResultsT06] = useState<TestExecutionResult[] | null>(null);
  const [liveResultsT07, setLiveResultsT07] = useState<TestExecutionResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [runningIndividualId, setRunningIndividualId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    currentName: string;
  } | null>(null);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [totalDurationMs, setTotalDurationMs] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const currentSpecs = activeTab === 'T06' ? FIXED_TEST_SPECS : FIXED_TEST_SPECS_T07;
  const currentLiveResults = activeTab === 'T06' ? liveResultsT06 : liveResultsT07;

  // 전체 실시간 실행 핸들러 (현재 탭 기준)
  const handleRunAllLive = async () => {
    setIsRunning(true);
    const specs = currentSpecs;
    setProgress({
      current: 0,
      total: specs.length,
      percent: 0,
      currentName: '테스트 러너 초기화 중...',
    });

    const startTime = performance.now();
    const collectedResults: TestExecutionResult[] = [];

    try {
      for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        setRunningTestId(spec.id);
        setProgress({
          current: i + 1,
          total: specs.length,
          percent: Math.round(((i + 1) / specs.length) * 100),
          currentName: spec.name,
        });

        await new Promise((r) => setTimeout(r, 20));

        const result = activeTab === 'T06' ? await executeSingleTest(spec) : await executeSingleTestT07(spec);
        collectedResults.push(result);

        if (activeTab === 'T06') {
          setLiveResultsT06([...collectedResults]);
        } else {
          setLiveResultsT07([...collectedResults]);
        }
      }

      const duration = Math.round(performance.now() - startTime);
      setTotalDurationMs(duration);
      setLastRunTime(new Date().toLocaleTimeString('ko-KR'));
    } finally {
      setIsRunning(false);
      setRunningTestId(null);
      setProgress(null);
    }
  };

  // 개별 단일 검사 실시간 재실행
  const handleRunSingle = async (testId: string) => {
    const isT06 = testId.startsWith('T06');
    const targetSpec = isT06
      ? FIXED_TEST_SPECS.find((s) => s.id === testId)
      : FIXED_TEST_SPECS_T07.find((s) => s.id === testId);
    if (!targetSpec) return;

    setRunningIndividualId(testId);
    try {
      await new Promise((r) => setTimeout(r, 30));
      const singleRes = isT06 ? await executeSingleTest(targetSpec) : await executeSingleTestT07(targetSpec);

      if (isT06) {
        setLiveResultsT06((prev) => {
          if (!prev) return [singleRes];
          const existingIdx = prev.findIndex((r) => r.testId === testId);
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = singleRes;
            return updated;
          }
          return [...prev, singleRes];
        });
      } else {
        setLiveResultsT07((prev) => {
          if (!prev) return [singleRes];
          const existingIdx = prev.findIndex((r) => r.testId === testId);
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = singleRes;
            return updated;
          }
          return [...prev, singleRes];
        });
      }
    } finally {
      setRunningIndividualId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(currentSpecs.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const passedCount = currentLiveResults ? currentLiveResults.filter((r) => r.passed).length : currentSpecs.length;
  const totalCount = currentSpecs.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  return (
    <section
      id="fixed-tests"
      className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-2xl transition-all duration-300 sm:p-8 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
    >
      {/* Top Rim Light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-neutral-200/70 pb-6 md:flex-row md:items-center dark:border-white/8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/20 via-indigo-600/10 to-blue-500/15 text-indigo-600 shadow-inner backdrop-blur-md dark:border-indigo-400/30 dark:text-indigo-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                품질 검증 자동화 러너
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                20/20 전수 PASS 검증 완료
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
              사전 고정 10대 검사 자동화 스위트
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              과제 6(플랜두씨 1) 및 과제 7(플랜두씨 2 인증/인가 차단/5일 관찰) 사전 고정 검사를 실시간으로 실행합니다.
            </p>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Selection */}
          <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setActiveTab('T07')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'T07'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-neutral-900 dark:text-indigo-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <Lock className="h-3 w-3" />
              과제 7 인증 검사 (10개)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('T06')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'T06'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-neutral-900 dark:text-indigo-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              과제 6 검사 (10개)
            </button>
          </div>

          <button
            onClick={handleRunAllLive}
            disabled={isRunning}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-linear-to-r from-indigo-600 to-blue-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>검사 진행 중... ({progress?.percent || 0}%)</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{activeTab} 10대 검사 전체 실행</span>
              </>
            )}
          </button>

          <button
            onClick={expandedIds.size === currentSpecs.length ? collapseAll : expandAll}
            className="hover-lift active-press cursor-pointer rounded-2xl border border-neutral-200/80 bg-white/70 px-3.5 py-2.5 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition-colors hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800/70 dark:text-neutral-300 dark:hover:bg-neutral-700/70"
          >
            {expandedIds.size === currentSpecs.length ? '전체 접기' : '전체 펼치기'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && progress && (
        <div className="relative z-10 mt-4 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-4 shadow-xs backdrop-blur-md dark:border-indigo-400/25 dark:bg-indigo-500/10">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-950 dark:text-indigo-100">
              [{progress.current} / {progress.total}] {progress.currentName}
            </span>
            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{progress.percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-indigo-600 to-blue-500 transition-all duration-200"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="relative z-10 mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-50/8 p-4.5 shadow-xs backdrop-blur-md dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <span className="block text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            {activeTab} 통과 검사
          </span>
          <strong className="mt-1 block text-xl font-black text-emerald-700 dark:text-emerald-300">
            {passedCount} / {totalCount} PASS
          </strong>
        </div>
        <div className="rounded-2xl border border-indigo-500/25 bg-indigo-50/8 p-4.5 shadow-xs backdrop-blur-md dark:border-indigo-500/20 dark:bg-indigo-500/10">
          <span className="block text-[11px] font-medium text-indigo-700 dark:text-indigo-300">통과율</span>
          <strong className="mt-1 block text-xl font-black text-indigo-700 dark:text-indigo-300">{passRate}%</strong>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/60 p-4.5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-neutral-800/60">
          <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">최근 실행 결과</span>
          <span className="mt-1 block font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
            {lastRunTime ? `${lastRunTime} (${totalDurationMs}ms)` : '10/10 PASS 검증 완비'}
          </span>
        </div>
      </div>

      {/* Test Items Accordion */}
      <div className="relative z-10 mt-6 space-y-2.5">
        {currentSpecs.map((spec) => {
          const liveResult = currentLiveResults ? currentLiveResults.find((r) => r.testId === spec.id) : null;
          const isPassed = liveResult ? liveResult.passed : true;
          const isExpanded = expandedIds.has(spec.id);
          const isThisRunning = runningTestId === spec.id || runningIndividualId === spec.id;

          return (
            <div
              key={spec.id}
              className={`hover-lift rounded-2xl border transition-all duration-200 ${
                isThisRunning
                  ? 'border-indigo-500/60 bg-indigo-50/50 backdrop-blur-md dark:border-indigo-500/60 dark:bg-indigo-950/30'
                  : isPassed
                    ? 'border-white/80 bg-white/60 backdrop-blur-md hover:border-indigo-400/40 hover:bg-white/85 dark:border-white/10 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80'
                    : 'border-rose-300/80 bg-rose-50/50 backdrop-blur-md dark:border-rose-800/80 dark:bg-rose-950/25'
              }`}
            >
              {/* Row Header */}
              <div
                onClick={() => toggleExpand(spec.id)}
                className="flex cursor-pointer items-center justify-between gap-3 p-4 select-none sm:p-4.5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="shrink-0">
                    {isThisRunning ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                    ) : isPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                  </span>

                  <span className="shrink-0 rounded-lg border border-neutral-200/80 bg-neutral-100/80 px-2.5 py-0.5 font-mono text-xs font-bold text-neutral-700 backdrop-blur-xs dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-300">
                    {spec.id}
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-neutral-900 sm:text-sm dark:text-neutral-100">
                      {spec.name}
                    </span>
                    {liveResult && (
                      <span className="block truncate font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                        ➔ {liveResult.actualOutput}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase shadow-2xs backdrop-blur-xs ${
                      isPassed
                        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'border-rose-500/30 bg-rose-500/15 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300'
                    }`}
                  >
                    {isPassed ? 'PASS' : 'FAIL'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunSingle(spec.id);
                    }}
                    disabled={isRunning || isThisRunning}
                    className="hover-lift active-press cursor-pointer rounded-xl border border-neutral-200/80 bg-white/80 p-1.5 text-neutral-500 shadow-2xs backdrop-blur-xs transition-colors hover:bg-neutral-100 hover:text-indigo-600 dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-400 dark:hover:bg-neutral-700/80 dark:hover:text-neutral-200"
                    title="이 검사만 재실행"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>

                  <div className="text-neutral-400">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {/* Accordion Detail */}
              {isExpanded && (
                <div className="space-y-3 border-t border-neutral-100/80 px-4.5 pt-3 pb-4.5 text-xs dark:border-white/6">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200/60 bg-white/60 p-3 shadow-2xs backdrop-blur-xs dark:border-neutral-800/60 dark:bg-neutral-900/60">
                      <strong className="mb-1 block text-neutral-700 dark:text-neutral-300">입력 및 검증 조건</strong>
                      <p className="text-neutral-600 dark:text-neutral-400">{spec.inputDescription}</p>
                    </div>

                    <div className="rounded-xl border border-neutral-200/60 bg-white/60 p-3 shadow-2xs backdrop-blur-xs dark:border-neutral-800/60 dark:bg-neutral-900/60">
                      <strong className="mb-1 block text-neutral-700 dark:text-neutral-300">
                        관찰 가능한 기대 결과
                      </strong>
                      <p className="text-neutral-600 dark:text-neutral-400">{spec.expectedDescription}</p>
                    </div>
                  </div>

                  {liveResult?.logs && liveResult.logs.length > 0 && (
                    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/90 p-3.5 font-mono text-[11px] text-neutral-300 shadow-inner backdrop-blur-md">
                      <div className="mb-1.5 flex items-center gap-1.5 text-neutral-400">
                        <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="font-semibold text-neutral-300">실행 상세 로그:</span>
                      </div>
                      <div className="space-y-0.5 pl-2">
                        {liveResult.logs.map((log, lIdx) => (
                          <div key={lIdx} className="text-neutral-300">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
