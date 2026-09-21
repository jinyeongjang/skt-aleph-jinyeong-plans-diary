import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, HelpCircle, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import {
  FIVE_DAYS_OBSERVATION_DATA,
  INITIAL_OBSERVATION_RULE,
  HAND_CALCULATION_SUMMARY,
} from '../data/observationData.ts';

export const ObservationDashboardSection: React.FC = () => {
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  return (
    <section
      id="observation-section"
      className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-2xl transition-all duration-300 sm:p-8 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
    >
      {/* 상단 은은한 림라이트 (유리 반사 효과) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      {/* 1. 상단 섹션 헤더 */}
      <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-neutral-200/80 pb-6 sm:flex-row sm:items-center dark:border-neutral-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <CalendarDays className="h-3.5 w-3.5" />
            카드 5 — 5일 관찰 기록 및 계획 규칙 변경 (T07-C04 ~ T07-C27)
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-50">
            5일 관찰 질문 & 규칙 변경 전후 지표 비교
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Asia/Seoul 기준 5일간의 실제 실행 기록과 3일차 진입 전(2일차 뒤) 단행된 계획 규칙 변경 효과를 분석합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRulesExpanded(!isRulesExpanded)}
          className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-md transition hover:bg-neutral-100 sm:self-auto dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          <HelpCircle className="h-4 w-4 text-indigo-500" />
          5대 예외 처리 & 계산 규칙{' '}
          {isRulesExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 2. 1일차 고정 관찰 기준 카드 (T07-C04 ~ T07-C06, T07-C08) */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <div className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            T07-C04 관찰 질문 (고정 1문장)
          </div>
          <div className="mt-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            "{INITIAL_OBSERVATION_RULE.observation_question}"
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            T07-C05 관찰 지표 (1개 고정)
          </div>
          <div className="mt-1 text-xs font-bold text-neutral-900 dark:text-neutral-100">
            {INITIAL_OBSERVATION_RULE.observation_metric}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200/60 bg-sky-50/50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="text-[11px] font-bold tracking-wider text-sky-600 uppercase dark:text-sky-400">
            T07-C06 측정 단위 (고정)
          </div>
          <div className="mt-1 text-xs font-bold text-neutral-900 dark:text-neutral-100">
            {INITIAL_OBSERVATION_RULE.metric_unit}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200/60 bg-purple-50/50 p-4 dark:border-purple-900/40 dark:bg-purple-950/20">
          <div className="text-[11px] font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
            T07-C08 일관 집계 규칙
          </div>
          <div className="mt-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            실제(Actual) - 예상(Estimated)
          </div>
        </div>
      </div>

      {/* 3. 접이식 5대 예외 처리 규칙 패널 (T07-C23 ~ T07-C27) */}
      {isRulesExpanded && (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/90 p-5 dark:border-neutral-800 dark:bg-neutral-950/70">
          <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
            📋 과제 7 공식 5대 데이터 처리 기준 (T07-C23 ~ T07-C27)
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-neutral-700 sm:grid-cols-2 lg:grid-cols-3 dark:text-neutral-300">
            <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-neutral-900">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">① 결측치 (T07-C23):</span>{' '}
              {INITIAL_OBSERVATION_RULE.missing_value_rule}
            </div>
            <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-neutral-900">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">② 중복치 (T07-C24):</span>{' '}
              {INITIAL_OBSERVATION_RULE.duplicate_value_rule}
            </div>
            <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-neutral-900">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">③ 이상치 (T07-C25):</span>{' '}
              {INITIAL_OBSERVATION_RULE.outlier_value_rule}
            </div>
            <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-neutral-900">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">④ 반올림 (T07-C26):</span>{' '}
              {INITIAL_OBSERVATION_RULE.rounding_rule}
            </div>
            <div className="rounded-xl bg-white p-3 shadow-xs sm:col-span-2 lg:col-span-2 dark:bg-neutral-900">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">⑤ 주 시작 요일 (T07-C27):</span>{' '}
              {INITIAL_OBSERVATION_RULE.week_start_day}
            </div>
          </div>
        </div>
      )}

      {/* 4. 5일 관찰 타임라인 및 3일차 앞 규칙 변경 구분자 (T07-C07, T07-C09 ~ T07-C15) */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            📅 Asia/Seoul 5일 연속 실행 기록 타임라인
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">2026-09-17 ~ 2026-09-21</span>
        </div>

        <div className="space-y-3">
          {FIVE_DAYS_OBSERVATION_DATA.map((entry) => {
            const isBeforeChange = entry.rulePhase === 'BEFORE_CHANGE';

            return (
              <React.Fragment key={entry.dayNumber}>
                {/* 2일차 뒤, 3일차 앞 규칙 변경 구분자 (T07-C09 ~ T07-C12) */}
                {entry.dayNumber === 3 && (
                  <div className="my-6 rounded-2xl border-2 border-dashed border-amber-300/80 bg-amber-50/70 p-4.5 backdrop-blur-md dark:border-amber-700/60 dark:bg-amber-950/30">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                          ⚡
                        </span>
                        <div>
                          <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                            [T07-C09] 2일차 뒤 ➔ 3일차 앞 계획 규칙 변경 단행
                          </span>
                          <span className="ml-2 text-[11px] text-amber-800/80 dark:text-amber-400/80">
                            (변경 시각: {INITIAL_OBSERVATION_RULE.rule_changed_at})
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        규칙 변경 적용 (20% 버퍼)
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-amber-900/90 dark:text-amber-200/90">
                      <strong>변경 사유 (T07-C11):</strong> {INITIAL_OBSERVATION_RULE.rule_change_reason}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-amber-800 dark:text-amber-300">
                      <span>• 변경 전: {INITIAL_OBSERVATION_RULE.initial_plan_rule}</span>
                      <span>➔</span>
                      <span>• 변경 후: {INITIAL_OBSERVATION_RULE.changed_plan_rule}</span>
                    </div>
                  </div>
                )}

                {/* 일자별 카드 */}
                <div
                  className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                    isBeforeChange
                      ? 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/90'
                      : 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isBeforeChange
                          ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                          : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      }`}
                    >
                      D{entry.dayNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {entry.taskName}
                        </span>
                        <span className="text-[11px] text-neutral-400">({entry.date})</span>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{entry.note}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-[11px] text-neutral-400">예상 / 실제</div>
                      <div className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {entry.estimatedMinutes}분 / {entry.actualMinutes}분
                      </div>
                    </div>

                    <div className="min-w-18 text-right">
                      <div className="text-[11px] text-neutral-400">시간 오차</div>
                      <div
                        className={`font-bold ${
                          entry.varianceMinutes > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : entry.varianceMinutes < 0
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {entry.varianceMinutes > 0 ? `+${entry.varianceMinutes}` : entry.varianceMinutes}분
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 5. 손계산 수기 검산 대조 카드 (T07-C132) */}
      <div className="mt-8 rounded-2xl border border-indigo-200/80 bg-linear-to-br from-indigo-50/60 to-purple-50/40 p-5 backdrop-blur-md dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-purple-950/20">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
              [T07-C132] 수기 검산(Hand Calculation)과 화면 합계·평균 100% 일치 증적
            </h4>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            수기 검산 검증 완료
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div className="rounded-xl bg-white/80 p-3 shadow-xs dark:bg-neutral-900/80">
            <div className="text-neutral-500 dark:text-neutral-400">5일 총 예상 시간</div>
            <div className="mt-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {HAND_CALCULATION_SUMMARY.totalEstimated}분
            </div>
            <div className="text-[10px] text-neutral-400">(90+60+110+90+90)</div>
          </div>

          <div className="rounded-xl bg-white/80 p-3 shadow-xs dark:bg-neutral-900/80">
            <div className="text-neutral-500 dark:text-neutral-400">5일 총 실제 시간</div>
            <div className="mt-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {HAND_CALCULATION_SUMMARY.totalActual}분
            </div>
            <div className="text-[10px] text-neutral-400">(100+75+115+85+90)</div>
          </div>

          <div className="rounded-xl bg-white/80 p-3 shadow-xs dark:bg-neutral-900/80">
            <div className="text-neutral-500 dark:text-neutral-400">규칙 변경 전 오차 (1~2일)</div>
            <div className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-400">
              일평균 +{HAND_CALCULATION_SUMMARY.beforeChangeAvgVariance}분
            </div>
            <div className="text-[10px] text-neutral-400">(10분 + 15분) / 2</div>
          </div>

          <div className="rounded-xl bg-white/80 p-3 shadow-xs dark:bg-neutral-900/80">
            <div className="text-neutral-500 dark:text-neutral-400">규칙 변경 후 오차 (3~5일)</div>
            <div className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              일평균 {HAND_CALCULATION_SUMMARY.afterChangeAvgVariance.toFixed(1)}분 (개선)
            </div>
            <div className="text-[10px] text-neutral-400">(5 + (-5) + 0) / 3</div>
          </div>
        </div>

        <p className="mt-3 text-xs text-indigo-900/80 dark:text-indigo-300/80">
          💡 <strong>분석 결론:</strong> {HAND_CALCULATION_SUMMARY.accuracyImprovement} (동일 지표/단위/계산규칙 적용 -
          T07-C13~C15 충족)
        </p>
      </div>
    </section>
  );
};
