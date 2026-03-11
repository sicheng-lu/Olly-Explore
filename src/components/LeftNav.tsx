import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  SquareTerminal,
  Keyboard,
  Info,
  Sun,
  Search,
  PanelRightClose,
  PanelLeftClose,
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useOllyState } from '@/contexts/OllyStateContext';
import { OllyIcon } from '@/components/OllyIcon';
import { Button } from '@/components/ui/button';
import type { Workspace } from '@/types';

const WORKSPACE_TYPE_ICONS: Record<string, { svg: string; alt: string }> = {
  observability: { svg: './image/obv.svg', alt: 'Observability' },
  security: { svg: './image/security.svg', alt: 'Security' },
  search: { svg: './image/search.svg', alt: 'Search' },
  default: { svg: './image/workspace.svg', alt: 'Workspace' },
};

const WORKSPACE_COLORS = [
  '#9333ea', '#2563eb', '#e11d48', '#0891b2', '#059669',
  '#d97706', '#7c3aed', '#dc2626', '#0d9488', '#c026d3',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getWorkspaceType(workspace: Workspace) {
  const type = workspace.dataSources[0]?.type ?? 'default';
  const icon = WORKSPACE_TYPE_ICONS[type] ?? WORKSPACE_TYPE_ICONS.default;
  const color = WORKSPACE_COLORS[hashName(workspace.name) % WORKSPACE_COLORS.length];
  return { ...icon, color };
}

interface LeftNavProps {
  mode: 'expanded' | 'collapsed';
  onWorkspaceClick: (workspaceId: string) => void;
  onHomeClick?: () => void;
  onOllyIconClick?: () => void;
  onExpandClick?: () => void;
  onCollapseClick?: () => void;
  showHomeButton?: boolean;
  isInvestigating?: boolean;
  logoOverride?: string;
  animate?: boolean;
  className?: string;
}

export function LeftNav({
  mode,
  onWorkspaceClick,
  onHomeClick,
  onOllyIconClick,
  onExpandClick,
  onCollapseClick,
  showHomeButton = true,
  isInvestigating: isInvestigatingProp,
  logoOverride,
  animate = false,
  className = '',
}: LeftNavProps) {
  const { workspaces } = useWorkspace();
  const { state: ollyState } = useOllyState();

  const isInvestigating = isInvestigatingProp ?? ollyState === 'investigating';

  // Track which content to show — delayed so animation plays before swap
  const [displayMode, setDisplayMode] = useState(mode);
  const initialWidth = mode === 'expanded' ? 280 : (animate ? 280 : 48);
  const [animatingWidth, setAnimatingWidth] = useState(initialWidth);

  useEffect(() => {
    if (animate) {
      // Kick off the entry animation on next frame
      const frame = requestAnimationFrame(() => {
        setAnimatingWidth(mode === 'expanded' ? 280 : 48);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    // Start width animation immediately
    setAnimatingWidth(mode === 'expanded' ? 280 : 48);

    // Swap content partway through the animation for a smooth feel
    const timer = setTimeout(() => {
      setDisplayMode(mode);
    }, 150);
    return () => clearTimeout(timer);
  }, [mode]);

  const isExpanded = mode === 'expanded';

  return (
    <div
      className={`group relative z-10 flex h-full shrink-0 transition-[width] duration-300 ease-in-out ${className}`}
      style={{ width: animatingWidth }}
    >
      {/* Floating collapse button — right edge, visible on hover (expanded only) */}
      {isExpanded && onCollapseClick && (
        <button
          onClick={onCollapseClick}
          className="absolute right-0 top-9 z-20 flex size-6 translate-x-1/2 items-center justify-center rounded bg-white shadow opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Collapse navigation"
        >
          <PanelLeftClose className="size-3.5 text-oui-dark-shade" />
        </button>
      )}

      {displayMode === 'collapsed' ? (
        <CollapsedNav
          allWorkspaces={workspaces}
          onWorkspaceClick={onWorkspaceClick}
          onHomeClick={onHomeClick}
          onOllyIconClick={onOllyIconClick}
          onExpandClick={onExpandClick}
          showHomeButton={showHomeButton}
          isInvestigating={isInvestigating}
          logoOverride={logoOverride}
          animate={false}
          className=""
        />
      ) : (
        <ExpandedNav
          allWorkspaces={workspaces}
          isInvestigating={isInvestigating}
          onWorkspaceClick={onWorkspaceClick}
          animate={false}
          className=""
        />
      )}
    </div>
  );
}

/* ── Expanded mode (Home page) ── */

function ExpandedNav({
  allWorkspaces,
  onWorkspaceClick,
  className,
}: {
  allWorkspaces: Workspace[];
  isInvestigating: boolean;
  onWorkspaceClick: (id: string) => void;
  animate: boolean;
  className: string;
}) {
  const [filter, setFilter] = useState<'public' | 'my'>('public');
  const [search, setSearch] = useState('');

  const filteredWorkspaces = useMemo(() => {
    const byPrivacy = allWorkspaces.filter((ws) =>
      filter === 'public' ? ws.privacy === 'public' : ws.privacy === 'private'
    );
    if (!search.trim()) return byPrivacy;
    const q = search.toLowerCase();
    return byPrivacy.filter((ws) => ws.name.toLowerCase().includes(q));
  }, [allWorkspaces, filter, search]);

  return (
      <nav
        data-testid="left-nav"
        data-mode="expanded"
        className={`flex h-full w-full flex-col items-center justify-between overflow-hidden bg-white/50 pt-6 ${className}`}
      >
        <div className="flex w-full flex-1 min-h-0 flex-col items-center gap-4 px-4">
          <div className="flex size-12 items-center justify-center shrink-0">
            <img src="./image/workspace.svg" alt="Workspaces" className="size-4" />
          </div>

        {/* Search bar */}
        <div className="flex h-8 w-full items-center gap-2 rounded-lg bg-white px-3 shrink-0">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces"
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Public / My toggle */}
        <div className="flex h-8 w-full items-center rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setFilter('public')}
            className={`flex flex-1 items-center justify-center h-full text-xs font-medium transition-colors ${
              filter === 'public' ? 'bg-white text-blue-600' : 'bg-slate-50 text-oui-dark-shade hover:bg-white'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setFilter('my')}
            className={`flex flex-1 items-center justify-center h-full text-xs font-medium transition-colors ${
              filter === 'my' ? 'bg-white text-blue-600' : 'bg-slate-50 text-oui-dark-shade hover:bg-white'
            }`}
          >
            My
          </button>
        </div>

        {/* Workspace list */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-none">
          <div className="flex flex-col gap-4">
            {filteredWorkspaces.map((ws) => {
              const wsType = getWorkspaceType(ws);
              return (
                <button
                  key={ws.id}
                  data-testid={`workspace-item-${ws.id}`}
                  onClick={() => onWorkspaceClick(ws.id)}
                  className="flex w-full items-start gap-3 rounded-lg bg-white p-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div
                    className="size-6 shrink-0"
                    style={{
                      backgroundColor: wsType.color,
                      WebkitMaskImage: `url(${wsType.svg})`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: `url(${wsType.svg})`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                    role="img"
                    aria-label={wsType.alt}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-normal text-black">{ws.name}</div>
                    <div className="text-xs text-slate-500">
                      {ws.dataSources[0]?.name ?? 'Workspace'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <UtilityBar />
    </nav>
  );
}

/* ── Collapsed mode (Workspace page) ── */

function CollapsedNav({
  allWorkspaces,
  onWorkspaceClick,
  onHomeClick,
  onOllyIconClick,
  onExpandClick,
  showHomeButton = true,
  isInvestigating,
  logoOverride,
  className,
}: {
  allWorkspaces: Workspace[];
  onWorkspaceClick: (id: string) => void;
  onHomeClick?: () => void;
  onOllyIconClick?: () => void;
  onExpandClick?: () => void;
  showHomeButton?: boolean;
  isInvestigating: boolean;
  logoOverride?: string;
  animate: boolean;
  className: string;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [filter, setFilter] = useState<'public' | 'my'>('public');
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popoverOpen]);

  const filteredWorkspaces = useMemo(() => {
    const byPrivacy = allWorkspaces.filter((ws) =>
      filter === 'public' ? ws.privacy === 'public' : ws.privacy === 'private'
    );
    if (!search.trim()) return byPrivacy;
    const q = search.toLowerCase();
    return byPrivacy.filter((ws) => ws.name.toLowerCase().includes(q));
  }, [allWorkspaces, filter, search]);

  return (
    <nav
      data-testid="left-nav"
      data-mode="collapsed"
      className={`flex h-full w-full flex-col items-center justify-between overflow-hidden bg-white/50 ${className}`}
    >
      {/* Top: Workspace selector + Olly logo */}
      <div className="flex flex-col items-center gap-6 px-3 py-6">
        <button
          ref={triggerRef}
          onClick={() => setPopoverOpen((v) => !v)}
          className="flex size-6 items-center justify-center"
          aria-label="Workspaces"
        >
          <img src="./image/workspace.svg" alt="Workspaces" className="size-4" />
        </button>

        {/* Workspace popover */}
        {popoverOpen && createPortal(
          <div
            ref={popoverRef}
            className="fixed z-50 flex w-[280px] flex-col gap-3 rounded-lg bg-white/60 backdrop-blur-md p-3 shadow-lg ring-1 ring-black/10"
            style={{
              top: triggerRef.current?.getBoundingClientRect().top ?? 0,
              left: (triggerRef.current?.getBoundingClientRect().right ?? 0) + 12,
            }}
          >
            {/* Search */}
            <div className="flex h-8 items-center gap-2 rounded-lg bg-slate-50 px-3">
              <Search className="size-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workspaces"
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Public / My toggle */}
            <div className="flex h-8 items-center rounded-lg overflow-hidden">
              <button
                onClick={() => setFilter('public')}
                className={`flex flex-1 items-center justify-center h-full text-xs font-medium transition-colors ${
                  filter === 'public' ? 'bg-white text-blue-600' : 'bg-slate-50 text-oui-dark-shade hover:bg-white'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setFilter('my')}
                className={`flex flex-1 items-center justify-center h-full text-xs font-medium transition-colors ${
                  filter === 'my' ? 'bg-white text-blue-600' : 'bg-slate-50 text-oui-dark-shade hover:bg-white'
                }`}
              >
                My
              </button>
            </div>

            {/* Workspace list */}
            <div className="max-h-[320px] overflow-y-auto scrollbar-none flex flex-col gap-1">
              {filteredWorkspaces.map((ws) => {
                const wsType = getWorkspaceType(ws);
                return (
                  <button
                    key={ws.id}
                    onClick={() => { onWorkspaceClick(ws.id); setPopoverOpen(false); }}
                    className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div
                      className="size-6 shrink-0"
                      style={{
                        backgroundColor: wsType.color,
                        WebkitMaskImage: `url(${wsType.svg})`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskImage: `url(${wsType.svg})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-normal text-black">{ws.name}</div>
                      <div className="text-xs text-slate-500">
                        {ws.dataSources[0]?.name ?? 'Workspace'}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredWorkspaces.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400">No workspaces found</div>
              )}
            </div>
          </div>,
          document.body
        )}

        {onExpandClick ? (
          <button
            onClick={onExpandClick}
            className="flex size-6 items-center justify-center"
            aria-label="Expand navigation"
          >
            <PanelRightClose className="size-4 text-oui-dark-shade" />
          </button>
        ) : (
          <button
            onClick={onOllyIconClick}
            className="flex size-6 items-center p-[3px]"
            aria-label="Olly"
          >
            <OllyIcon size="small" logoSrc={logoOverride ?? (isInvestigating ? './image/Logo-v2.svg' : undefined)} />
          </button>
        )}
      </div>

      {/* Bottom: utility icons + avatar */}
      <div className="flex flex-col items-center gap-4 px-3 py-6">
        {showHomeButton && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onHomeClick}
            aria-label="Home"
            className="size-6"
          >
            <Home className="size-4 text-oui-dark-shade" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Theme" className="size-6">
          <Sun className="size-4 text-oui-dark-shade" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Dev Tools" className="size-6">
          <SquareTerminal className="size-4 text-oui-dark-shade" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Keyboard Shortcuts" className="size-6">
          <Keyboard className="size-4 text-oui-dark-shade" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Help" className="size-6">
          <Info className="size-4 text-oui-dark-shade" />
        </Button>
        <div
          className="flex size-6 items-center justify-center rounded-xl bg-teal-500 text-xs font-medium text-white"
          aria-label="User"
        >
          J
        </div>
      </div>
    </nav>
  );
}

/* ── Shared sub-components ── */

function UtilityBar() {
  return (
    <div className="flex items-center gap-4 py-6">
      <Button variant="ghost" size="icon-sm" aria-label="Theme" className="size-6">
        <Sun className="size-4 text-oui-dark-shade" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Dev Tools" className="size-6">
        <SquareTerminal className="size-4 text-oui-dark-shade" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Keyboard Shortcuts" className="size-6">
        <Keyboard className="size-4 text-oui-dark-shade" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Help" className="size-6">
        <Info className="size-4 text-oui-dark-shade" />
      </Button>
      <div
        className="flex size-6 items-center justify-center rounded-full bg-teal-500 text-xs font-medium text-white"
        aria-label="User"
      >
        J
      </div>
    </div>
  );
}
