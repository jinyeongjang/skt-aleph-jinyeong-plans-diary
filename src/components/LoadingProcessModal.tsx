import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export interface LoadingStep {
  id: string;
  label: string;
  desc: string;
}

export interface LoadingProcessModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  theme?: 'indigo' | 'emerald';
  progress: number;
  currentStepIndex: number;
  steps: LoadingStep[];
}

export const LoadingProcessModal: React.FC<LoadingProcessModalProps> = ({
  isOpen,
  title,
  subtitle,
  theme = 'indigo',
  progress,
  currentStepIndex,
  steps,
}) => {
  if (!isOpen) return null;

  const isEmerald = theme === 'emerald';

  const gradientBar = isEmerald
    ? 'from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/40'
    : 'from-indigo-500 via-violet-500 to-purple-600 shadow-indigo-500/40';

  const iconGlow = isEmerald
    ? 'border-emerald-500/30 bg-emerald-50 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-950/50 dark:text-emerald-400'
    : 'border-indigo-500/30 bg-indigo-50 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-950/50 dark:text-indigo-400';

  const trackBg = isEmerald ? 'bg-emerald-100 dark:bg-emerald-950/60' : 'bg-indigo-100 dark:bg-indigo-950/60';

  const percentText = isEmerald ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-process-title"
      className="animate-in fade-in fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/70 p-4 duration-200 sm:p-6"
    >
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-2xl transition-all duration-300 dark:border-neutral-800/90 dark:bg-neutral-900">
        {/* 상단 엣지 프로그레스 바 */}
        <div
          className={`absolute top-0 left-0 z-20 h-1.5 bg-gradient-to-r shadow-xs transition-all duration-300 ease-out ${gradientBar}`}
          style={{ width: `${progress}%` }}
        />

        {/* 상단 림라이트 */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          aria-hidden="true"
        />

        {/* 메인 헤더 & 애니메이션 인디케이터 */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`relative mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-inner ${iconGlow}`}
          >
            {progress >= 100 ? (
              <CheckCircle2 className="animate-in zoom-in-75 h-7 w-7 text-emerald-500 duration-200" />
            ) : (
              <Loader2 className="h-7 w-7 animate-spin" />
            )}
            <span
              className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${
                progress >= 100 ? 'bg-emerald-500' : isEmerald ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
            >
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
            </span>
          </div>

          <h3
            id="loading-process-title"
            className="text-base font-bold tracking-tight text-neutral-900 sm:text-lg dark:text-neutral-100"
          >
            {title}
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>

          {/* 중앙 퍼센트 & 프로그레스 바 */}
          <div className="mt-5 w-full">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-600 dark:text-neutral-400">진행률</span>
              <span className={`font-mono text-sm font-extrabold ${percentText}`}>{progress}%</span>
            </div>
            <div className={`mt-2 h-2 w-full overflow-hidden rounded-full ${trackBg}`}>
              <div
                className={`h-full rounded-full bg-gradient-to-r shadow-xs transition-all duration-300 ease-out ${gradientBar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 단계별 체크리스트 타임라인 */}
        <div className="mt-6 space-y-2.5 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/50">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || progress >= 100;
            const isCurrent = idx === currentStepIndex && progress < 100;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 rounded-xl p-2 transition-colors ${
                  isCurrent
                    ? isEmerald
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40'
                      : 'bg-indigo-50/80 dark:bg-indigo-950/40'
                    : isCompleted
                      ? 'bg-white/60 dark:bg-neutral-900/40'
                      : 'opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2
                      className={`h-4 w-4 animate-spin ${
                        isEmerald ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    />
                  ) : (
                    <Circle className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? isEmerald
                            ? 'text-emerald-900 dark:text-emerald-200'
                            : 'text-indigo-900 dark:text-indigo-200'
                          : isCompleted
                            ? 'text-neutral-800 dark:text-neutral-200'
                            : 'text-neutral-500 dark:text-neutral-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        완료
                      </span>
                    )}
                    {isCurrent && (
                      <span
                        className={`font-mono text-[10px] font-bold ${
                          isEmerald ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        진행 중...
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
};
