'use client';

import React from 'react';
import { Menu, Upload, Home } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOffset?: number;

  onLogout: () => void;
  onSaveProfiling: () => void;
  disableSaveProfiling?: boolean;
}

export default function NewHeader({
  onToggleSidebar,
  sidebarOffset = 0,
  onLogout,
  onSaveProfiling,
  disableSaveProfiling,
}: HeaderProps) {
  return (
    <header
      data-header-root
      className="fixed top-0 right-0 z-30 h-14 flex items-center justify-between px-3 md:px-6"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        left: sidebarOffset,
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--card-border)]
                     hover:bg-[var(--button-hover-bg)] transition md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4 text-[var(--text-primary)]" />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs md:text-sm font-monoBrand tracking-[0.22em] uppercase text-[var(--text-secondary)]"></span>
        </div>

        <div className="md:hidden">
          <span className="text-xs font-monoBrand tracking-[0.22em] uppercase text-[var(--text-secondary)]"></span>
        </div>
      </div>

      <div className="hidden md:block text-sm font-monoBrand text-[var(--text-primary)]"></div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          aria-label="Go home"
          className="group flex items-center justify-center rounded-full transition"
        >
          <span
            className="
           flex h-8 w-20 items-center justify-center
           rounded-full
           bg-[var(--background)]
           shadow-sm
           group-hover:bg-[var(--surface)]
           group-hover:shadow-md
           transition
          "
          >
            <span className="text-[var(--text-primary)] opacity-80 text-xs font-monoBrand tracking-[0.22em] uppercase">
              H1NTED
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
