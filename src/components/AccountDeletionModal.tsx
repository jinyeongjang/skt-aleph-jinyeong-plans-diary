import React, { useState } from 'react';
import { UserX, AlertTriangle, X, Trash2 } from 'lucide-react';
import { deleteUserAccount } from '../services/authService.ts';
import { cascadeDeleteUserData } from '../services/pdsService.ts';

interface AccountDeletionModalProps {
  isOpen: boolean;
  userId: string;
  userEmail: string;
  onClose: () => void;
  onDeleted: () => void;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  isOpen,
  userId,
  userEmail,
  onClose,
  onDeleted,
}) => {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmation !== userEmail) return;
    setIsDeleting(true);
    try {
      await cascadeDeleteUserData(userId);
      deleteUserAccount(userId);
      onDeleted();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/60 dark:bg-neutral-900">
        {/* Top Rimlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-rose-400/40 to-transparent dark:via-rose-500/20"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">계정 탈퇴 및 데이터 삭제</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">T07-C134 계정 및 데이터 연쇄 삭제</p>
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

        <div className="mt-4 rounded-2xl border border-rose-200/80 bg-rose-50/70 p-4 dark:border-rose-900/40 dark:bg-rose-950/30">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-200">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>[T07-C134] 연쇄 삭제 안내 필수 고지</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-rose-800 dark:text-rose-300">
            "내 계정을 지우면 소속된 모든 계획(plans), 수정 이력(revisions), 할 일(todos), 실행 기록(execution_logs),
            회고(reviews) 데이터가 영구적으로 함께 연쇄 삭제(Cascade Delete)됩니다."
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            확인을 위해 본인 이메일 (<span className="font-mono text-indigo-600 dark:text-indigo-400">{userEmail}</span>
            )을 정확히 입력해 주세요:
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={userEmail}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs transition outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="hover-lift active-press cursor-pointer rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={confirmation !== userEmail || isDeleting}
            className="hover-lift active-press inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-700 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? '삭제 처리 중...' : '계정 영구 삭제'}
          </button>
        </div>
      </div>
    </div>
  );
};
