'use client';

import React from 'react';
import {
  LayoutTemplate,
  Bookmark,
  BookOpen,
  LifeBuoy,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

import { PlanProgress } from '@/components/PlanProgress';
import { PlanProgressMonthly } from '@/components/PlanProgressMonthly';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { useAuth } from '@/app/context/AuthProvider';
import TemplatesPanel from '@/app/components/TemplatesPanel';
import SavedProfileList from '@/app/components/SavedProfileList';
import { useTheme } from 'next-themes';

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const PRIMARY_ITEMS: NavItem[] = [
  { id: 'templates', label: 'Diplomacy Templates', icon: LayoutTemplate },
  { id: 'saved', label: 'Saved messages', icon: Bookmark },
  { id: 'library', label: 'Library', icon: BookOpen, disabled: true },
];

const USER_MENU_ITEMS: NavItem[] = [
  { id: 'support', label: 'Support email', icon: LifeBuoy },
  { id: 'theme', label: 'Theme', icon: Settings },
  { id: 'plan', label: 'Manage subscription', icon: User },
  { id: 'profile', label: 'Profile settings', icon: User },
  { id: 'signout', label: 'Sign out', icon: LogOut },
];

type DesktopSidebarProps = {
  expanded: boolean;
  onToggle: () => void;
  refreshToken: number;
  activeBox: 'templates' | 'saved-messages' | 'library' | null;
  onActiveBoxChange: (box: 'templates' | 'saved-messages' | 'library' | null) => void;

  isLoggedIn: boolean;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
};

export function DesktopSidebar({
  expanded,
  onToggle,
  refreshToken,
  activeBox,
  onActiveBoxChange,
  isLoggedIn,
  onSignOut,
  onOpenAuthModal,
}: DesktopSidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const toggleUserMenu = () => {
    setIsUserMenuOpen((open) => !open);
  };

  const { plan, limits, used, usedMonthly } = useUserPlan(refreshToken);

  const handleNavItemClick = (id: string) => {
    if (id === 'templates' || id === 'saved' || id === 'library') {
      if (!expanded) {
        onToggle();
      }

      const mappedId = (id === 'saved' ? 'saved-messages' : id) as
        | 'templates'
        | 'saved-messages'
        | 'library';

      onActiveBoxChange(activeBox === mappedId ? null : mappedId);

      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    }
  };

  const handleFooterToggle = () => {
    const willOpen = !isUserMenuOpen;

    if (willOpen && activeBox !== null) {
      onActiveBoxChange(null);
    }

    toggleUserMenu();
  };

  React.useEffect(() => {
    if (!expanded) {
      setIsUserMenuOpen(false);
    }
  }, [expanded]);

  React.useEffect(() => {
    if (isUserMenuOpen && activeBox !== null) {
      setIsUserMenuOpen(false);
    }
  }, [activeBox]);

  const handleSidebarClick = (event: React.MouseEvent) => {
    if (!expanded) {
      onToggle();
      setIsUserMenuOpen(true);
      return;
    }

    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  return (
    <aside
      data-sidebar-root="left"
      className="hidden md:flex flex-col border-r border-[var(--card-border)] bg-[var(--card-bg)]
                 transition-[width] duration-300 ease-out fixed top-0 bottom-0 left-0 z-20"
      style={{ width: expanded ? 275 : 72, cursor: expanded ? 'default' : 'e-resize' }}
      onClick={handleSidebarClick}
    >
      <SidebarHeaderRow expanded={expanded} onToggle={onToggle} />

      <SidebarContent
        expanded={expanded}
        activeBox={activeBox}
        plan={plan}
        onItemClick={handleNavItemClick}
      />

      <SidebarFooter
        expanded={expanded}
        userMenuOpen={isUserMenuOpen}
        onToggleUserMenu={handleFooterToggle}
        plan={plan}
        used={used}
        usedMonthly={usedMonthly}
        limits={limits}
        isLoggedIn={isLoggedIn}
        onSignOut={onSignOut}
        onOpenAuthModal={onOpenAuthModal}
      />
    </aside>
  );
}

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
  activeBox: 'templates' | 'saved-messages' | 'library' | null;
  onActiveBoxChange: (box: 'templates' | 'saved-messages' | 'library' | null) => void;

  isLoggedIn: boolean;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
};

export function MobileSidebar({
  open,
  onClose,
  activeBox,
  onActiveBoxChange,
  isLoggedIn,
  onSignOut,
  onOpenAuthModal,
}: MobileSidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [autoFooterEnabled, setAutoFooterEnabled] = React.useState(true);

  const toggleUserMenu = () => {
    setIsUserMenuOpen((open) => !open);
  };

  React.useEffect(() => {
    if (open) {
      setIsUserMenuOpen(autoFooterEnabled);
    } else {
      setIsUserMenuOpen(false);
    }
  }, [open, autoFooterEnabled]);

  React.useEffect(() => {
    const handleTemplateInserted = () => {
      setAutoFooterEnabled(false);

      setIsUserMenuOpen(false);

      onClose();
    };

    window.addEventListener('templates:inserted', handleTemplateInserted);
    return () => {
      window.removeEventListener('templates:inserted', handleTemplateInserted);
    };
  }, [onClose]);

  const { plan, used, usedMonthly, limits } = useUserPlan(0);

  const handleNavItemClick = (id: string) => {
    if (id === 'templates' || id === 'saved' || id === 'library') {
      const mappedId = (id === 'saved' ? 'saved-messages' : id) as
        | 'templates'
        | 'saved-messages'
        | 'library';

      onActiveBoxChange(activeBox === mappedId ? null : mappedId);

      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    }
  };

  const handleFooterToggle = () => {
    const willOpen = !isUserMenuOpen;

    if (willOpen && activeBox !== null) {
      onActiveBoxChange(null);
    }

    toggleUserMenu();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        data-sidebar-root="left"
        className="fixed top-0 bottom-0 left-0 z-[90] w-[82vw] max-w-xs bg-[var(--card-bg)] border-r border-[var(--card-border)]
                   transition-transform duration-300 ease-out flex flex-col"
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <SidebarHeaderRow expanded onToggle={onClose} />

        <SidebarContent
          expanded
          activeBox={activeBox}
          plan={plan}
          onItemClick={handleNavItemClick}
        />

        <SidebarFooter
          expanded
          userMenuOpen={isUserMenuOpen}
          onToggleUserMenu={handleFooterToggle}
          plan={plan}
          used={used}
          usedMonthly={usedMonthly}
          limits={limits}
          isLoggedIn={isLoggedIn}
          onSignOut={onSignOut}
          onOpenAuthModal={onOpenAuthModal}
        />
      </aside>
    </>
  );
}

function SidebarHeaderRow({ expanded, onToggle }: { expanded: boolean; onToggle?: () => void }) {
  const handleHeaderToggleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggle?.();
  };

  return (
    <div
      className={`
          h-14 flex items-center px-3 border-b border-[var(--card-border)]
         ${expanded ? 'justify-between' : 'justify-center'}
       `}
    >
      {expanded && (
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-monoBrand tracking-[0.18em] uppercase text-[var(--text-secondary)]">
            H1NTED
          </span>
        </div>
      )}

      {onToggle && (
        <button
          type="button"
          onClick={handleHeaderToggleClick}
          className="group flex items-center justify-center rounded-full transition"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)] group-hover:bg-[var(--surface)] shadow-sm group-hover:shadow-md transition">
            {expanded ? (
              <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </span>
        </button>
      )}
    </div>
  );
}

function LibraryContent({ plan }: { plan?: string }) {
  const isUpperTier = (plan ?? '') === 'Smarter' || (plan ?? '') === 'Business';

  if (!isUpperTier) {
    return (
      <div className="text-sm text-[var(--text-secondary)] italic" data-templates>
        🔒
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-sm text-[var(--text-primary)]" data-templates>
      <div className="cursor-default">Article One</div>
      <div className="cursor-default">Article Two</div>
      <div className="cursor-default">Article Three</div>
      <div className="cursor-default">Article Four</div>
      <div className="cursor-default">Article Five</div>
    </div>
  );
}

function SidebarContent({
  expanded,
  activeBox,
  plan,
  onItemClick,
}: {
  expanded: boolean;
  activeBox: 'templates' | 'saved-messages' | 'library' | null;
  plan?: string;
  onItemClick?: (id: NavItem['id']) => void;
}) {
  return (
    <nav className="sidebar-scroll flex-1 min-h-0 px-2 py-3 space-y-1 overflow-y-auto">
      {PRIMARY_ITEMS.map((item) => {
        const isOpen =
          (item.id === 'templates' && activeBox === 'templates') ||
          (item.id === 'saved' && activeBox === 'saved-messages') ||
          (item.id === 'library' && activeBox === 'library');

        return (
          <div key={item.id}>
            <SidebarButton item={item} expanded={expanded} onClick={onItemClick} />

            {expanded && isOpen && (
              <div className="mt-1 mb-2 px-3">
                {item.id === 'templates' && <TemplatesPanel isCdrMode={false} />}

                {item.id === 'saved' && (
                  <SavedProfileList key="saved-normal" showCreateBlockButton={true} />
                )}

                {item.id === 'library' && <LibraryContent plan={plan} />}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarButton({
  item,
  expanded,
  onClick,
}: {
  item: NavItem;
  expanded: boolean;
  onClick?: (id: NavItem['id']) => void;
}) {
  const Icon = item.icon;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (item.disabled) return;
    event.stopPropagation();
    onClick?.(item.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group w-full flex items-center gap-3 rounded-[999px] px-2 py-2 text-xs
                  hover:bg-[var(--surface)] transition text-[var(--text-primary)]
                  ${expanded ? 'justify-start' : 'justify-center'}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)]">
        <Icon className="w-4 h-4 opacity-80" />
      </span>
      {expanded && (
        <span className="font-monoBrand tracking-[0.14em] uppercase text-[var(--text-secondary)] text-[11px]">
          {item.label}
          {item.disabled && <span className="ml-1 text-[11px]">🔒</span>}
        </span>
      )}
    </button>
  );
}

function SidebarFooter({
  expanded,
  userMenuOpen,
  onToggleUserMenu,
  plan,
  used,
  usedMonthly,
  limits,
  isLoggedIn,
  onSignOut,
  onOpenAuthModal,
}: {
  expanded: boolean;
  userMenuOpen: boolean;
  onToggleUserMenu: () => void;
  plan: string;
  used: number;
  usedMonthly: number;
  limits: { dailyGenerations: number; monthlyGenerations: number };

  isLoggedIn: boolean;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
}) {
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const userName = (user as any)?.user_metadata?.full_name || (user as any)?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const [openSection, setOpenSection] = React.useState<'theme' | null>(null);

  const supportItem = USER_MENU_ITEMS.find((i) => i.id === 'support')!;
  const themeItem = USER_MENU_ITEMS.find((i) => i.id === 'theme')!;
  const planItem = USER_MENU_ITEMS.find((i) => i.id === 'plan')!;
  const profileItem = USER_MENU_ITEMS.find((i) => i.id === 'profile')!;
  const signoutItem = USER_MENU_ITEMS.find((i) => i.id === 'signout')!;

  const [isMobile, setIsMobile] = React.useState(false);
  const [supportRevealed, setSupportRevealed] = React.useState(false);
  const [supportHovered, setSupportHovered] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia?.('(max-width: 767px)');
    const update = () => setIsMobile(!!mq?.matches);
    update();
    mq?.addEventListener('change', update);
    return () => mq?.removeEventListener('change', update);
  }, []);

  React.useEffect(() => {
    if (!userMenuOpen) {
      setSupportRevealed(false);
      setSupportHovered(false);
      setOpenSection(null);
    }
  }, [userMenuOpen]);

  const supportLabel = supportHovered || supportRevealed ? 'hello@h1nted.com' : supportItem.label;

  const isThemeActive = openSection === 'theme';

  const handleThemeSelect = (themeKey: 'white' | 'navy' | 'gray') => {
    const mapping = {
      white: 'light',
      navy: 'dark',
      gray: 'gray',
    };

    setTheme(mapping[themeKey]);
  };

  return (
    <div
      className="relative mt-auto border-t border-[var(--card-border)] px-2 py-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`absolute left-0 right-0 bottom-full px-2 pb-2 z-10
                    transition-all duration-300 ease-out
                    ${
                      userMenuOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
      >
        <div className="rounded-3xl bg-[var(--background)] border border-[var(--card-border)] shadow-2xl py-2">
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between gap-2 md:gap-2">
              <div className="flex-shrink-0">
                <PlanProgress planName={plan} used={used} total={limits.dailyGenerations} />
              </div>

              <div className="h-10 w-px bg-[var(--card-border)] opacity-60" />

              <div className="flex-shrink-0">
                <PlanProgressMonthly
                  planName={plan}
                  used={usedMonthly}
                  total={limits.monthlyGenerations}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--card-border)] my-1" />

          <div
            onMouseEnter={() => {
              if (!isMobile) setSupportHovered(true);
            }}
            onMouseLeave={() => {
              if (!isMobile) setSupportHovered(false);
            }}
          >
            <button
              type="button"
              className={`group w-full flex items-center gap-3 rounded-[999px] px-2 py-2 text-xs
                          hover:bg-[var(--surface)] transition-all duration-300 text-[var(--text-primary)]
                          ${expanded ? 'justify-start' : 'justify-center'}`}
              onClick={() => {
                if (isMobile) {
                  if (!supportRevealed) {
                    setSupportRevealed(true);
                  } else {
                    window.location.href = 'mailto:hello@h1nted.com';
                  }
                } else {
                  window.location.href = 'mailto:hello@h1nted.com';
                }
              }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)]">
                <supportItem.icon className="w-4 h-4 opacity-80" />
              </span>
              {expanded && (
                <span className="font-monoBrand tracking-[0.14em] uppercase text-[var(--text-secondary)] text-[11px] select-text">
                  {supportLabel}
                </span>
              )}
            </button>
          </div>

          <div
            onMouseEnter={() => {
              if (!isMobile) {
                setOpenSection('theme');
              }
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                setOpenSection(null);
              }
            }}
          >
            <div
              role="button"
              className={`group w-full flex items-center gap-3 rounded-[999px] px-2 py-2 text-xs
                             hover:bg-[var(--surface)] transition-all duration-300 text-[var(--text-primary)]
                             ${expanded ? 'justify-start' : 'justify-center'}`}
              onClick={() => {
                if (isMobile) {
                  setOpenSection('theme');
                }
              }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)]">
                <themeItem.icon className="w-4 h-4 opacity-80" />
              </span>

              {expanded && (
                <div className="flex-1 text-left">
                  {!isThemeActive ? (
                    <span className="font-monoBrand tracking-[0.14em] uppercase text-[var(--text-secondary)] text-[11px]">
                      {themeItem.label}
                    </span>
                  ) : (
                    <div className="flex items-center gap-3 text-[11px] font-monoBrand tracking-[0.14em] uppercase text-[var(--text-secondary)]">
                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeSelect('white');
                        }}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-white/60"
                          style={{ backgroundColor: '#F9FAFB' }}
                        />
                        <span>White</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeSelect('navy');
                        }}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-[#1f2937]"
                          style={{ backgroundColor: '#020617' }}
                        />
                        <span>Navy</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeSelect('gray');
                        }}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-gray-500"
                          style={{ backgroundColor: '#313335ff' }}
                        />
                        <span>Grey</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <SidebarButton
              item={planItem}
              expanded={true}
              onClick={() => {
                window.open('/settings/subscription', '_blank', 'noopener,noreferrer');
              }}
            />
          </div>

          <div>
            <SidebarButton
              item={profileItem}
              expanded={true}
              onClick={() => {
                window.open('/settings/profile', '_blank', 'noopener,noreferrer');
              }}
            />
          </div>

          <div className="mt-1 pt-1 border-t border-[var(--card-border)]">
            <button
              type="button"
              className="group w-full flex items-center gap-3 rounded-[999px] px-2 py-2 text-xs
                       hover:bg-[var(--surface)] transition-all duration-300 text-[var(--text-primary)]
                       justify-start"
              onClick={() => {
                if (isLoggedIn) {
                  onSignOut();
                } else {
                  onOpenAuthModal();
                }
              }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)]">
                <signoutItem.icon className="w-4 h-4 opacity-80" />
              </span>
              {expanded && (
                <span className="font-monoBrand tracking-[0.14em] uppercase text-[var(--text-secondary)] text-[11px]">
                  {isLoggedIn ? 'Sign out' : 'Sign in'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const sidebarRoot = e.currentTarget.closest('[data-sidebar-root]');
          const isCollapsed = sidebarRoot?.clientWidth && sidebarRoot.clientWidth < 100;
          if (isCollapsed) {
            const toggleButton = sidebarRoot?.querySelector(
              'button[aria-label="Expand sidebar"]'
            ) as HTMLButtonElement | null;
            toggleButton?.click();
          }
          onToggleUserMenu();
        }}
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-[var(--surface)] transition w-full"
        aria-expanded={userMenuOpen}
        aria-label="Open account menu"
      >
        <div className="h-7 w-7 rounded-full bg-[#C084FC] text-[10px] flex items-center justify-center text-white font-monoBrand">
          {userInitial}
        </div>
        {expanded && (
          <div className="flex flex-col text-left">
            <span className="text-xs text-[var(--text-primary)] leading-tight">{userName}</span>
            <span className="text-[10px] text-[var(--text-secondary)] leading-tight">
              {plan ? `${plan} plan` : ''}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
