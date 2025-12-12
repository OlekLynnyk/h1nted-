'use client';

import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface BottomPlanBannerProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export function BottomPlanBanner({ onClose, onUpgrade }: BottomPlanBannerProps) {
  return (
    <div
      className="
        group
        relative
        h-[72px] w-full
        rounded-3xl
        bg-[var(--background)]/90
        border border-[var(--card-border)]
        shadow-2xl
        overflow-hidden
        flex items-center
      "
    >
      <Image src="/images/plan-footer-banner.png" alt="Plan banner" fill className="object-cover" />

      <div className="relative flex items-center gap-3 px-3 w-full h-full">
        <div className="flex flex-col min-w-0 pr-24">
          <span className="text-xs text-[var(--text-primary)] leading-tight whitespace-nowrap truncate">
            H1NTED Premium
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] leading-tight whitespace-nowrap truncate">
            Unlock extended capabilities
          </span>
        </div>

        <button
          type="button"
          aria-label="Upgrade"
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade();
          }}
          className="
            absolute bottom-2 right-2
            inline-flex items-center justify-center
            h-7 px-3
            rounded-full
            bg-[var(--background)]
            border border-[var(--card-border)]
            text-[var(--text-secondary)]
            transition
            hover:bg-[var(--surface)]
            text-[10px]
            font-monoBrand
            tracking-[0.14em]
            uppercase
          "
        >
          Upgrade
        </button>
      </div>

      <button
        type="button"
        aria-label="Close banner"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="
          absolute top-1 right-2
          inline-flex items-center justify-center
          h-6 w-6
          rounded-full
          bg-[var(--background)]
          border border-[var(--card-border)]
          text-[var(--text-secondary)]
          transition
          hover:bg-[var(--surface)]
          opacity-100
          md:opacity-0 md:group-hover:opacity-100
        "
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
