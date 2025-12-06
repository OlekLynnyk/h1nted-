'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type DayLimitModalProps = {
  show: boolean;
  onClose: () => void;
  used: number;
  limit: number;
  dailyResetsAtLabel?: string;
  offsetFromBottomPx?: number;
  sidebarOffset?: number;
};

export default function DayLimitModal({
  show,
  onClose,
  used,
  limit,
  dailyResetsAtLabel,
  offsetFromBottomPx = 145,
  sidebarOffset = 0,
}: DayLimitModalProps) {
  useEffect(() => {
    if (!show) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed w-full flex justify-center px-2 sm:px-4 z-40"
      style={{
        left: sidebarOffset,
        width: `calc(100% - ${sidebarOffset}px)`,
        bottom: `calc(${offsetFromBottomPx}px + env(safe-area-inset-bottom, 0px))`,
      }}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="daily-compact"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="
            w-full max-w-2xl rounded-2xl border border-gray-300 shadow-2xl shadow-gray-400/20
            overflow-hidden
            bg-gradient-to-br from-black via-gray-900 to-black
            text-[var(--text-primary)]
          "
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 px-4 py-2 md:py-[6px] text-[11px] font-monoBrand tracking-[0.14em] uppercase text-white">
            <span className="whitespace-normal md:whitespace-nowrap text-center md:text-left">
              Daily limit reached: {used}/{limit}
              {dailyResetsAtLabel ? ` • Resets at ${dailyResetsAtLabel}` : ''}
            </span>
            <div className="flex gap-2 md:items-center w-full md:w-auto justify-center md:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md w-full md:w-auto min-w-[95px] min-h-[44px] md:min-h-[36px] md:px-3 md:py-1.5 font-monoBrand tracking-[0.14em] uppercase text-[11px]"
                aria-label="Dismiss daily limit banner"
              >
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
