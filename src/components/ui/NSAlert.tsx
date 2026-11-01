'use client';

import React, { useState, useEffect } from 'react';
import { Music2, AlertTriangle, Info } from 'lucide-react';

export interface NSAlertProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string; // Dòng tóm tắt in đậm (messageText)
  informativeText?: string; // Đoạn giải thích nhỏ hơn (informativeText)
  primaryButtonText?: string; // Nút mặc định trả lời phím Return
  cancelButtonText?: string; // Nút Cancel trả lời phím Escape
  showsSuppressionButton?: boolean; // Hiển thị checkbox "Don't ask me again"
  suppressionButtonText?: string;
  onConfirm: (suppressionState: boolean) => void;
  alertStyle?: 'informational' | 'warning' | 'critical';
}

export default function NSAlert({
  isOpen,
  onClose,
  messageText,
  informativeText,
  primaryButtonText = 'Đồng ý',
  cancelButtonText = 'Hủy',
  showsSuppressionButton = true,
  suppressionButtonText = "Không hỏi lại lần sau (Don't ask me again)",
  onConfirm,
  alertStyle = 'informational',
}: NSAlertProps) {
  // Trạng thái của suppressionButton.state
  const [isSuppressed, setIsSuppressed] = useState(false);

  // Lắng nghe phím Return (Enter) và Escape theo đúng chuẩn macOS
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm(isSuppressed);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSuppressed, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-message-text"
      aria-describedby="alert-informative-text"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-[#1b132d]/95 border border-purple-800/40 shadow-2xl shadow-purple-950/80 p-6 space-y-5 animate-in zoom-in-95 duration-150 text-white select-none">
        {/* Header với Icon & Nội dung thông báo */}
        <div className="flex items-start gap-4">
          {/* App / Alert Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
            {alertStyle === 'warning' || alertStyle === 'critical' ? (
              <AlertTriangle className="w-6 h-6 text-white" />
            ) : (
              <Music2 className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* messageText: Bold summary line */}
            <h3 id="alert-message-text" className="text-sm sm:text-base font-bold text-white leading-snug">
              {messageText}
            </h3>

            {/* informativeText: Smaller explanation */}
            {informativeText && (
              <p id="alert-informative-text" className="text-xs text-zinc-300 leading-relaxed">
                {informativeText}
              </p>
            )}
          </div>
        </div>

        {/* showsSuppressionButton: Checkbox "Don't ask me again" */}
        {showsSuppressionButton && (
          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSuppressed}
                onChange={(e) => setIsSuppressed(e.target.checked)}
                className="w-4 h-4 rounded border-purple-900 bg-purple-950/40 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[11px] leading-tight">{suppressionButtonText}</span>
            </label>
          </div>
        )}

        {/* Buttons (addButton withTitle): macOS Button Strip */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {/* Cancel button: Answers Escape key */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.05] text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          >
            {cancelButtonText}
          </button>

          {/* Primary default button: Answers Return / Enter key */}
          <button
            type="button"
            onClick={() => onConfirm(isSuppressed)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

