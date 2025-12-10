'use client';

import React, { useRef } from 'react';

export type AnalysisHistoryItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  createdAt: string | number | Date;
  isActive?: boolean;
};

interface AnalysisHistoryPanelProps {
  items: AnalysisHistoryItem[];
  activeId: string | null;
  onSelect?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
}

export default function AnalysisHistoryPanel({
  items,
  activeId,
  onSelect,
}: AnalysisHistoryPanelProps) {
  const hasItems = items && items.length > 0;
  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ top: delta, behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="Analysis history"
      className="
        hidden md:flex
        fixed
        right-4
        top-[72px]
        bottom-[72px]
        z-30
        w-[96px]
        flex-col items-center
        rounded-3xl
        bg-[var(--background)]
        px-3 py-4
        select-none
      "
    >
      <div className="w-full mb-3 flex items-center justify-center">
        <div className="h-[3px] w-8 rounded-full bg-[var(--surface-secondary)]/40" />
      </div>

      <div className="flex-1 w-full flex flex-col items-center min-h-0">
        {hasItems && (
          <button
            type="button"
            onClick={() => scrollBy(-80)}
            aria-label="Scroll history up"
            className="
              mb-2
              inline-flex items-center justify-center
              h-6 w-6
              rounded-full
              text-[var(--text-secondary)]
              text-[10px]
              opacity-70
              hover:opacity-100
              hover:bg-[var(--card-bg)]
              transition
            "
          >
            ↑
          </button>
        )}

        <div className="relative flex-1 w-full min-h-0">
          <LinesBackground />
          {hasItems && (
            <>
              <div
                className="
              pointer-events-none
              absolute inset-x-0 top-0 h-10
              bg-gradient-to-b
              from-[var(--background)]
              to-transparent
              z-20
            "
              />

              <div
                className="
              pointer-events-none
              absolute inset-x-0 bottom-0 h-10
              bg-gradient-to-t
              from-[var(--background)]
              to-transparent
              z-20
            "
              />
            </>
          )}

          {!hasItems ? null : (
            <div
              ref={listRef}
              className="
                relative
                flex flex-col items-center gap-3
                h-full
                overflow-x-hidden
                overflow-y-auto
                pr-1
                no-scrollbar
              "
            >
              {items.map((item) => (
                <PreviewCard
                  key={item.id}
                  item={item}
                  active={item.id === activeId}
                  onClick={() => onSelect?.(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {hasItems && (
          <button
            type="button"
            onClick={() => scrollBy(80)}
            aria-label="Scroll history down"
            className="
              mt-2
              inline-flex items-center justify-center
              h-6 w-6
              rounded-full
              text-[var(--text-secondary)]
              text-[10px]
              opacity-70
              hover:opacity-100
              hover:bg-[var(--card-bg)]
              transition
            "
          >
            ↓
          </button>
        )}
      </div>

      <div className="mt-3 text-center">
        <p className="text-[9px] font-monoBrand tracking-[0.18em] uppercase text-[var(--text-secondary)]/70">
          History
        </p>
      </div>
    </aside>
  );
}

function PreviewCard({
  item,
  active,
  onClick,
}: {
  item: AnalysisHistoryItem;
  active: boolean;
  onClick: () => void;
}) {
  const createdTs = new Date(item.createdAt).getTime();
  const twelveHoursMs = 1000 * 60 * 60 * 12;
  const isExpired =
    Number.isFinite(createdTs) &&
    !Number.isNaN(createdTs) &&
    Date.now() - createdTs > twelveHoursMs;

  const hasLiveImage = !!item.imageUrl && !isExpired;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        w-full
        relative z-10
        transition-transform duration-200
        ${active ? 'scale-[1.12]' : 'scale-100'}
      `}
    >
      <div
        className="
          aspect-square
          w-full
          rounded-2xl
          overflow-hidden
          bg-[var(--card-bg)]
          border border-[var(--card-border)]
          shadow-sm
          group-hover:shadow-md
          group-hover:border-[var(--surface-secondary)]
          transition
          flex flex-col
        "
      >
        <div
          className="
            px-2 pt-1 pb-1.5
            text-[8px]
            font-monoBrand
            tracking-[0.14em]
            uppercase
            text-[var(--text-secondary)]
            bg-[var(--background)]/60
            truncate
          "
        >
          {item.title}
        </div>

        <div className="flex-1">
          {hasLiveImage ? (
            <img
              src={item.imageUrl as string}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : isExpired ? (
            <ExpiredPlaceholderImage />
          ) : (
            <PlaceholderImage />
          )}
        </div>
      </div>
    </button>
  );
}

function PlaceholderImage() {
  return (
    <div
      className="
        w-full h-full
        flex items-center justify-center
        bg-[var(--surface-secondary)]/20
        text-[var(--text-secondary)]
        font-monoBrand
        text-[9px]
        tracking-[0.12em]
        uppercase
      "
    >
      No image
    </div>
  );
}

function ExpiredPlaceholderImage() {
  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(15,23,42,0.9)',
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(148,163,253,0.32), transparent 55%), radial-gradient(circle at 100% 100%, rgba(236,72,153,0.32), transparent 55%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.75))',
        }}
      />
    </div>
  );
}

function LinesBackground() {
  return (
    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[var(--surface-secondary)]/30 rounded-full pointer-events-none">
      {Array.from({ length: 16 }).map((_, idx) => {
        const isLong = idx % 3 === 0;
        const offset = (idx / 15) * 100;

        return (
          <div
            key={idx}
            className="
              absolute
              -translate-x-1/2
              bg-[var(--surface-secondary)]
              rounded-full
              opacity-70
            "
            style={{
              top: `${offset}%`,
              width: isLong ? '18px' : '11px',
              height: '1.5px',
              left: '50%',
            }}
          />
        );
      })}
    </div>
  );
}
