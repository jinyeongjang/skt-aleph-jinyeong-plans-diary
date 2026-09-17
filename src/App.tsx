import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { NoticeBanner } from './components/NoticeBanner.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { AuthLandingSection } from './components/AuthLandingSection.tsx';
import { ObservationDashboardSection } from './components/ObservationDashboardSection.tsx';
import { PlanSelector } from './components/PlanSelector.tsx';
import { PlanSection } from './components/PlanSection.tsx';
import { TodoSection } from './components/TodoSection.tsx';
import { SeeDashboardSection } from './components/SeeDashboardSection.tsx';
import { FixedTestsSection } from './components/FixedTestsSection.tsx';
import { Footer } from './components/Footer.tsx';
import { VerificationGuideModal } from './components/VerificationGuideModal.tsx';
import { AuthManualModal } from './components/AuthManualModal.tsx';
import { SecurityAuditModal } from './components/SecurityAuditModal.tsx';
import { AccountDeletionModal } from './components/AccountDeletionModal.tsx';
import { DataExportModal } from './components/DataExportModal.tsx';
import { getCurrentSession, logoutUser } from './services/authService.ts';
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
import type { AuthSession } from './types/auth.ts';

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

  // 인증 세션 상태 (과제 7: T07-C03)
  const [session, setSession] = useState<AuthSession | null>(() => getCurrentSession());

  // 애플리케이션 데이터 상태
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const currentPlan = (selectedPlanId ? plans.find((p) => p.id === selectedPlanId) : null) || plans[0] || null;

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
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [exportData, setExportData] = useState<PdsFullDataExport | null>(null);

  // 계획 세부 데이터 로드 함수
  const loadPlanDetails = useCallback(
    async (planId: string) => {
      const userId = session?.user.id;
      const [revs, planTodos, logs, revList, calculatedMetrics] = await Promise.all([
        getPlanRevisions(planId, userId),
        getTodos(planId, userId),
        getExecutionLogs(undefined, userId),
        getReviews(planId, userId),
        calculateSeeMetrics(planId, userId),
      ]);
      setRevisions(revs);
      setTodos(planTodos);
      setExecutionLogs(logs);
      setReviews(revList);
      setMetrics(calculatedMetrics);
    },
    [session?.user.id],
  );

  // 전체 계획 목록 로드 함수
  const loadPlans = useCallback(async () => {
    const userId = session?.user.id;
    const allPlans = await getPlans(userId);
    setPlans(allPlans);
    return allPlans;
  }, [session?.user.id]);

  // 세션 변경 또는 마운트 시 데이터 로드
  useEffect(() => {
    let isMounted = true;
    const fetchInitialPlans = async () => {
      if (!session) {
        if (isMounted) {
          setPlans([]);
          setIsLoadingPlans(false);
        }
        return;
      }
      setIsLoadingPlans(true);
      try {
        const allPlans = await getPlans(session.user.id);
        if (isMounted) {
          setPlans(allPlans);
          if (allPlans.length > 0) {
            setSelectedPlanId(allPlans[0].id);
          }
        }
      } catch (error) {
        console.error('계획 로드 중 오류 발생:', error);
      } finally {
        if (isMounted) {
          setIsLoadingPlans(false);
        }
      }
    };

    void fetchInitialPlans();

    return () => {
      isMounted = false;
    };
  }, [session]);

  // 활성 계획 변경 시 세부 데이터 로드
  useEffect(() => {
    if (!currentPlan?.id || !session) return;
    const planId = currentPlan.id;
    const timer = setTimeout(() => {
      void loadPlanDetails(planId);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPlan?.id, session, loadPlanDetails]);

  // 핸들러: 로그인 성공
  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
  };

  // 핸들러: 로그아웃 (T07-C109, T07-C114)
  const handleLogout = () => {
    logoutUser();
    setSession(null);
    setSelectedPlanId(null);
  };

  // 핸들러: 탈퇴 완료
  const handleDeleteAccountSuccess = () => {
    setIsDeleteAccountOpen(false);
    setSession(null);
    setSelectedPlanId(null);
  };

  // 핸들러: 계획 수정 (T06-C08 원본 스냅샷 보존)
  const handleUpdatePlan = async (data: Partial<Omit<Plan, 'id' | 'created_at'>>) => {
    if (!currentPlan) return;
    const userId = session?.user.id;
    await updatePlan(currentPlan.id, data, userId);
    await loadPlans();
    await loadPlanDetails(currentPlan.id);
  };

  // 핸들러: 새 계획 생성 (T06-C33 피드백 연계)
  const handleCreatePlan = async (data: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    const userId = session?.user.id;
    const created = await createPlan(data, userId);
    await loadPlans();
    setSelectedPlanId(created.id);
    await loadPlanDetails(created.id);
    return created;
  };

  // 핸들러: 할 일 생성 (T06-C09)
  const handleCreateTodo = async (
    todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'is_deleted' | 'status'> & {
      status?: TodoStatus;
    },
  ): Promise<Todo> => {
    const userId = session?.user.id;
    const created = await createTodo(todoData, userId);
    if (currentPlan) {
      await loadPlanDetails(currentPlan.id);
    }
    if (filterMode === 'completed' || filterMode === 'blocked') {
      setFilterMode('all');
    }
    return created;
  };

  // 핸들러: 할 일 수정 (T06-C10)
  const handleUpdateTodo = async (id: string, data: Partial<Todo>): Promise<Todo> => {
    const userId = session?.user.id;
    const updated = await updateTodo(id, data, userId);
    if (currentPlan) {
      await loadPlanDetails(currentPlan.id);
    }
    return updated;
  };

  // 핸들러: 할 일 완료 (T06-C11)
  const handleCompleteTodo = async (id: string): Promise<Todo> => {
    const userId = session?.user.id;
    const completed = await completeTodo(id, userId);
    if (currentPlan) {
      await loadPlanDetails(currentPlan.id);
    }
    return completed;
  };

  // 핸들러: 할 일 되돌리기 (T06-C12)
  const handleRevertTodo = async (id: string): Promise<Todo> => {
    const userId = session?.user.id;
    const reverted = await revertTodo(id, userId);
    if (currentPlan) {
      await loadPlanDetails(currentPlan.id);
    }
    return reverted;
  };

  // 핸들러: 할 일 삭제 (T06-C13)
  const handleDeleteTodo = async (id: string): Promise<void> => {
    const userId = session?.user.id;
    await deleteTodo(id, userId);
    if (currentPlan) {
      await loadPlanDetails(currentPlan.id);
    }
  };

  // 핸들러: 실행 기록 등록 (T06-C21 멱등성 연타 방지)
  const handleRecordExecution = async (logData: {
    todo_id: string;
    start_time: string;
    end_time: string;
    actual_minutes: number;
    blocker_reason: string | null;
    idempotency_key: string;
  }): Promise<{ success: boolean; log: ExecutionLog; isDuplicate: boolean }> => {
    const userId = session?.user.id;
    const res = await recordExecution(logData, userId);
    if (currentPlan) {
      await loadPlanDetails(currentPlan.id);
    }
    return res;
  };

  // 핸들러: 회고 저장 및 다음 계획으로 넘기기 (T06-C33)
  const handleSaveReviewAndTransfer = async (note: string) => {
    if (!currentPlan || !session) return;
    await saveReview(currentPlan.id, note, session.user.id);
    setPrefilledNextActionNote(note);
    await loadPlanDetails(currentPlan.id);
  };

  // 핸들러: 전체 데이터 내보내기 모달 열기 (T07-C133)
  const handleOpenExport = async () => {
    const data = await exportFullData(session?.user.id);
    setExportData(data);
    setIsExportOpen(true);
  };

  // 핸들러: 시드 데이터 리셋
  const handleResetToSeed = async () => {
    resetToSeedData();
    const allPlans = await loadPlans();
    if (allPlans.length > 0) {
      setSelectedPlanId(allPlans[0].id);
      await loadPlanDetails(allPlans[0].id);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-neutral-50 font-sans text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      {/* 0. Ambient Glass Background Lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-[100px] dark:bg-indigo-600/15" />
        <div className="absolute top-1/4 -right-40 h-125 w-125 rounded-full bg-emerald-500/15 blur-[130px] dark:bg-emerald-500/12" />
        <div className="absolute top-2/3 -left-32 h-112.5 w-112.5 rounded-full bg-purple-500/15 blur-[120px] dark:bg-purple-500/12" />
        <div className="absolute right-1/4 -bottom-40 h-137.5 w-137.5 rounded-full bg-sky-400/15 blur-[140px] dark:bg-sky-600/10" />
      </div>

      {/* 1. 상단 고정 헤더 */}
      <Header
        session={session}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenExport={handleOpenExport}
        onOpenDeleteAccount={() => setIsDeleteAccountOpen(true)}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* 2. 메인 컨테이너 */}
      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-20 sm:px-6 sm:pt-24">
        {!session ? (
          /* T07-C03: 첫 화면은 로그인 화면입니다. 내 기록은 로그인 뒤에만 보입니다 */
          <AuthLandingSection
            onLoginSuccess={handleLoginSuccess}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenManual={() => setIsManualOpen(true)}
          />
        ) : (
          /* 로그인 후 개인화 다이어리 및 5일 관찰 대시보드 */
          <>
            {/* 상단 안내 배너 */}
            <NoticeBanner onOpenDbGuide={() => setIsGuideOpen(true)} />

            {/* 히어로 배너 */}
            <HeroBanner />

            {/* 카드 5: 5일 관찰 질문 & 지표 & 3일차 앞 계획 규칙 변경 (T07-C04 ~ T07-C27, T07-C132) */}
            <ObservationDashboardSection />

            {/* 복수/단일 계획 전환 및 탐색 바 */}
            {(isLoadingPlans || plans.length > 0) && (
              <PlanSelector
                plans={plans}
                isLoading={isLoadingPlans}
                selectedPlanId={currentPlan?.id || null}
                onSelectPlan={(id) => setSelectedPlanId(id)}
                onOpenNewPlan={() => {
                  const planSection = document.getElementById('plan-section');
                  if (planSection) {
                    planSection.scrollIntoView({ behavior: 'smooth' });
                    const addBtn = planSection.querySelector('button[data-action="new-plan"]') as HTMLButtonElement;
                    if (addBtn) addBtn.click();
                  }
                }}
              />
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

            {/* 품질 자동화 — 통합 사전 고정 검사 러너 */}
            <FixedTestsSection />
          </>
        )}
      </main>

      {/* 3. 푸터 */}
      <Footer />

      {/* 모달 1: 확인 방법 4줄 & AI 판단 3줄 */}
      <VerificationGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* 모달 2: 인증 구현 설명서 6개 섹션 (T07-C127 ~ T07-C131) */}
      <AuthManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />

      {/* 모달 3: 양방향 침범 차단 & IDOR 보안 감사기 (T07-C116 ~ T07-C126) */}
      <SecurityAuditModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />

      {/* 모달 4: 전체 데이터 단일 JSON 내보내기 (T07-C133) */}
      <DataExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        exportData={exportData}
        onResetToSeed={handleResetToSeed}
      />

      {/* 모달 5: 계정 탈퇴 및 하위 데이터 연쇄 삭제 (T07-C134) */}
      {session && (
        <AccountDeletionModal
          isOpen={isDeleteAccountOpen}
          userId={session.user.id}
          userEmail={session.user.email}
          onClose={() => setIsDeleteAccountOpen(false)}
          onDeleted={handleDeleteAccountSuccess}
        />
      )}
    </div>
  );
};
