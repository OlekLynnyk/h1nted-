'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
      className="fixed w-full flex justify-center px-2 sm:px-4 z-40 pointer-events-none"
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
            group
            relative
            w-full max-w-2xl
            pointer-events-auto
            rounded-3xl
            bg-[var(--background)]/90
            border border-[var(--card-border)]
            shadow-2xl
            overflow-hidden
            text-[var(--text-primary)]
          "
        >
          {/* Background image like banners */}
          <Image
            src="/images/daily-limit.png"
            alt="Daily limit"
            fill
            priority={false}
            className="object-cover"
          />
          {/* Soft overlay for readability (style only) */}
          <div className="absolute inset-0 bg-[var(--background)]/55" />

          <div
            className="
              relative
              flex flex-col md:flex-row md:items-center md:justify-between
              gap-2 md:gap-3
              px-4 py-2 md:py-[6px]
              text-[11px]
              font-monoBrand tracking-[0.14em] uppercase
              text-[var(--text-primary)]
            "
          >
            <span className="whitespace-normal md:whitespace-nowrap text-center md:text-left">
              Daily limit reached: {used}/{limit}
              {dailyResetsAtLabel ? ` • Resets at ${dailyResetsAtLabel}` : ''}
            </span>

            <div className="flex gap-2 md:items-center w-full md:w-auto justify-center md:justify-end">
              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss daily limit banner"
                className="
                  inline-flex items-center justify-center
                  w-full md:w-auto
                  min-w-[95px]
                  min-h-[44px] md:min-h-[36px]
                  px-4 md:px-3 py-2 md:py-1.5
                  rounded-full
                  bg-[var(--background)]
                  border border-[var(--card-border)]
                  text-[var(--text-secondary)]
                  transition
                  hover:bg-[var(--surface)]
                  font-monoBrand tracking-[0.14em] uppercase text-[11px]
                "
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
