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

const PLACEHOLDER_IMAGES = [
  '/images/history/01.png',
  '/images/history/02.png',
  '/images/history/03.png',
  '/images/history/04.png',
  '/images/history/05.png',
  '/images/history/06.png',
  '/images/history/07.png',
  '/images/history/08.png',
  '/images/history/09.png',
  '/images/history/10.png',
  '/images/history/11.png',
  '/images/history/12.png',
  '/images/history/13.png',
  '/images/history/14.png',
  '/images/history/15.png',
  '/images/history/16.png',
  '/images/history/17.png',
  '/images/history/18.png',
  '/images/history/19.png',
  '/images/history/20.png',
];

export default function AnalysisHistoryPanel({
  items,
  activeId,
  onSelect,
}: AnalysisHistoryPanelProps) {
  const hasItems = items && items.length > 0;
  const listRef = useRef<HTMLDivElement | null>(null);

  const placeholderMapRef = useRef<Record<string, number>>({});

  const getPlaceholderIndex = (itemId: string, prevIndex: number | null): number => {
    const map = placeholderMapRef.current;
    const existing = map[itemId];
    const max = PLACEHOLDER_IMAGES.length;

    if (typeof existing === 'number') {
      if (existing !== prevIndex) return existing;
    }

    let idx = Math.floor(Math.random() * max);
    if (idx === prevIndex) {
      idx = (idx + 1) % max;
    }

    map[itemId] = idx;
    return idx;
  };

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
        z-90
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
              {(() => {
                let prevIndex: number | null = null;

                return items.map((item) => {
                  const placeholderIndex = getPlaceholderIndex(item.id, prevIndex);
                  prevIndex = placeholderIndex;

                  return (
                    <PreviewCard
                      key={item.id}
                      item={item}
                      active={item.id === activeId}
                      placeholderSrc={PLACEHOLDER_IMAGES[placeholderIndex]}
                      onClick={() => onSelect?.(item.id)}
                    />
                  );
                });
              })()}
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
  placeholderSrc,
}: {
  item: AnalysisHistoryItem;
  active: boolean;
  onClick: () => void;
  placeholderSrc: string;
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
          relative
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
         "
      >
        {hasLiveImage ? (
          <img
            src={item.imageUrl as string}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0">
            <PlaceholderImage src={placeholderSrc} dimmed={isExpired} />
          </div>
        )}

        <div
          className="
            absolute inset-x-0 bottom-0
            px-2 py-0.75
            text-[8px]
            font-monoBrand
            tracking-[0.14em]
            uppercase
            text-[var(--text-primary)]
            truncate
            bg-[var(--background)]/20
            backdrop-blur-md
           "
          title={item.title}
        >
          {item.title}
        </div>
      </div>
    </button>
  );
}

function PlaceholderImage({ src, dimmed }: { src: string; dimmed?: boolean }) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img src={src} alt="" className="w-full h-full object-cover" />
    </div>
  );
}

function LinesBackground() {
  return (
    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[var(--surface-secondary)]/30 rounded-full pointer-events-none">
      {Array.from({ length: 16 }).map((_, idx) => {
        if (idx === 15) return null;
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
