import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { NoticeBanner } from './components/NoticeBanner.tsx';
import { PlanSection } from './components/PlanSection.tsx';
import { TodoSection } from './components/TodoSection.tsx';
import { SeeDashboardSection } from './components/SeeDashboardSection.tsx';
import { FixedTestsSection } from './components/FixedTestsSection.tsx';
import { Footer } from './components/Footer.tsx';
import { VerificationGuideModal } from './components/VerificationGuideModal.tsx';
import { DataExportModal } from './components/DataExportModal.tsx';
import {
  getPlans,
  getPlanRevisions,
  getTodos,
  getExecutionLogs,
  getReviews,
  calculateSeeMetrics,
  createPlan,
  updatePlan,
  createTodo,
  updateTodo,
  completeTodo,
  revertTodo,
  deleteTodo,
  recordExecution,
  saveReview,
  exportFullData,
  resetToSeedData,
} from './services/pdsService.ts';
import type {
  Plan,
  PlanRevision,
  Todo,
  TodoStatus,
  ExecutionLog,
  Review,
  SeeMetrics,
  PdsFullDataExport,
} from './types/pds.ts';

export const App: React.FC = () => {
  // 테마 상태 (다크 모드 / 라이트 모드)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // 애플리케이션 데이터 상태
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [revisions, setRevisions] = useState<PlanRevision[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [metrics, setMetrics] = useState<SeeMetrics>({
    totalPlanTodos: 0,
    completedTodos: 0,
    delayedTodos: 0,
    blockedTodos: 0,
    totalEstimatedMinutes: 0,
    totalActualMinutes: 0,
    varianceMinutes: 0,
  });

  // 필터 및 연계 상태
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed' | 'delayed' | 'blocked'>('all');
  const [prefilledNextActionNote, setPrefilledNextActionNote] = useState<string>('');

  // 모달 상태
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportData, setExportData] = useState<PdsFullDataExport | null>(null);

  // 전체 데이터 로드 함수
  const reloadData = useCallback(async () => {
    const allPlans = await getPlans();
    setPlans(allPlans);

    const activePlan =
      allPlans.length > 0
        ? currentPlan
          ? allPlans.find((p) => p.id === currentPlan.id) || allPlans[0]
          : allPlans[0]
        : null;
    setCurrentPlan(activePlan);

    if (activePlan) {
      const [revs, planTodos, logs, revList, calculatedMetrics] = await Promise.all([
        getPlanRevisions(activePlan.id),
        getTodos(activePlan.id),
        getExecutionLogs(),
        getReviews(activePlan.id),
        calculateSeeMetrics(activePlan.id),
      ]);
      setRevisions(revs);
      setTodos(planTodos);
      setExecutionLogs(logs);
      setReviews(revList);
      setMetrics(calculatedMetrics);
    }
  }, [currentPlan]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void reloadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [reloadData]);

  // 핸들러: 계획 수정 (T06-C08 원본 스냅샷 보존)
  const handleUpdatePlan = async (data: Partial<Omit<Plan, 'id' | 'created_at'>>) => {
    if (!currentPlan) return;
    await updatePlan(currentPlan.id, data);
    await reloadData();
  };

  // 핸들러: 새 계획 생성 (T06-C33 피드백 연계)
  const handleCreatePlan = async (data: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await createPlan(data);
    setCurrentPlan(created);
    await reloadData();
  };

  // 핸들러: 할 일 생성 (T06-C09)
  const handleCreateTodo = async (
    todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'is_deleted' | 'status'> & {
      status?: TodoStatus;
    },
  ) => {
    const created = await createTodo(todoData);
    await reloadData();
    return created;
  };

  // 핸들러: 할 일 수정 (T06-C10)
  const handleUpdateTodo = async (id: string, data: Partial<Todo>) => {
    const updated = await updateTodo(id, data);
    await reloadData();
    return updated;
  };

  // 핸들러: 할 일 완료 (T06-C11)
  const handleCompleteTodo = async (id: string) => {
    const completed = await completeTodo(id);
    await reloadData();
    return completed;
  };

  // 핸들러: 할 일 되돌리기 (T06-C12)
  const handleRevertTodo = async (id: string) => {
    const reverted = await revertTodo(id);
    await reloadData();
    return reverted;
  };

  // 핸들러: 할 일 삭제 (T06-C13)
  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id);
    await reloadData();
  };

  // 핸들러: 실행 기록 등록 (T06-C21 멱등성 연타 방지)
  const handleRecordExecution = async (logData: {
    todo_id: string;
    start_time: string;
    end_time: string;
    actual_minutes: number;
    blocker_reason: string | null;
    idempotency_key: string;
  }) => {
    const res = await recordExecution(logData);
    await reloadData();
    return res;
  };

  // 핸들러: 회고 저장 및 다음 계획으로 넘기기 (T06-C33)
  const handleSaveReviewAndTransfer = async (note: string) => {
    if (!currentPlan) return;
    await saveReview(currentPlan.id, note);
    setPrefilledNextActionNote(note);
    await reloadData();
  };

  // 핸들러: 전체 데이터 내보내기 모달 열기 (T06-C36)
  const handleOpenExport = async () => {
    const data = await exportFullData();
    setExportData(data);
    setIsExportOpen(true);
  };

  // 핸들러: 시드 데이터 리셋
  const handleResetToSeed = () => {
    resetToSeedData();
    reloadData();
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-neutral-50 font-sans text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      {/* 0. Ambient Glass Background Lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-600/10" />
        <div className="absolute top-1/4 -right-40 h-125 w-125 rounded-full bg-emerald-500/10 blur-[130px] dark:bg-emerald-500/[0.07]" />
        <div className="absolute top-2/3 -left-32 h-112.5 w-112.5 rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/6" />
        <div className="absolute right-1/4 -bottom-40 h-137.5 w-137.5 rounded-full bg-neutral-400/10 blur-[140px] dark:bg-neutral-600/10" />
      </div>

      {/* 1. 상단 고정 헤더 */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenExport={handleOpenExport}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* 2. 메인 컨테이너 (헤더 높이 pt-16 + 여백 pt-20 오프셋) */}
      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-20 sm:px-6 sm:pt-24">
        {/* T06-C82 공개 안내 및 DB 상태 배너 */}
        <NoticeBanner onOpenDbGuide={() => setIsGuideOpen(true)} />

        {/* 복수 계획 전환 탭 (계획이 여러 개일 경우) */}
        {plans.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white/75 p-1.5 shadow-2xs backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/75">
            <span className="shrink-0 px-2.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              내 계획 선택:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentPlan(p)}
                  className={`hover-lift active-press cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    currentPlan?.id === p.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-transparent text-neutral-600 hover:border-neutral-200/60 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 카드 1 — Plan (계획 세우기 & 원본 스냅샷 보존) */}
        <PlanSection
          currentPlan={currentPlan}
          revisions={revisions}
          onUpdatePlan={handleUpdatePlan}
          onCreatePlan={handleCreatePlan}
          prefilledNextActionNote={prefilledNextActionNote}
          onClearPrefilledNote={() => setPrefilledNextActionNote('')}
        />

        {/* 카드 2 & 카드 3 — Do (할 일 관리 & 실행 기록 & 멱등성) */}
        {currentPlan && (
          <TodoSection
            planId={currentPlan.id}
            todos={todos}
            executionLogs={executionLogs}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            onCreateTodo={handleCreateTodo}
            onUpdateTodo={handleUpdateTodo}
            onCompleteTodo={handleCompleteTodo}
            onRevertTodo={handleRevertTodo}
            onDeleteTodo={handleDeleteTodo}
            onRecordExecution={handleRecordExecution}
          />
        )}

        {/* 카드 4 — See (돌아보기 대시보드 & 다음 계획으로 넘기기) */}
        {currentPlan && (
          <SeeDashboardSection
            planId={currentPlan.id}
            metrics={metrics}
            reviews={reviews}
            onSelectMetricFilter={setFilterMode}
            onSaveReviewAndTransfer={handleSaveReviewAndTransfer}
          />
        )}

        {/* 품질 자동화 — 사전 고정 10대 검사 러너 */}
        <FixedTestsSection />
      </main>

      {/* 3. 푸터 */}
      <Footer />

      {/* 모달 1: 확인 방법 4줄 & AI 판단 3줄 & Supabase 가이드 */}
      <VerificationGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* 모달 2: 전체 데이터 단일 JSON 내보내기 (T06-C36) */}
      <DataExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        exportData={exportData}
        onResetToSeed={handleResetToSeed}
      />
    </div>
  );
};
