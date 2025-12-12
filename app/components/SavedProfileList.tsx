'use client';

import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { useSavedProfiles, SavedProfile, SavedBlockName } from '@/app/hooks/useSavedProfiles';
import SaveProfileModal from '@/app/components/SaveProfileModal';

type SavedProfileListProps = {
  showCreateBlockButton?: boolean;
};

const SYSTEM_BLOCKS = ['Universal Archive', 'CDRs'];
const UNGROUPED_ID = '__ungrouped__' as const;
const MAX_CUSTOM_BLOCKS = 15;
const MAX_BLOCK_NAME_LEN = 30;

const REFRESH_DEBOUNCE_MS = 200;
const equalStringArrays = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

function useTapToggle({
  onTap,
  thresh = 6,
  cooldownMs = 180,
}: {
  onTap: () => void;
  thresh?: number;
  cooldownMs?: number;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const lastAt = useRef(0);

  const cleanup = () => {
    window.removeEventListener('pointerup', handleUp, true);
    window.removeEventListener('pointercancel', handleCancel, true);
    start.current = null;
  };

  const handleUp = (e: PointerEvent) => {
    if (!start.current) return cleanup();

    const dx = Math.abs(e.clientX - start.current.x);
    const dy = Math.abs(e.clientY - start.current.y);
    const now = performance.now();

    cleanup();

    if (typeof window.getSelection === 'function' && window.getSelection()?.toString()) return;

    const target = e.target as HTMLElement | null;
    if (target && target.closest('[data-interactive="true"]')) return;

    if (dx > thresh || dy > thresh) return;
    if (now - lastAt.current < cooldownMs) return;

    lastAt.current = now;
    onTap();
  };

  const handleCancel = () => cleanup();

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    start.current = { x: e.clientX, y: e.clientY };
    window.addEventListener('pointerup', handleUp, true);
    window.addEventListener('pointercancel', handleCancel, true);
  };

  const onPointerMove = () => {};
  const onPointerUp = (e: any) => {
    e.stopPropagation();
  };

  const onKeyDown = (e: any) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const now = performance.now();
      if (now - lastAt.current < cooldownMs) return;
      lastAt.current = now;
      onTap();
    }
    if (e.key === 'Escape') e.stopPropagation();
  };

  return { onPointerDown, onPointerMove, onPointerUp, onKeyDown };
}

type SectionHeaderProps = {
  title: string;
  id: string;
  expanded: boolean;
  onToggle: (id: string) => void;
};

const SectionHeader = memo(function SectionHeader({
  title,
  id,
  expanded,
  onToggle,
}: SectionHeaderProps) {
  const tap = useTapToggle({
    onTap: () => onToggle(id),
    thresh: 6,
    cooldownMs: 180,
  });

  const panelId = `saved-sec-${id}`;

  return (
    <div
      className="relative z-0 flex justify-between items-center px-3 py-1 cursor-pointer no-select leading-5 min-h-[24px] touch-manipulation"
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-controls={panelId}
      draggable={false}
      onPointerDown={tap.onPointerDown}
      onPointerUp={tap.onPointerUp}
      onKeyDown={tap.onKeyDown}
    >
      <span className="text-[11px] font-monoBrand tracking-[0.14em] uppercase text-[var(--text-secondary)]">
        {title}
      </span>
      <span className="text-[var(--text-secondary)] text-[8px] relative top-px pointer-events-none select-none">
        {expanded ? '▲' : '▼'}
      </span>
    </div>
  );
});

type RowProps = {
  profile: SavedProfile;
  onOpen: (p: SavedProfile) => void;
  onDelete: (id: string) => void;
};

const Row = memo(function Row({ profile, onOpen, onDelete }: RowProps) {
  const tap = useTapToggle({
    onTap: () => onOpen(profile),
    thresh: 6,
    cooldownMs: 180,
  });

  return (
    <div
      data-row
      role="button"
      tabIndex={0}
      aria-label={profile.profile_name}
      className="flex justify-between items-center px-3 py-1 cursor-pointer no-select leading-5 min-h-[24px] touch-manipulation"
      draggable={false}
      onPointerDown={tap.onPointerDown}
      onPointerUp={tap.onPointerUp}
      onKeyDown={tap.onKeyDown}
    >
      <span className="file-title no-select select-none text-[11px] font-monoBrand tracking-[0.14em] uppercase text-[var(--text-primary)]">
        {profile.profile_name}
      </span>

      <button
        type="button"
        data-interactive="true"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(profile.id);
        }}
        className="flex items-center justify-center w-6 h-6 rounded-full text-[var(--text-secondary)] hover:text-[var(--danger)] text-base"
        aria-label="Delete saved profile"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
});

export default function SavedProfileList({ showCreateBlockButton = false }: SavedProfileListProps) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { getSavedProfiles, deleteProfile, updateProfile, getFolders, createFolder, deleteFolder } =
    useSavedProfiles();

  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [folders, setFolders] = useState<SavedBlockName[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<SavedProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [UNGROUPED_ID]: false,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [createErr, setCreateErr] = useState<string | null>(null);

  const modalTopRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!createModalOpen) return;
    requestAnimationFrame(() => {
      modalTopRef.current?.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'smooth',
      });
    });
  }, [createModalOpen]);

  const groupedByFolder = useMemo(() => {
    const map = new Map<string, SavedProfile[]>();
    for (const p of profiles) {
      const f = (p.folder ?? '') as string;
      if (!f) continue;
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(p);
    }
    return map;
  }, [profiles]);

  const ungrouped = useMemo(() => profiles.filter((p) => !p.folder), [profiles]);

  const refresh = async () => {
    if (!userId) return;
    try {
      const [items, folderList] = await Promise.all([getSavedProfiles(userId), getFolders(userId)]);
      setProfiles(items);

      const ordered = Array.from(new Set(folderList)).filter((name) => name !== 'CDRs');

      setFolders((prev) => (equalStringArrays(prev, ordered) ? prev : ordered));

      setExpanded((prev) => {
        const next: Record<string, boolean> = { ...prev };
        for (const f of ordered) {
          if (typeof next[f] === 'undefined') next[f] = false;
        }
        if (typeof next[UNGROUPED_ID] === 'undefined') next[UNGROUPED_ID] = false;
        return next;
      });
    } catch (e) {
      console.error('Failed to fetch saved profiles/folders', e);
    }
  };

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [items, folderList] = await Promise.all([
          getSavedProfiles(userId),
          getFolders(userId),
        ]);
        if (!active) return;
        setProfiles(items);
        const ordered = Array.from(new Set(folderList)).filter((name) => name !== 'CDRs');
        setFolders(ordered);
        setExpanded((prev) => {
          const next: Record<string, boolean> = { ...prev };
          for (const f of ordered) {
            if (typeof next[f] === 'undefined') next[f] = false;
          }
          if (typeof next[UNGROUPED_ID] === 'undefined') next[UNGROUPED_ID] = false;
          return next;
        });
      } catch (e) {
        console.error('Failed to fetch saved profiles/folders', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const handler = () => setCreateModalOpen(true);
    window.addEventListener('savedMessages:createBlock', handler as EventListener);
    return () => window.removeEventListener('savedMessages:createBlock', handler as EventListener);
  }, []);

  const refreshRafRef = useRef<number | null>(null);
  const scheduleRefresh = () => {
    if (refreshRafRef.current) cancelAnimationFrame(refreshRafRef.current);
    refreshRafRef.current = requestAnimationFrame(() => {
      setTimeout(() => void refresh(), REFRESH_DEBOUNCE_MS);
    });
  };

  useEffect(() => {
    const onRefresh = () => scheduleRefresh();
    window.addEventListener('savedMessages:refresh', onRefresh as EventListener);
    return () => window.removeEventListener('savedMessages:refresh', onRefresh as EventListener);
  }, [userId]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this profile?');
    if (!confirmed) return;
    try {
      setSelectedProfile(null);
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete profile', error);
      alert('Failed to delete the profile. Please try again.');
    }
  };

  const handleUpdate = async (id: string, name: string, aiResponse: string, comments: string) => {
    try {
      await updateProfile(id, {
        profile_name: name,
        chat_json: {
          ai_response: aiResponse,
          user_comments: comments,
        },
      });
      setSelectedProfile(null);
      await refresh();
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update the profile. Please try again.');
    }
  };

  const handleCreateBlock = async () => {
    if (!userId) return;
    const name = newBlockName.trim();
    setCreateErr(null);

    const customCount = folders.length;
    if (customCount >= MAX_CUSTOM_BLOCKS) {
      setCreateErr(`You can create up to ${MAX_CUSTOM_BLOCKS} blocks.`);
      return;
    }
    if (!name) {
      setCreateErr('Block name cannot be empty.');
      return;
    }
    if (name.length > MAX_BLOCK_NAME_LEN) {
      setCreateErr(`Please use a shorter name (≤ ${MAX_BLOCK_NAME_LEN} characters).`);
      return;
    }
    if (name === UNGROUPED_ID) {
      setCreateErr('This block name is reserved.');
      return;
    }
    if (folders.includes(name)) {
      setCreateErr('This block name already exists.');
      return;
    }

    try {
      await createFolder(userId, name);
      const fs = await getFolders(userId);
      const nextOrdered = Array.from(new Set(fs));
      setFolders((prev) => (equalStringArrays(prev, nextOrdered) ? prev : nextOrdered));
      setNewBlockName('');
      setCreateModalOpen(false);
    } catch (err: any) {
      setCreateErr(err?.message || 'Failed to create the block.');
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (SYSTEM_BLOCKS.includes(folderName)) {
      return;
    }

    if (!userId) return;

    const confirmed = window.confirm(`Delete the empty block "${folderName}"?`);
    if (!confirmed) return;

    try {
      await deleteFolder(userId, folderName);
      setFolders((prev) => prev.filter((f) => f !== folderName));
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[folderName];
        return next;
      });
    } catch (e) {
      console.error('Failed to delete folder', e);
      alert('Failed to delete the block. It may not be empty.');
    }
  };

  const toggleExpanded = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <p className="font-monoBrand text-xs tracking-[0.14em] uppercase text-[var(--text-secondary)] opacity-80">
        LOADING SAVED REPORTS…
      </p>
    );
  }

  if (profiles.length === 0) {
    return (
      <p className="font-monoBrand text-xs tracking-[0.14em] uppercase text-[var(--text-secondary)] opacity-60">
        NO SAVED REPORTS YET.
      </p>
    );
  }

  return (
    <div
      className="relative flex flex-col gap-1 font-monoBrand"
      data-templates
      style={{ scrollbarGutter: 'stable both-edges' }}
    >
      <div ref={modalTopRef} />

      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-start justify-center"
          data-modal="open"
          data-interactive="true"
        >
          <div
            data-overlay
            data-interactive="true"
            className="absolute inset-0 bg-black/40"
            onPointerDown={() => {
              setCreateModalOpen(false);
              setNewBlockName('');
              setCreateErr(null);
            }}
          />
          <div
            className="
              relative z-10 w-full max-w-sm
              bg-[var(--card-bg)] text-[var(--text-primary)]
              border border-[var(--card-border)]
              rounded-2xl p-4 shadow-xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-medium mb-2">Create a new block</h3>
            <input
              autoFocus
              type="text"
              maxLength={MAX_BLOCK_NAME_LEN}
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              placeholder="Block name (up to 30 chars)"
              className="
                w-full rounded-lg px-3 py-2 text-base md:text-sm
                bg-[var(--surface)] text-[var(--text-primary)]
                focus:outline-none focus:ring-1 focus:ring-[var(--accent)]
              "
            />
            {createErr && <p className="mt-2 text-xs text-[var(--danger)]">{createErr}</p>}
            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  setNewBlockName('');
                  setCreateErr(null);
                }}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBlock}
                className="
                  h-8 px-3 rounded-full text-xs font-medium
                  bg-[var(--button-bg)] text-[var(--text-primary)]
                  hover:bg-[var(--button-hover-bg)] dark:bg-[var(--card-bg)]
                  shadow-sm
                "
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {folders.map((folderName) => {
        const items = groupedByFolder.get(folderName) || [];
        return (
          <div key={`folder-${folderName}`}>
            <SectionHeader
              title={folderName}
              id={folderName}
              expanded={!!expanded[folderName]}
              onToggle={toggleExpanded}
            />
            {expanded[folderName] && (
              <div id={`saved-sec-${folderName}`}>
                {items.length === 0 ? (
                  <div className="px-3 py-1 flex justify-between items-center">
                    <span className="text-xs text-[var(--text-secondary)] italic">
                      This block is empty.
                    </span>

                    {!SYSTEM_BLOCKS.includes(folderName) && (
                      <button
                        type="button"
                        data-interactive="true"
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folderName);
                        }}
                        className="
                          flex items-center justify-center
                          w-6 h-6
                          rounded-full
                          text-[var(--text-secondary)]
                          hover:text-[var(--danger)]
                          text-sm
                        "
                        aria-label={`Delete block ${folderName}`}
                        title="Delete block"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ) : (
                  items.map((p) => (
                    <Row
                      key={p.id}
                      profile={p}
                      onOpen={setSelectedProfile}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-1 pt-1 border-t border-[var(--card-border)]">
        <div className="px-3 py-1 text-[10px] font-monoBrand tracking-[0.14em] uppercase text-[var(--text-secondary)]">
          Customisation coming soon
        </div>

        {ungrouped.length === 0 ? (
          <div className="px-3 py-1 text-xs text-[var(--text-secondary)] italic">
            No saved reports yet.
          </div>
        ) : (
          ungrouped.map((p) => (
            <Row key={p.id} profile={p} onOpen={setSelectedProfile} onDelete={handleDelete} />
          ))
        )}
      </div>

      {selectedProfile && (
        <SaveProfileModal
          open={true}
          onClose={() => setSelectedProfile(null)}
          aiResponse={selectedProfile.chat_json.ai_response}
          onSave={async (name, aiResponse, comments, _selectedFolder) => {
            await handleUpdate(selectedProfile.id, name, aiResponse, comments);
          }}
          defaultProfileName={selectedProfile.profile_name}
          readonly={false}
          folders={folders}
        />
      )}
    </div>
  );
}
