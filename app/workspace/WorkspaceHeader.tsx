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
          id="ws-save-btn"
          onClick={onSaveProfiling}
          disabled={disableSaveProfiling}
          type="button"
          className={`hidden md:flex items-center gap-1 text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)] ${
            disableSaveProfiling ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <Upload size={14} className="text-[var(--text-primary)]" />
          <span className="text-[var(--text-primary)]">Save</span>
        </button>

        <button
          type="button"
          onClick={onSaveProfiling}
          disabled={disableSaveProfiling}
          aria-label="Save"
          className={`md:hidden group flex items-center justify-center rounded-full transition ${
            disableSaveProfiling ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <span
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full
              bg-[var(--background)]
              shadow-sm
              group-hover:bg-[var(--surface)]
              group-hover:shadow-md
              transition
            "
          >
            <Upload className="w-4 h-4 text-[var(--text-primary)] opacity-80" />
          </span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Go home"
          className="group flex items-center justify-center rounded-full transition"
        >
          <span
            className="
            flex h-8 w-8 items-center justify-center
            rounded-full
            bg-[var(--background)]
            shadow-sm
            group-hover:bg-[var(--surface)]
            group-hover:shadow-md
            transition
          "
          >
            <Home className="w-4 h-4 text-[var(--text-primary)] opacity-80" />
          </span>
        </button>
      </div>
    </header>
  );
}
