import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  Compass,
  ChartLine,
  SquareActivity,
  FileText,
  StickyNote,
  Clock,
  User,
  Sparkles,
  Map,
  Blocks,
  GitBranch,
  Shield,
  Bell,
  SquareChartGantt,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTimeline } from '@/contexts/TimelineContext';
import type { CanvasPage } from '@/types';

interface ViewListProps {
  pages: CanvasPage[];
  activePageId: string;
  onPageClick: (pageId: string) => void;
  onPageClose: (pageId: string) => void;
  onAddPage: (pageType: string) => void;
  isCollapsed?: boolean;
}

const PAGE_TYPE_GROUPS = [
  {
    label: 'Essentials',
    items: [
      { type: 'logs', label: 'Logs', icon: Compass },
      { type: 'traces', label: 'Traces', icon: Compass },
      { type: 'dashboard', label: 'Dashboard', icon: ChartLine },
    ],
  },
  {
    label: 'Observability',
    items: [
      { type: 'maps', label: 'Maps', icon: Map, placeholder: true },
      { type: 'integrations', label: 'Integrations', icon: Blocks, placeholder: true },
    ],
  },
  {
    label: 'Security',
    items: [
      { type: 'correlations', label: 'Correlations', icon: GitBranch, placeholder: true },
      { type: 'threat-intelligence', label: 'Threat Intelligence', icon: Shield, placeholder: true },
      { type: 'monitors', label: 'Monitors', icon: Bell, placeholder: true },
    ],
  },
  {
    label: 'Custom',
    items: [
      { type: 'hypothesis', label: 'Hypothesis', icon: SquareActivity },
      { type: 'note', label: 'Note', icon: StickyNote },
    ],
  },
] as const;

const ALL_PAGE_TYPES = PAGE_TYPE_GROUPS.flatMap((g) => g.items);

function pageIcon(type: string) {
  if (type === 'summary') return SquareChartGantt;
  const found = ALL_PAGE_TYPES.find((p) => p.type === type);
  return found?.icon ?? FileText;
}


export function ViewList({
  pages,
  activePageId,
  onPageClick,
  onPageClose,
  onAddPage,
  isCollapsed = false,
}: ViewListProps) {
  const [activeTab, setActiveTab] = useState<'pages' | 'timeline'>('timeline');
  const { events: timelineEvents } = useTimeline();
  // Track known event IDs to detect new ones for animation
  const knownEventIdsRef = useRef<Set<string>>(new Set());
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const known = knownEventIdsRef.current;
    const newIds: string[] = [];
    for (const event of timelineEvents) {
      if (!known.has(event.id)) {
        known.add(event.id);
        newIds.push(event.id);
      }
    }
    if (newIds.length > 0) {
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.add(id));
        return next;
      });
      const timer = setTimeout(() => {
        setAnimatingIds((prev) => {
          const next = new Set(prev);
          newIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [timelineEvents]);

  const sorted = [...pages].sort((a, b) => a.order - b.order);
  const summaryPages = sorted.filter((p) => p.type === 'summary');
  const otherPages = sorted.filter((p) => p.type !== 'summary');

  const renderPageEntry = (page: CanvasPage, noBg = false) => {
    const isActive = page.id === activePageId;
    const Icon = pageIcon(page.type);

    return (
      <div key={page.id} className="group relative">
        <button
          onClick={() => onPageClick(page.id)}
          className={`flex items-center gap-1.5 w-full rounded-md p-3 transition-colors cursor-pointer ${
            noBg
              ? isActive ? 'text-slate-900' : 'text-slate-600 hover:bg-white/40 cursor-pointer'
              : isActive
                ? 'bg-white/80 text-slate-900'
                : 'bg-white/60 text-slate-600 hover:bg-white cursor-pointer'
          }`}
          data-testid={`view-list-entry-${page.id}`}
          data-active={isActive}
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate text-xs">{page.title}</span>
        </button>
        {page.type !== 'paragraph' && page.type !== 'summary' && (
          <button
            className={`absolute -top-2 right-2 z-10 hidden items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-1 shadow-sm group-hover:flex ${
              page.type === 'hypothesis'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onPageClose(page.id);
            }}
            aria-label={`${page.type === 'hypothesis' ? 'Rule out' : 'Remove'} ${page.title}`}
            data-testid={`view-list-close-${page.id}`}
          >
            <X className="size-3.5" />
            <span className="text-xs font-medium leading-none">
              {page.type === 'hypothesis' ? 'Rule out' : 'Remove'}
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className="shrink-0 flex-col gap-3 overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: isCollapsed ? 0 : 240, display: 'flex' }}
      data-testid="view-list"
    >
      {/* Timeline / Pages toggle */}
      <div className="flex h-9 items-center rounded-lg overflow-hidden shrink-0">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 flex items-center justify-center gap-1.5 h-full px-2 text-xs font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'bg-white text-blue-600'
              : 'bg-slate-50 text-oui-dark-shade hover:bg-white'
          }`}
        >
          <Clock className="size-3" />
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 flex items-center justify-center gap-1.5 h-full px-2 text-xs font-medium transition-colors ${
            activeTab === 'pages'
              ? 'bg-white text-blue-600'
              : 'bg-slate-50 text-oui-dark-shade hover:bg-white'
          }`}
        >
          <FileText className="size-3" />
          Pages
        </button>
      </div>

      {activeTab === 'pages' && (
        <>
          {/* Other page entries */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            <div className="flex flex-col gap-3">
              {summaryPages.map(renderPageEntry)}
              <div className="flex flex-col gap-3 rounded-lg bg-white/60 py-3 overflow-hidden">
                {otherPages.map((p) => renderPageEntry(p, true))}
              </div>

              {/* Add page button */}
              <div className="flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex h-[40px] w-full flex-row items-center justify-center gap-2 rounded-lg transition-colors cursor-pointer border border-dashed border-slate-300 hover:border-slate-400 hover:bg-white/40"
                    aria-label="Add page"
                    data-testid="view-list-add-btn"
                  >
                    <Plus className="size-4 text-oui-dark-shade" />
                    <span className="text-xs text-oui-dark-shade">Add new</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="left" align="start" sideOffset={8} className="min-w-[200px]">
                    {PAGE_TYPE_GROUPS.map((group, gi) => (
                      <span key={group.label}>
                        {gi > 0 && <DropdownMenuSeparator />}
                        <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{group.label}</p>
                        <DropdownMenuGroup>
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isPlaceholder = 'placeholder' in item && item.placeholder;
                            return (
                              <DropdownMenuItem
                                key={item.type}
                                onClick={() => !isPlaceholder && onAddPage(item.type)}
                                disabled={isPlaceholder}
                                data-testid={`view-list-add-${item.type}`}
                              >
                                <Icon className="size-4" style={{ color: isPlaceholder ? undefined : '#005EB8' }} />
                                <span>{item.label}</span>
                                {isPlaceholder && <span className="ml-auto text-[10px] text-slate-400">Soon</span>}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuGroup>
                      </span>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'timeline' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          <div className="flex flex-col gap-2 overflow-hidden">
            {timelineEvents.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No events yet</p>
            )}
            {[...timelineEvents].reverse().map((event) => {
              const PageIcon = event.pageRef ? pageIcon(event.pageRef.pageType) : null;
              const isUser = event.iconColor === 'text-slate-500';
              const ActorIcon = isUser ? User : Sparkles;
              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-1 pb-4 min-w-0"
                  style={animatingIds.has(event.id) ? {
                    animation: 'timeline-slide-in 0.35s ease-out both',
                  } : undefined}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-[11px] text-slate-700 leading-snug">{event.text}</span>
                      <span className="text-[10px] text-slate-400">{event.time}</span>
                    </div>
                    <ActorIcon className={`size-3.5 shrink-0 mt-0.5 ${isUser ? 'text-slate-400' : 'text-purple-400'}`} />
                  </div>
                  {event.pageRef && PageIcon && (
                    <button
                      onClick={() => !event.pageRef!.removed && onPageClick(event.pageRef!.pageId)}
                      disabled={event.pageRef.removed}
                      className={`flex items-center gap-1.5 rounded-md p-3 transition-colors ${
                        event.pageRef.removed
                          ? 'bg-slate-50 text-slate-400 line-through cursor-default'
                          : 'bg-white/60 text-slate-600 hover:bg-white cursor-pointer'
                      }`}
                    >
                      <PageIcon className="size-4 shrink-0" />
                      <span className="truncate text-xs">{event.pageRef.pageTitle}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
