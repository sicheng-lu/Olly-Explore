import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Table,
  AlertTriangle,
  Activity,
  RotateCcw,
  Shield,
  Compass,
  StickyNote,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { DiscoverPage } from '@/components/pages/DiscoverPage';
import { DashboardPage } from '@/components/pages/DashboardPage';
import { OverviewPage } from '@/components/pages/OverviewPage';
import { PageTypeRouter } from '@/components/pages/PageTypeRouter';
import { PAGE_TYPES } from '@/components/pages/page-types';
import { LogsPageMockDBPool } from '@/components/pages/LogsPageMockDBPool';
import { LogsPageMockLockContention } from '@/components/pages/LogsPageMockLockContention';
import { TracesPageMockDBPool } from '@/components/pages/TracesPageMockDBPool';
import { TracesPageMockLockContention } from '@/components/pages/TracesPageMockLockContention';
import { NotePageMockLockContention } from '@/components/pages/NotePageMockLockContention';
import { GenerationService } from '@/services/generation-service';
import type { CanvasPage } from '@/types';

interface CanvasProps {
  pages: CanvasPage[];
  activePageId: string;
  onPageSelect: (pageId: string) => void;
  onAddMockPage?: (page: CanvasPage) => void;
  hypothesisRuledOut?: boolean;
}

function pageTypeConfig(type: string) {
  switch (type) {
    case 'discover': return { icon: Search, label: 'Discover' };
    case 'logs': return { icon: Search, label: 'Logs' };
    case 'traces': return { icon: Search, label: 'Traces' };
    case 'dashboard': return { icon: LayoutDashboard, label: 'Dashboard' };
    case 'alerting': return { icon: Bell, label: 'Alerting' };
    case 'visualize': return { icon: BarChart3, label: 'Visualize' };
    case 'observability': return { icon: Shield, label: 'Overview' };
    case 'paragraph': return { icon: FileText, label: 'Summary' };
    case 'hypothesis': return { icon: Activity, label: 'Hypothesis' };
    case 'note': return { icon: StickyNote, label: 'Note' };
    default: return { icon: FileText, label: type.charAt(0).toUpperCase() + type.slice(1) };
  }
}

/* ── Progress bar for paragraph pages ── */

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-10 text-right">{value}%</span>
    </div>
  );
}

/* ── Paragraph page renderer ── */

function ParagraphPage({
  content,
  pages,
  onPageSelect,
}: {
  content: string;
  pages?: CanvasPage[];
  onPageSelect?: (pageId: string) => void;
}) {
  const blocks = content.split('\n\n');

  const handleView = (title: string) => {
    if (!pages || !onPageSelect) return;
    const target = pages.find((p) => p.title === title);
    if (target) onPageSelect(target.id);
  };

  return (
    <div className="w-full space-y-4 py-4 px-2" data-testid="page-placeholder-paragraph">
      {blocks.map((block, i) => {
        // Title: # heading
        if (block.startsWith('# ') && !block.startsWith('## '))
          return <h2 key={i} className="text-base font-semibold text-slate-900 tracking-tight">{block.slice(2)}</h2>;
        // Subtitle: ## heading
        if (block.startsWith('## '))
          return (
            <h3 key={i} className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-6 mb-2">
              {block.slice(3)}
            </h3>
          );
        // Latency chart: [chart]
        if (block.trim() === '[chart]')
          return (
            <div key={i} className="grid grid-cols-2 gap-8">
              {/* P95 Latency chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">P95 Latency — /api/v1/payments/process</span>
                  <span className="text-xs font-semibold text-red-600">2,012ms</span>
                </div>
                <div className="relative h-[80px] w-full">
                  <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
                    <line x1="0" y1="48" x2="400" y2="48" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                    <line x1="0" y1="24" x2="400" y2="24" stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="0" y1="60" x2="400" y2="60" stroke="#e2e8f0" strokeWidth="0.5" />
                    <path
                      d="M0,65 L30,64 L60,62 L90,60 L120,58 L150,55 L180,52 L210,48 L240,42 L270,34 L300,24 L330,16 L360,10 L390,8 L400,8 L400,80 L0,80 Z"
                      fill="url(#summaryRedGradient)"
                    />
                    <path
                      d="M0,65 L30,64 L60,62 L90,60 L120,58 L150,55 L180,52 L210,48 L240,42 L270,34 L300,24 L330,16 L360,10 L390,8 L400,8"
                      fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"
                    />
                    <circle cx="400" cy="8" r="3" fill="#ef4444" />
                    <circle cx="400" cy="8" r="5" fill="#ef4444" opacity="0.3">
                      <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <defs>
                      <linearGradient id="summaryRedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>-30m</span><span>-20m</span><span>-10m</span><span>Now</span>
                </div>
              </div>
              {/* Request Breakdown chart */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500">Request Breakdown</span>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full bg-emerald-400" /> Success</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full bg-red-400" /> Error</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full bg-amber-300" /> Timeout</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {[
                    { name: 'Payment', success: 52, error: 38, timeout: 10 },
                    { name: 'SMS', success: 45, error: 42, timeout: 13 },
                    { name: 'Logging', success: 78, error: 18, timeout: 4 },
                    { name: 'Order', success: 88, error: 8, timeout: 4 },
                  ].map((svc) => (
                    <div key={svc.name} className="flex items-center gap-2">
                      <span className="w-16 text-[11px] text-slate-500 text-right shrink-0">{svc.name}</span>
                      <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-slate-100">
                        <div className="h-full bg-emerald-400 transition-all" style={{ width: `${svc.success}%` }} />
                        <div className="h-full bg-red-400 transition-all" style={{ width: `${svc.error}%` }} />
                        <div className="h-full bg-amber-300 transition-all" style={{ width: `${svc.timeout}%` }} />
                      </div>
                      <span className="w-10 text-[10px] text-red-500 font-medium shrink-0">{svc.error}% err</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        // Red tags: [tags:tag1|tag2|tag3]
        if (block.startsWith('[tags:'))
          return (
            <div key={i} className="flex flex-wrap items-center gap-2">
              {block.slice(6, -1).split('|').map((tag, j) => (
                <span key={j} className="rounded-lg bg-red-700 px-2.5 py-1.5 text-xs text-white">
                  {tag.trim()}
                </span>
              ))}
            </div>
          );
        // Progress bar: [bar:value:max:color:label]
        if (block.startsWith('[bar:')) {
          const parts = block.slice(5, -1).split(':');
          const val = Number(parts[0]);
          const mx = Number(parts[1]);
          const color = parts[2] || 'bg-blue-500';
          const label = parts[3] || '';
          return (
            <div key={i} className="flex items-center gap-3">
              {label && <span className="text-xs text-slate-500 w-44 shrink-0">{label}</span>}
              <ProgressBar value={val} max={mx} color={color} />
            </div>
          );
        }
        // Stat row: [stat:label:value:status]
        if (block.startsWith('[stat:')) {
          const rows = block.split('\n');
          return (
            <div key={i} className="grid grid-cols-3 gap-2">
              {rows.map((row, j) => {
                const parts = row.slice(6, -1).split(':');
                const label = parts[0];
                const value = parts[1];
                const status = parts[2] || 'normal';
                const borderColor = status === 'critical' ? 'border-red-200 bg-red-50/50' : status === 'warning' ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 bg-slate-50/50';
                const valueColor = status === 'critical' ? 'text-red-600' : status === 'warning' ? 'text-amber-600' : 'text-slate-900';
                return (
                  <div key={j} className={`rounded-lg border px-3 py-2.5 ${borderColor}`}>
                    <span className="block text-[10px] text-slate-400 mb-0.5">{label}</span>
                    <span className={`block text-sm font-semibold ${valueColor}`}>{value}</span>
                  </div>
                );
              })}
            </div>
          );
        }
        // Divider: ---
        if (block.trim() === '---')
          return <div key={i} className="h-px bg-slate-100 my-1" />;
        // Callout: > text
        if (block.startsWith('> '))
          return (
            <div key={i} className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-800 leading-relaxed">{block.slice(2)}</p>
            </div>
          );
        // Bullet list
        if (block.startsWith('- '))
          return (
            <ul key={i} className="space-y-2 pl-0.5">
              {block.split('\n').map((line, j) => {
                const viewMatch = line.match(/\[view:(.+?)\]$/);
                const lineText = viewMatch ? line.replace(/\s*\[view:.+?\]$/, '').replace(/^- /, '') : line.replace(/^- /, '');
                return (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600 leading-relaxed">
                    <span className="mt-0 size-1 shrink-0 rounded-full bg-slate-300" />
                    <span className="flex-1">{lineText}</span>
                    {viewMatch && onPageSelect && (
                      <button
                        onClick={() => handleView(viewMatch[1])}
                        className="shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        View
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          );
        // Default paragraph
        return <p key={i} className="text-sm text-slate-600 leading-relaxed">{block}</p>;
      })}
    </div>
  );
}

/* ── Page placeholder (routes page type to renderer) ── */

function PagePlaceholder({
  type,
  content,
  title,
  pages,
  onPageSelect,
}: {
  type: string;
  content?: string;
  title?: string;
  pages?: CanvasPage[];
  onPageSelect?: (pageId: string) => void;
}) {
  switch (type) {
    case 'discover':
    case 'logs':
    case 'traces':
      return <DiscoverPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'observability':
      return <OverviewPage />;
    case 'paragraph':
      return <ParagraphPage content={content ?? ''} pages={pages} onPageSelect={onPageSelect} />;
    case 'hypothesis':
      return <ParagraphPage content={`# ${title || 'Hypothesis'}\n\n${content ?? ''}`} />;
    case 'alerting':
      return (
        <div className="w-full space-y-2 py-4 px-2" data-testid="page-placeholder-alerting">
          {['CPU spike on node-3', 'Disk usage > 90%', 'Latency threshold exceeded'].map((alert, idx) => (
            <div key={alert} className="flex items-center gap-3 rounded border border-slate-200 px-3 py-2">
              <AlertTriangle className={`size-4 ${idx === 0 ? 'text-red-500' : 'text-amber-500'}`} />
              <span className="text-sm text-slate-900">{alert}</span>
              <span className="ml-auto text-xs text-slate-400">{idx === 0 ? 'Critical' : 'Warning'}</span>
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center w-full py-8 px-2 text-slate-400" data-testid="page-placeholder-generic">
          <FileText className="size-10 mb-2" />
          <span className="text-sm">Page content for "{type}"</span>
        </div>
      );
  }
}

/* ── Hypothesis page wrapper with Show Logs / Show Traces buttons ── */

function getHypothesisMockKey(page: CanvasPage): 'dbpool' | 'lock' | null {
  const text = `${page.title} ${page.content ?? ''}`.toLowerCase();
  if (text.includes('connection pool') || text.includes('db pool') || text.includes('pool exhaustion')) return 'dbpool';
  if (text.includes('lock contention') || text.includes('lock ') || text.includes('locking')) return 'lock';
  return null;
}

function HypothesisPage({
  page,
  allPages,
  onAddMockPage,
  boosted = false,
}: {
  page: CanvasPage;
  allPages: CanvasPage[];
  onAddMockPage?: (page: CanvasPage) => void;
  boosted?: boolean;
}) {
  const mockKey = getHypothesisMockKey(page);

  const handleShowLogs = () => {
    if (!mockKey || !onAddMockPage) return;
    const contentKey = `mock-logs-${mockKey}`;
    const existing = allPages.find((p) => p.content === contentKey);
    if (existing) {
      onAddMockPage(existing);
      return;
    }
    const title = mockKey === 'dbpool' ? 'Logs: DB Pool Exhaustion' : 'Logs: Lock Contention';
    onAddMockPage({
      id: crypto.randomUUID(),
      type: 'logs',
      title,
      order: allPages.length,
      content: contentKey,
    });
  };

  const handleShowTraces = () => {
    if (!mockKey || !onAddMockPage) return;
    const contentKey = `mock-traces-${mockKey}`;
    const existing = allPages.find((p) => p.content === contentKey);
    if (existing) {
      onAddMockPage(existing);
      return;
    }
    const title = mockKey === 'dbpool' ? 'Traces: DB Pool Exhaustion' : 'Traces: Lock Contention';
    onAddMockPage({
      id: crypto.randomUUID(),
      type: 'traces',
      title,
      order: allPages.length,
      content: contentKey,
    });
  };

  const confidence = mockKey === 'dbpool'
    ? boosted
      ? { level: 'Strong', percent: 90, textColor: 'text-purple-700', bgColor: 'bg-purple-50' }
      : { level: 'High', percent: 80, textColor: 'text-red-700', bgColor: 'bg-red-50' }
    : mockKey === 'lock'
    ? boosted
      ? { level: 'High', percent: 75, textColor: 'text-amber-700', bgColor: 'bg-amber-50' }
      : { level: 'Medium', percent: 65, textColor: 'text-amber-700', bgColor: 'bg-amber-50' }
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0 mb-2">
        <h2 className="text-base font-semibold text-slate-900 tracking-tight">{page.title || 'Hypothesis'}</h2>
        {mockKey && onAddMockPage && (
          <div className="flex items-center gap-2">
            {confidence && (
              <span className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${confidence.textColor} ${confidence.bgColor}`}>
                {confidence.level} confidence · {confidence.percent}%
              </span>
            )}
            <button
              onClick={handleShowLogs}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Compass className="size-3" />
              Show logs
            </button>
            <button
              onClick={handleShowTraces}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Compass className="size-3" />
              Show traces
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto scrollbar-none">
        <ParagraphPage content={page.content ?? ''} />
      </div>
    </div>
  );
}

/* ── Main Canvas component ── */

export function Canvas({ pages, activePageId, onPageSelect, onAddMockPage, hypothesisRuledOut = false }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [errorPageIds, setErrorPageIds] = useState<Set<string>>(new Set());
  const fromObserverRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const activePageIdRef = useRef(activePageId);
  const isProgrammaticScroll = useRef(false);

  activePageIdRef.current = activePageId;

  // Scroll to active page only when triggered externally (ViewList click)
  useEffect(() => {
    if (fromObserverRef.current) {
      fromObserverRef.current = false;
      return;
    }
    if (!containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-page-id="${activePageId}"]`) as HTMLElement | null;
    if (!el) return;

    isProgrammaticScroll.current = true;
    const containerRect = containerRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop + (elRect.top - containerRect.top);
    containerRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });

    const container = containerRef.current;
    const onScrollEnd = () => {
      container.removeEventListener('scrollend', onScrollEnd);
      isProgrammaticScroll.current = false;
    };
    container.addEventListener('scrollend', onScrollEnd);
    const fallback = setTimeout(() => {
      container.removeEventListener('scrollend', onScrollEnd);
      isProgrammaticScroll.current = false;
    }, 1200);
    return () => {
      clearTimeout(fallback);
      container.removeEventListener('scrollend', onScrollEnd);
    };
  }, [activePageId]);

  // Set up observer once when pages change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry) {
          const pageId = (bestEntry.target as HTMLElement).dataset.pageId;
          if (pageId && pageId !== activePageIdRef.current) {
            fromObserverRef.current = true;
            onPageSelect(pageId);
          }
        }
      },
      { root: container, threshold: [0.5, 0.75, 1] },
    );

    const pageEls = container.querySelectorAll('[data-page-id]');
    pageEls.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [pages, onPageSelect]);

  const handleRetryPage = (pageId: string) => {
    setErrorPageIds((prev) => {
      const next = new Set(prev);
      next.delete(pageId);
      return next;
    });
  };

  // Track previous pages to detect removals and cancel active generations
  const prevPagesRef = useRef<CanvasPage[]>(pages);
  useEffect(() => {
    const prevPages = prevPagesRef.current;
    const currentIds = new Set(pages.map((p) => p.id));

    for (const prevPage of prevPages) {
      if (!currentIds.has(prevPage.id) && prevPage.generationStatus === 'generating') {
        GenerationService.cancelGeneration(prevPage.id);
      }
    }

    prevPagesRef.current = pages;
  }, [pages]);

  if (pages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center" data-testid="canvas-empty">
        <p className="text-sm text-slate-400">No pages open. Add a page from the view list.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto scrollbar-none"
      data-testid="canvas"
    >
      <div className="flex flex-col gap-[12px] h-full">
        {[...pages]
          .sort((a, b) => a.order - b.order)
          .map((page) => (
            <div
              key={page.id}
              data-page-id={page.id}
              className="shrink-0"
              style={{ height: 'calc(100% - 24px)' }}
              data-testid={`canvas-page-${page.id}`}
            >
              {errorPageIds.has(page.id) ? (
                <div className="flex h-full flex-col items-center justify-center rounded-lg bg-white py-8" data-testid={`canvas-page-error-${page.id}`}>
                  <AlertTriangle className="size-10 mb-3 text-red-500" />
                  <p className="text-sm font-medium text-slate-900 mb-1">Failed to load page</p>
                  <p className="text-xs text-slate-400 mb-4">Something went wrong loading "{page.title}".</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetryPage(page.id)}
                    data-testid={`canvas-page-retry-${page.id}`}
                  >
                    <RotateCcw className="size-3.5 mr-1.5" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="relative h-full rounded-lg bg-white p-4 overflow-auto scrollbar-none">
                  {page.type in PAGE_TYPES && !page.content?.startsWith('mock-') ? (
                    <PageTypeRouter
                      page={page}
                      hasInvestigationData={false}
                      workspacePages={pages}
                      onGenerationComplete={(pageId, content) => {
                        console.log(`Generation complete for ${pageId}:`, content);
                      }}
                      onGenerationError={(pageId, error) => {
                        console.log(`Generation error for ${pageId}:`, error);
                      }}
                    />
                  ) : page.content === 'mock-logs-dbpool' ? (
                    <LogsPageMockDBPool />
                  ) : page.content === 'mock-logs-lock' ? (
                    <LogsPageMockLockContention />
                  ) : page.content === 'mock-traces-dbpool' ? (
                    <TracesPageMockDBPool />
                  ) : page.content === 'mock-traces-lock' ? (
                    <TracesPageMockLockContention />
                  ) : page.content === 'mock-note-lock' ? (
                    <NotePageMockLockContention />
                  ) : page.type === 'hypothesis' ? (
                    <HypothesisPage page={page} allPages={pages} onAddMockPage={onAddMockPage} boosted={hypothesisRuledOut} />
                  ) : (
                    <PagePlaceholder type={page.type} content={page.content} title={page.title} pages={pages} onPageSelect={onPageSelect} />
                  )}
                </div>
              )}
            </div>
          ))}
        <div className="shrink-0 h-[24px]" />
      </div>
    </div>
  );
}
