'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';

interface RightPromoBannerProps {
  sidebarWidth: number;
  visible: boolean;
  onClose: () => void;
}

export function RightPromoBanner({ sidebarWidth, visible, onClose }: RightPromoBannerProps) {
  const baseSidebarWidth = Math.max(sidebarWidth || 0, 260);
  const bannerWidth = Math.round(baseSidebarWidth * 0.66);

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
        top: 88,
        bottom: 32,
        right: 24,
        width: bannerWidth,
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
          src="/images/workspace-promo-vertical.png"
          alt="Workspace promo"
          fill
          priority={false}
          className="object-cover"
        />

        <button
          type="button"
          aria-label="Close promo"
          onClick={onClose}
          className="
            absolute top-2 right-2
            inline-flex items-center justify-center
            h-7 w-7
            rounded-full
            bg-[var(--background)]
            border border-[var(--card-border)]
            text-[var(--text-secondary)]
            opacity-0 group-hover:opacity-100
            transition
            hover:bg-[var(--surface)]
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.aside>
  );
}
