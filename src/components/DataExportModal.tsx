import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Copy, Check, FileJson, RefreshCw } from 'lucide-react';
import type { PdsFullDataExport } from '../types/pds.ts';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportData: PdsFullDataExport | null;
  onResetToSeed: () => void;
}

export const DataExportModal: React.FC<DataExportModalProps> = ({ isOpen, onClose, exportData, onResetToSeed }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !exportData) return null;

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pds-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/60 p-4 duration-200 sm:p-6"
    >
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:border-neutral-800/90 dark:bg-neutral-900 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
        {/* Top Rimlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-neutral-200/80 px-6 py-5 dark:border-neutral-800/80">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-50 text-blue-600 dark:border-blue-400/30 dark:bg-blue-950/50 dark:text-blue-400">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
                  전체 자료 내보내기
                </h2>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  T06-C36
                </span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                계획·할 일·실행 기록·돌아보기 데이터를 단일 JSON 파일로 백업합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover-lift active-press flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar space-y-4 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
              <span className="block text-xs font-semibold text-neutral-500">계획</span>
              <strong className="mt-1 block text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {exportData.plans.length}건
              </strong>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
              <span className="block text-xs font-semibold text-neutral-500">할 일</span>
              <strong className="mt-1 block text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {exportData.todos.length}건
              </strong>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
              <span className="block text-xs font-semibold text-neutral-500">실행 기록</span>
              <strong className="mt-1 block text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {exportData.executionLogs.length}건
              </strong>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/60">
              <span className="block text-xs font-semibold text-neutral-500">수정 이력</span>
              <strong className="mt-1 block text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {exportData.planRevisions.length}건
              </strong>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold">내보낼 JSON 데이터 미리보기</span>
              <span className="font-mono">{jsonString.length.toLocaleString()} bytes</span>
            </div>
            <pre className="custom-scrollbar max-h-56 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 font-mono text-xs text-neutral-300 shadow-inner">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-100/80 px-6 py-4 sm:flex-row dark:border-neutral-800/80">
          <button
            type="button"
            onClick={() => {
              if (confirm('초기 테스트 데이터셋으로 초기화하시겠습니까?')) {
                onResetToSeed();
                onClose();
              }
            }}
            className="hover-lift active-press inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-50/40 px-3.5 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100/70 sm:w-auto dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>기본 데이터로 초기화</span>
          </button>

          <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-2.5 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? '복사 완료' : '클립보드 복사'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-indigo-500"
            >
              <Download className="h-3.5 w-3.5" />
              <span>파일로 다운로드 (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
