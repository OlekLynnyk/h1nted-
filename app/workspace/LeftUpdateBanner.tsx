'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';

interface LeftUpdateBannerProps {
  sidebarWidth: number;
  visible: boolean;
  onClose: () => void;
}

export function LeftUpdateBanner({ sidebarWidth, visible, onClose }: LeftUpdateBannerProps) {
  const baseSidebarWidth = Math.max(sidebarWidth || 0, 260);

  const bannerWidth = Math.round(baseSidebarWidth * 1.15);
  const bannerHeight = 75;

  return (
    <motion.aside
      aria-hidden={!visible}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.25 }}
      className="
        hidden md:block
        pointer-events-none
        fixed
        z-30
      "
      style={{
        top: 24,
        left: sidebarWidth + 24,
        width: bannerWidth,
        height: bannerHeight,
      }}
    >
      <div
        className="
          group
          relative
          h-full w-full
          pointer-events-auto
          rounded-3xl
          bg-[var(--background)]/90
          border border-[var(--card-border)]
          shadow-2xl
          overflow-hidden
        "
      >
        <Image
          src="/images/workspace-update-horizontal.png"
          alt="Workspace updates"
          fill
          priority={false}
          className="object-cover"
        />

        <div
          className="
            absolute top-2 right-2
            flex items-center gap-2
            opacity-0 group-hover:opacity-100
            transition-opacity
          "
        >
          <span
            className="
              hidden sm:inline-flex items-center
              rounded-full px-3 py-1
              bg-[var(--background)]
              border border-[var(--card-border)]
              text-[var(--text-secondary)]
              text-[10px]
              font-monoBrand tracking-[0.14em] uppercase
            "
          >
            Latest updated
          </span>

          <button
            type="button"
            aria-label="Close updates"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="
              inline-flex items-center justify-center
              h-7 w-7
              rounded-full
              bg-[var(--background)]
              border border-[var(--card-border)]
              text-[var(--text-secondary)]
              transition
              hover:bg-[var(--surface)]
            "
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
