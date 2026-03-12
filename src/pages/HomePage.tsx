import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ListChecks,
  Network,
  Server,
  ShieldAlert,
  AlertTriangle,
  Plus,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Mic,
  AtSign,
  SquareSlash,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { LeftNav } from '@/components/LeftNav';
import { OllyIcon } from '@/components/OllyIcon';
import { SuggestedPrompts } from '@/components/SuggestedPrompts';
import { AlertSkillsPanel } from '@/components/AlertSkillsPanel';
import { useOllyState } from '@/contexts/OllyStateContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAlertInvestigation } from '@/hooks/useAlertInvestigation';
import type { FeedItem } from '@/types';

/* ── Mock data ── */

interface FeedItemExtended extends FeedItem {
  sources?: string[];
}

const MOCK_FEED_ITEMS: FeedItemExtended[] = [
  {
    id: '1',
    type: 'insight',
    domain: 'observability',
    title: 'Cost anomaly: Lambda invocations up 40% in last hour',
    description: '',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '2',
    type: 'alert',
    domain: 'observability',
    title: 'SMS Service timeout errors spiking - upstream Twilio degradation detected',
    description: '',
    sources: ['dd76-x5', 'os233'],
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '3',
    type: 'event',
    domain: 'observability',
    title: 'Deployment completed for OrderService v2.4.1 - all health checks passing',
    description: '',
    sources: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'search-1',
    type: 'insight',
    domain: 'search',
    title: 'Poor CTR detected on "wireless headphones" query — UBI click-through rate dropped from 12.4% to 3.1% over 7 days',
    description: '',
    sources: ['ubi-analytics'],
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '4',
    type: 'insight',
    domain: 'observability',
    title: 'Payment Service error rate correlates with DB connection pool saturation',
    description: '',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 123),
  },
  {
    id: '5',
    type: 'action',
    domain: 'observability',
    title: 'Auto-scaling triggered for Catalog service - 3 new instances',
    description: '',
    sources: ['os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 144),
  },
  {
    id: '6',
    type: 'event',
    domain: 'observability',
    title: 'Kubernetes pod restart detected for auth-proxy in us-east-1',
    description: '',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    id: '7',
    type: 'insight',
    domain: 'observability',
    title: 'Memory leak pattern detected in NotificationWorker - steady 2% growth per hour',
    description: '',
    sources: ['dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
  },
  {
    id: '8',
    type: 'event',
    title: 'SSL certificate renewed for api.prod.internal - expires in 90 days',
    description: '',
    sources: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
  },
  {
    id: 'search-2',
    type: 'action',
    domain: 'search',
    title: 'Agent auto-tuned synonym ring for "laptop" queries — added "notebook computer", "portable PC" — relevance score improved 18%',
    description: '',
    sources: ['search-tuning'],
    timestamp: new Date(Date.now() - 1000 * 60 * 260),
  },
  {
    id: '9',
    type: 'insight',
    domain: 'observability',
    title: 'Cache hit ratio dropped below 70% on Redis cluster-3 - possible key eviction storm',
    description: '',
    sources: ['os233', 'os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 290),
  },
  {
    id: '10',
    type: 'action',
    domain: 'observability',
    title: 'Scale-down event for SearchIndexer - 2 instances terminated',
    description: '',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 320),
  },
  {
    id: '11',
    type: 'event',
    domain: 'observability',
    title: 'Database failover completed for orders-db-primary to replica-2',
    description: '',
    sources: ['dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 360),
  },
  {
    id: '12',
    type: 'alert',
    domain: 'observability',
    title: 'Latency p99 for GraphQL gateway exceeds 800ms - correlated with upstream inventory-svc',
    description: '',
    sources: ['os219', 'os233'],
    timestamp: new Date(Date.now() - 1000 * 60 * 400),
  },
  {
    id: '13',
    type: 'event',
    title: 'Config change pushed to feature-flags service - 12 flags updated',
    description: '',
    sources: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 450),
  },
  {
    id: 'search-3',
    type: 'action',
    domain: 'search',
    title: 'Zero-result rate for "usb-c hub" queries reduced from 34% to 2% — agent added field mappings for product_type aliases',
    description: '',
    sources: ['search-tuning'],
    timestamp: new Date(Date.now() - 1000 * 60 * 480),
  },
  {
    id: 'search-4',
    type: 'action',
    domain: 'search',
    title: 'Agent rebalanced index shards on products-v3 — query latency p99 improved from 420ms to 180ms',
    description: '',
    sources: ['index-mgmt'],
    timestamp: new Date(Date.now() - 1000 * 60 * 520),
  },
  {
    id: '14',
    type: 'insight',
    domain: 'observability',
    title: 'Disk I/O saturation on logging-node-7 - write queue depth at 94%',
    description: '',
    sources: ['os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 500),
  },
  {
    id: '15',
    type: 'event',
    domain: 'observability',
    title: 'Canary deployment started for CheckoutService v3.1.0 - 5% traffic routed',
    description: '',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 540),
  },
  {
    id: '16',
    type: 'action',
    domain: 'observability',
    title: 'Spot instance reclaimed for batch-processor-pool - replacement provisioning',
    description: '',
    sources: ['dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 600),
  },
  {
    id: '17',
    type: 'alert',
    domain: 'observability',
    title: 'DNS resolution failures spiking for partner-api.external.io - 15% error rate',
    description: '',
    sources: ['os233'],
    timestamp: new Date(Date.now() - 1000 * 60 * 660),
  },
  {
    id: '18',
    type: 'event',
    domain: 'observability',
    title: 'Scheduled maintenance window opened for RDS cluster aurora-prod-1',
    description: '',
    sources: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 720),
  },
  {
    id: '19',
    type: 'insight',
    domain: 'observability',
    title: 'Thread pool exhaustion risk on EmailDispatcher - active threads at 92% capacity',
    description: '',
    sources: ['os219', 'os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 780),
  },
  {
    id: '20',
    type: 'event',
    domain: 'security',
    title: 'WAF rule triggered - blocked 340 requests matching SQL injection pattern',
    description: '',
    sources: ['dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 840),
  },
  {
    id: '21',
    type: 'action',
    domain: 'observability',
    title: 'Horizontal pod autoscaler activated for recommendation-engine - target CPU 78%',
    description: '',
    sources: ['os233'],
    timestamp: new Date(Date.now() - 1000 * 60 * 900),
  },
  {
    id: '22',
    type: 'alert',
    domain: 'observability',
    title: 'Circuit breaker opened on InventoryService → WarehouseAPI dependency',
    description: '',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 960),
  },
  {
    id: '23',
    type: 'insight',
    domain: 'observability',
    title: 'Garbage collection pause times increasing on JVM service analytics-aggregator',
    description: '',
    sources: ['dd76-x5', 'os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 1020),
  },
  {
    id: '24',
    type: 'event',
    domain: 'observability',
    title: 'Blue-green swap completed for UserProfileService - green now active',
    description: '',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 1080),
  },
  {
    id: '25',
    type: 'insight',
    domain: 'observability',
    title: 'Network throughput anomaly on VPC peering link vpc-0a3f → vpc-7b2e',
    description: '',
    sources: ['os233', 'dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 1140),
  },
];

/* ── Helpers ── */

function formatTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m ago` : `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTimestamp(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = months[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${m} ${d}, ${y} @ ${h}:${min}:${s}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

/* ── Feed dot color by type ── */

function getFeedDotColor(type: string): string {
  switch (type) {
    case 'insight': return 'bg-amber-400';
    case 'event': return 'bg-emerald-400';
    case 'action': return 'bg-violet-500';
    case 'alert': return 'bg-red-500';
    default: return 'bg-slate-400';
  }
}

/* ── Feed row component ── */

const DOMAIN_LABELS: Record<string, { label: string; color: string }> = {
  observability: { label: 'Observability', color: 'bg-sky-100 text-sky-700' },
  search: { label: 'Search', color: 'bg-violet-100 text-violet-700' },
  security: { label: 'Security', color: 'bg-amber-100 text-amber-700' },
};

function FeedRow({ item, onClick }: { item: FeedItemExtended; onClick?: () => void }) {
  const domainInfo = item.domain ? DOMAIN_LABELS[item.domain] : null;
  return (
    <div onClick={onClick} className="group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 transition-colors hover:bg-white/60 cursor-pointer overflow-visible">
      {/* Floating "More actions" button — visible on hover */}
      <button className="absolute right-2 -top-3 z-10 flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs text-slate-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50">
        More actions
        <ChevronDown className="size-3" />
      </button>

      {/* Status dot + auto indicator */}
      <div className="flex size-4 shrink-0 items-center justify-center">
        {item.type === 'action' ? (
          <div className="relative flex items-center justify-center">
            <div className={`size-2 rounded-full ${getFeedDotColor(item.type)}`} />
            <Sparkles className="absolute -top-1.5 -right-1.5 size-2.5 text-violet-500" />
          </div>
        ) : (
          <div className={`size-2 rounded-full ${getFeedDotColor(item.type)}`} />
        )}
      </div>

      {/* Title + metadata */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-sm text-black truncate">{item.title}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {domainInfo && (
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${domainInfo.color}`}>
              {domainInfo.label}
            </span>
          )}
          {item.type === 'action' && (
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-violet-50 text-violet-600">
              Auto
            </span>
          )}
          {item.sources?.map((src, i) => (
            <span key={i} className="flex items-center gap-2">
              {(domainInfo || item.type === 'action' || i > 0) && <span className="h-3 w-px bg-slate-300" />}
              <span>{src}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
        <span>{formatTimeAgo(item.timestamp)}</span>
        <span className="h-3 w-px bg-slate-300" />
        <span>{formatTimestamp(item.timestamp)}</span>
      </div>
    </div>
  );
}

/* ── Feed list ── */

function FeedList({ items, isInvestigating = false, insightsReady = true, onStartWorkspace, onStartSearchWorkspace }: { items: FeedItemExtended[]; isInvestigating?: boolean; insightsReady?: boolean; onStartWorkspace?: () => void; onStartSearchWorkspace?: () => void }) {
  const [chartsExpanded, setChartsExpanded] = useState(false);
  return (
    <div className="h-full w-full overflow-y-auto scrollbar-none">
      <div className="flex flex-col gap-4 pt-4 pb-12" data-testid="feed-list">
        {/* Critical alert banner — only in investigating mode */}
        {isInvestigating && (
          <>
            {/* Wrapped: alert row + tags + chart */}
            <div onClick={insightsReady ? onStartWorkspace : undefined} className="group relative rounded-lg px-3 py-2 transition-colors hover:bg-white/60 cursor-pointer overflow-visible">
              {/* Floating "More actions" button */}
              <button className="absolute right-2 -top-3 z-10 flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs text-slate-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50">
                More actions
                <ChevronDown className="size-3" />
              </button>

              {/* Critical alert row */}
              <div className="flex items-center gap-3 w-full">
                <div className="flex size-4 shrink-0 items-center justify-center">
                  <div className="size-2 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-sm text-black truncate">
                    P95 latency for /api/v1/payments/process endpoint exceeds 2000ms (threshold: 800ms)
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>g6-667</span>
                    <span className="h-3 w-px bg-slate-300" />
                    <span>os219</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                  <span>5s ago</span>
                  <span className="h-3 w-px bg-slate-300" />
                  <span>Mar 6, 2026 @ 11:00:02</span>
                </div>
              </div>

              {/* Alert tags + Join workspace */}
              {insightsReady ? (
              <div className="flex items-center justify-between w-full mt-3 animate-in fade-in duration-500">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="size-4 text-red-600" />
                  <span className="rounded-lg bg-red-700 px-2 py-1.5 text-xs text-white">
                    Payment service
                  </span>
                  <span className="rounded-lg bg-red-700 px-2 py-1.5 text-xs text-white">
                    20,000 Impacted customers
                  </span>
                  <span className="rounded-lg bg-red-700 px-2 py-1.5 text-xs text-white">
                    Sev-1
                  </span>
                  <span className="rounded-lg bg-red-700 px-2 py-1.5 text-xs text-white">
                    Security risk
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setChartsExpanded((v) => !v); }}
                    className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-500 transition-colors hover:bg-slate-50"
                    aria-label={chartsExpanded ? 'Collapse charts' : 'Expand charts'}
                  >
                    {chartsExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>
                </div>
              </div>
              ) : (
              <div className="flex items-center gap-3 w-full mt-3">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#e0e7ff" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="url(#spinner-grad)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="spinner-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-sm bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent font-medium">
                  Generating initial hypothesis...
                </span>
              </div>
              )}

              {/* Charts side by side — only when insights ready, animated expand/collapse */}
              {insightsReady && (
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: chartsExpanded ? 200 : 0, opacity: chartsExpanded ? 1 : 0 }}
              >
              <div className="mt-5 grid grid-cols-2 gap-8">
                {/* P95 Latency chart */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-700">P95 Latency — /api/v1/payments/process</span>
                    <span className="text-xs font-semibold text-red-600">2,012ms</span>
                  </div>
                  <div className="relative h-[80px] w-full">
                    <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
                      <line x1="0" y1="48" x2="400" y2="48" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                      <line x1="0" y1="24" x2="400" y2="24" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#e2e8f0" strokeWidth="0.5" />
                      <path
                        d="M0,65 L30,64 L60,62 L90,60 L120,58 L150,55 L180,52 L210,48 L240,42 L270,34 L300,24 L330,16 L360,10 L390,8 L400,8 L400,80 L0,80 Z"
                        fill="url(#redGradient)"
                      />
                      <path
                        d="M0,65 L30,64 L60,62 L90,60 L120,58 L150,55 L180,52 L210,48 L240,42 L270,34 L300,24 L330,16 L360,10 L390,8 L400,8"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <circle cx="400" cy="8" r="3" fill="#ef4444" />
                      <circle cx="400" cy="13" r="5" fill="#ef4444" opacity="0.3">
                        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <defs>
                        <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span>-30m</span>
                    <span>-20m</span>
                    <span>-10m</span>
                    <span>Now</span>
                  </div>
                </div>

                {/* Request Breakdown — horizontal stacked bars */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-700">Request Breakdown</span>
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
              </div>
              )}
            </div>

            {/* Divider */}
            <div
              className="h-px mx-3 animate-pulse"
              style={{
                background: 'linear-gradient(90deg, #8b5cf6, #ef4444, #8b5cf6)',
                backgroundSize: '200% 100%',
                animation: 'gradientMove 3s ease-in-out infinite',
              }}
            />
          </>
        )}

        {items.map((item) => (
          <FeedRow key={item.id} item={item} onClick={item.id === 'search-1' ? onStartSearchWorkspace : undefined} />
        ))}
      </div>
    </div>
  );
}


/* ── Placeholder views ── */

/* ── Service node data ── */

interface ServiceNode {
  id: string;
  name: string;
  provider: string;
  requests: string;
  status: 'healthy' | 'warning' | 'error';
}

const SERVICE_MAP_ROWS: ServiceNode[][] = [
  [
    { id: 'logging', name: 'Logging Pipeline', provider: 'AWS-Kinesis', requests: '45.8K', status: 'error' },
    { id: 'sms', name: 'SMS Service', provider: 'Twilio', requests: '0.3K', status: 'error' },
    { id: 'image', name: 'ImageService', provider: 'Azure-AKS', requests: '6.2K', status: 'healthy' },
  ],
  [
    { id: 'frontend', name: 'pet-clinic-frontend-java', provider: 'AWS-ECS', requests: '12.0K', status: 'healthy' },
    { id: 'catalog', name: 'Catalog', provider: 'AWS-ECS', requests: '8.5K', status: 'healthy' },
    { id: 'auth', name: 'Auth Service', provider: 'AWS-Cognito', requests: '5.6K', status: 'healthy' },
    { id: 'order', name: 'OrderService', provider: 'AWS-ECS', requests: '4.3K', status: 'healthy' },
    { id: 'notification', name: 'Notification Service', provider: 'AWS-SNS', requests: '2.1K', status: 'healthy' },
  ],
  [
    { id: 'cloudfront', name: 'CloudFront CDN', provider: 'AWS-CloudFront', requests: '25.4K', status: 'healthy' },
    { id: 'redis', name: 'Redis Cache', provider: 'AWS-ElastiCache', requests: '15.2K', status: 'healthy' },
    { id: 'payment', name: 'Payment Service', provider: 'AWS-Lambda', requests: '3.1K', status: 'healthy' },
    { id: 'products-db', name: 'Products DB', provider: 'AWS-RDS', requests: '9.2K', status: 'healthy' },
    { id: 'user-db', name: 'User DB', provider: 'AWS-RDS', requests: '5.5K', status: 'healthy' },
  ],
  [
    { id: 'orders-db', name: 'Orders DB', provider: 'AWS-DynamoDB', requests: '7.6K', status: 'healthy' },
    { id: 'payment-db', name: 'Payment DB', provider: 'AWS-RDS', requests: '3.0K', status: 'healthy' },
    { id: 'stripe', name: 'Stripe API', provider: 'External', requests: '2.8K', status: 'healthy' },
    { id: 'email', name: 'Email Service', provider: 'AWS-SES', requests: '1.8K', status: 'healthy' },
  ],
];

const STATUS_DOT: Record<string, string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-400',
  error: 'bg-red-500',
};

function ServiceCard({ node, isInvestigating = false }: { node: ServiceNode; isInvestigating?: boolean }) {
  const effectiveStatus = isInvestigating
    ? INVESTIGATE_ERROR_NODES.has(node.id) ? 'error'
      : INVESTIGATE_WARN_NODES.has(node.id) ? 'warning'
      : node.status
    : node.status;
  return (
    <div
      data-node-id={node.id}
      className="flex w-[160px] flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${STATUS_DOT[effectiveStatus]}`} />
        <span className="truncate text-sm font-medium text-slate-900">{node.name}</span>
      </div>
      <span className="text-xs text-slate-500">{node.provider}</span>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400">Requests</div>
          <div className="text-sm font-semibold text-slate-800">{node.requests}</div>
        </div>
        <button className="text-xs text-blue-500 hover:underline">View</button>
      </div>
    </div>
  );
}

/* Connections between services: [from, to, isError?] — only adjacent rows, straight down */
const SERVICE_CONNECTIONS: [string, string, boolean?][] = [
  // Row 1 → Row 2
  ['logging', 'frontend', true],
  ['sms', 'catalog'],
  ['sms', 'auth'],
  ['image', 'order'],
  // Row 2 → Row 3
  ['frontend', 'cloudfront'],
  ['catalog', 'redis'],
  ['auth', 'payment'],
  ['order', 'products-db'],
  ['notification', 'user-db'],
  // Row 3 → Row 4
  ['cloudfront', 'orders-db'],
  ['redis', 'payment-db'],
  ['payment', 'stripe'],
  ['user-db', 'email'],
];

/* Connections that appear yellow/amber during investigation (impacted but not critical) */
const INVESTIGATE_WARN_CONNECTIONS = new Set([
  'sms->catalog', 'sms->auth', 'auth->payment', 'catalog->redis',
  'redis->payment-db', 'payment->stripe', 'order->products-db',
]);
/* Connections that appear red during investigation (critical) */
const INVESTIGATE_ERROR_CONNECTIONS = new Set([
  'frontend->cloudfront', 'cloudfront->orders-db', 'notification->user-db', 'user-db->email',
]);
/* Service nodes that turn warning (amber) during investigation */
const INVESTIGATE_WARN_NODES = new Set([
  'catalog', 'auth', 'redis', 'payment', 'payment-db', 'stripe', 'order', 'products-db',
]);
/* Service nodes that turn error (red) during investigation */
const INVESTIGATE_ERROR_NODES = new Set([
  'frontend', 'cloudfront', 'orders-db', 'notification', 'user-db', 'email',
]);

function ApplicationMapView({ isInvestigating = false }: { isInvestigating?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; isError: boolean; connKey: string }[]>([]);

  const computeLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newLines: typeof lines = [];

    for (const [fromId, toId, isError] of SERVICE_CONNECTIONS) {
      const fromEl = container.querySelector(`[data-node-id="${fromId}"]`);
      const toEl = container.querySelector(`[data-node-id="${toId}"]`);
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      newLines.push({
        x1: fromRect.left + fromRect.width / 2 - rect.left,
        y1: fromRect.top + fromRect.height / 2 - rect.top,
        x2: toRect.left + toRect.width / 2 - rect.left,
        y2: toRect.top + toRect.height / 2 - rect.top,
        isError: !!isError,
        connKey: `${fromId}->${toId}`,
      });
    }
    setLines(newLines);
  }, []);

  useEffect(() => {
    // Small delay to let layout settle
    const timer = setTimeout(computeLines, 100);
    window.addEventListener('resize', computeLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', computeLines);
    };
  }, [computeLines]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto scrollbar-none"
      data-testid="application-map-view"
    >
      {/* SVG connection lines */}
      <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full">
        <defs>
          <filter id="glow-green">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-yellow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lines.map((line, i) => {
          // Determine severity: in investigation mode, override colors for impacted connections
          const isWarn = isInvestigating && INVESTIGATE_WARN_CONNECTIONS.has(line.connKey);
          const isCrit = line.isError || (isInvestigating && INVESTIGATE_ERROR_CONNECTIONS.has(line.connKey));
          const color = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#94a3b8';
          const dotColor = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
          const glowFilter = isCrit ? 'url(#glow-red)' : isWarn ? 'url(#glow-yellow)' : 'url(#glow-green)';
          const dx = line.x2 - line.x1;
          const dy = line.y2 - line.y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          return (
            <g key={i}>
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
              {/* Animated dots traveling along the line */}
              {[0, 0.33, 0.66].map((offset, di) => {
                const dur = Math.max(2, len / 80);
                return (
                  <circle key={di} r={2.5} fill={dotColor} opacity={di === 0 ? 1 : 0.7} filter={glowFilter}>
                    <animateMotion
                      dur={`${dur}s`}
                      repeatCount="indefinite"
                      begin={`${offset * dur}s`}
                      path={`M${line.x1},${line.y1} L${line.x2},${line.y2}`}
                    />
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Service cards */}
      <div className="relative z-10 flex min-w-[900px] flex-col items-center gap-6 p-6">
        {SERVICE_MAP_ROWS.map((row, i) => (
          <div key={i} className="flex flex-wrap justify-center gap-4">
            {row.map((node) => (
              <ServiceCard key={node.id} node={node} isInvestigating={isInvestigating} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceView({ isInvestigating = false }: { isInvestigating?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  /*
   * Pipeline stages — the "height" value represents the relative volume
   * at each stage (100 → 90 → 3.4 → 3.2 → 0.1) which drives the curve shape.
   */
  const stages = isInvestigating
    ? [
        { label: 'Ingested Logs', count: '148K', sub: 'total events', pct: 100 },
        { label: 'Processed', count: '132K', sub: 'parsed & enriched', pct: 89 },
        { label: 'Anomalies', count: '4.7K', sub: 'detected', pct: 3.2 },
        { label: 'Correlated', count: '1.2K', sub: 'cross-service', pct: 0.8 },
        { label: 'Alerts', count: '86', sub: 'actionable', pct: 0.06 },
      ]
    : [
        { label: 'Ingested Logs', count: '152K', sub: 'total events', pct: 100 },
        { label: 'Processed', count: '148K', sub: 'parsed & enriched', pct: 97 },
        { label: 'Anomalies', count: '312', sub: 'detected', pct: 0.2 },
        { label: 'Correlated', count: '48', sub: 'cross-service', pct: 0.03 },
        { label: 'Alerts', count: '3', sub: 'actionable', pct: 0.002 },
      ];

  const categories = isInvestigating
    ? [
        { label: 'Active alerts', val: '86 · 3 services', color: '#ef4444' },
        { label: 'Healthy services', val: '5 of 8 · 62%', color: '#10b981' },
        { label: 'Suppressed noise', val: '127K · 86%', color: '#f59e0b' },
      ]
    : [
        { label: 'Active alerts', val: '3 · 1 service', color: '#f59e0b' },
        { label: 'Healthy services', val: '7 of 8 · 87%', color: '#10b981' },
        { label: 'Suppressed noise', val: '147K · 97%', color: '#10b981' },
      ];

  /* Build the smooth funnel SVG path.
   * The chart area is 800×180 viewBox. Each stage is a column.
   * The curve drops from full height to near-zero between stage 2 and 3. */
  const vw = 800;
  const vh = 180;
  const colW = vw / stages.length;
  const pad = 8;

  /* Heights at each stage boundary (top of the filled area, bottom is always vh) */
  const heights = stages.map((s) => {
    const h = (s.pct / 100) * (vh - pad * 2);
    return Math.max(h, 3);
  });

  /* Build smooth cubic bezier top-edge path */
  const topPoints = heights.map((h, i) => ({
    x: i * colW + colW / 2,
    y: vh - pad - h,
  }));

  let topPath = `M0,${topPoints[0].y}`;
  /* Extend to first point */
  topPath += ` L${topPoints[0].x},${topPoints[0].y}`;
  for (let i = 0; i < topPoints.length - 1; i++) {
    const p1 = topPoints[i];
    const p2 = topPoints[i + 1];
    const cpx1 = p1.x + (p2.x - p1.x) * 0.5;
    const cpx2 = p1.x + (p2.x - p1.x) * 0.5;
    topPath += ` C${cpx1},${p1.y} ${cpx2},${p2.y} ${p2.x},${p2.y}`;
  }
  /* Extend to right edge, then close along bottom */
  topPath += ` L${vw},${topPoints[topPoints.length - 1].y}`;
  const areaPath = topPath + ` L${vw},${vh} L0,${vh} Z`;

  /* Stage divider x positions */
  const dividers = stages.slice(1).map((_, i) => (i + 1) * colW);

  /* ── Service health data ── */
  const services = isInvestigating
    ? [
        { name: 'Logging Pipeline', reqs: '45.8K', latency: 210, errRate: 8.2, status: 'error' as const, trend: [50, 55, 65, 80, 95, 90, 88, 92, 98, 95, 90, 85] },
        { name: 'SMS Service', reqs: '0.3K', latency: 340, errRate: 12.5, status: 'error' as const, trend: [10, 15, 30, 60, 85, 90, 95, 88, 92, 98, 95, 90] },
        { name: 'Payment Service', reqs: '3.1K', latency: 120, errRate: 4.8, status: 'error' as const, trend: [20, 25, 35, 60, 80, 90, 85, 70, 82, 95, 88, 78] },
        { name: 'OrderService', reqs: '4.3K', latency: 88, errRate: 1.2, status: 'warning' as const, trend: [30, 35, 40, 55, 70, 65, 50, 45, 60, 75, 68, 55] },
        { name: 'pet-clinic-frontend', reqs: '12.0K', latency: 45, errRate: 0.1, status: 'healthy' as const, trend: [20, 22, 18, 25, 30, 28, 24, 22, 26, 30, 28, 25] },
        { name: 'Catalog', reqs: '8.5K', latency: 62, errRate: 0.3, status: 'healthy' as const, trend: [40, 38, 42, 45, 50, 48, 44, 42, 46, 50, 48, 45] },
        { name: 'Auth Service', reqs: '5.6K', latency: 32, errRate: 0.0, status: 'healthy' as const, trend: [15, 14, 16, 15, 17, 16, 14, 15, 16, 17, 15, 14] },
        { name: 'Redis Cache', reqs: '15.2K', latency: 3, errRate: 0.0, status: 'healthy' as const, trend: [60, 58, 62, 60, 64, 62, 58, 60, 62, 64, 60, 58] },
      ]
    : [
        { name: 'pet-clinic-frontend', reqs: '12.0K', latency: 42, errRate: 0.1, status: 'healthy' as const, trend: [22, 20, 18, 19, 21, 20, 19, 18, 20, 21, 19, 20] },
        { name: 'Catalog', reqs: '8.5K', latency: 58, errRate: 0.2, status: 'healthy' as const, trend: [40, 38, 39, 41, 42, 40, 39, 38, 40, 41, 39, 40] },
        { name: 'Auth Service', reqs: '5.6K', latency: 28, errRate: 0.0, status: 'healthy' as const, trend: [14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15] },
        { name: 'Redis Cache', reqs: '15.2K', latency: 3, errRate: 0.0, status: 'healthy' as const, trend: [60, 58, 59, 60, 61, 60, 59, 58, 60, 61, 59, 60] },
        { name: 'Payment Service', reqs: '3.1K', latency: 65, errRate: 0.3, status: 'healthy' as const, trend: [30, 28, 29, 31, 32, 30, 29, 28, 30, 31, 29, 30] },
        { name: 'OrderService', reqs: '4.3K', latency: 52, errRate: 0.4, status: 'healthy' as const, trend: [25, 24, 26, 25, 27, 26, 24, 25, 26, 27, 25, 24] },
        { name: 'Logging Pipeline', reqs: '45.8K', latency: 78, errRate: 0.8, status: 'warning' as const, trend: [35, 38, 40, 42, 45, 43, 40, 38, 42, 45, 43, 40] },
        { name: 'SMS Service', reqs: '0.3K', latency: 95, errRate: 0.5, status: 'healthy' as const, trend: [18, 20, 19, 21, 22, 20, 19, 18, 20, 21, 19, 20] },
      ];

  const statusColors = { healthy: '#10b981', warning: '#f59e0b', error: '#ef4444' };
  const maxLatency = 400;

  const AreaSparkline = ({ data, color, width = 120, height = 32, delay = 0 }: { data: number[]; color: string; width?: number; height?: number; delay?: number }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * width, y: height - ((v - min) / range) * (height - 4) - 2 }));
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      d += ` C${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`;
    }
    const fill = d + ` L${width},${height} L0,${height} Z`;
    const uid = `sg-${color.replace('#', '')}-${delay}`;
    return (
      <svg width={width} height={height} className="shrink-0 overflow-visible">
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
          <clipPath id={`clip-${uid}`}>
            <rect x="0" y="0" width="0" height={height}>
              <animate attributeName="width" from="0" to={width} dur="0.8s" begin={`${delay}s`} fill="freeze" />
            </rect>
          </clipPath>
          <filter id={`glow-${uid}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g clipPath={`url(#clip-${uid})`}>
          <path d={fill} fill={`url(#${uid})`}>
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
          </path>
          <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" filter={`url(#glow-${uid})`}>
            <animate attributeName="opacity" values="0.75;1;0.75" dur="3s" repeatCount="indefinite" />
          </path>
          {/* Pulsing dot at the end of the sparkline */}
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill={color}>
            <animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    );
  };

  return (
    <div className="flex h-full flex-col gap-0 overflow-auto scrollbar-none" data-testid="service-view">
      {/* ── Stage labels row ── */}
      <div className="flex">
        {stages.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 text-center"
            style={{
              opacity: 0,
              animation: `fadeInRight 0.4s ease-out ${i * 0.1}s forwards`,
            }}
          >
            <div className="text-[11px] font-medium text-slate-500">{s.label}</div>
            <div className="text-base font-bold text-slate-800">{s.count}</div>
            {s.sub && <div className="text-[10px] text-slate-400">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* SVG funnel area chart */}
      <div className="relative mt-1">
        <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full" style={{ height: 160 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="funnel-grad" x1="0" y1="0" x2="1" y2="0">
              {isInvestigating ? (
                <>
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="20%" stopColor="#818cf8" stopOpacity={0.4} />
                  <stop offset="40%" stopColor="#a78bfa" stopOpacity={0.25} />
                  <stop offset="70%" stopColor="#c4b5fd" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#ddd6fe" stopOpacity={0.06} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="20%" stopColor="#34d399" stopOpacity={0.35} />
                  <stop offset="40%" stopColor="#6ee7b7" stopOpacity={0.22} />
                  <stop offset="70%" stopColor="#a7f3d0" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#d1fae5" stopOpacity={0.06} />
                </>
              )}
            </linearGradient>
            <linearGradient id="funnel-stroke-grad" x1="0" y1="0" x2="1" y2="0">
              {isInvestigating ? (
                <>
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#c4b5fd" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#a7f3d0" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Filled area */}
          <clipPath id="funnel-clip">
            <rect x="0" y="0" width="0" height={vh}>
              <animate attributeName="width" from="0" to={vw} dur="1.2s" fill="freeze" />
            </rect>
          </clipPath>
          {/* Breathing glow filter for the funnel */}
          <filter id="funnel-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Shimmer gradient that travels along the stroke */}
          <linearGradient id="funnel-shimmer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity={0}>
              <animate attributeName="offset" values="-0.3;1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="5%" stopColor="white" stopOpacity={0.4}>
              <animate attributeName="offset" values="-0.25;1.05" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="10%" stopColor="white" stopOpacity={0}>
              <animate attributeName="offset" values="-0.2;1.1" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <g clipPath="url(#funnel-clip)">
            {/* Area fill with breathing opacity */}
            <path d={areaPath} fill="url(#funnel-grad)">
              <animate attributeName="opacity" values="0.85;1;0.85" dur="4s" repeatCount="indefinite" />
            </path>
            {/* Main stroke */}
            <path d={topPath} fill="none" stroke="url(#funnel-stroke-grad)" strokeWidth={2} filter="url(#funnel-glow)">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
            </path>
            {/* Shimmer overlay on stroke */}
            <path d={topPath} fill="none" stroke="url(#funnel-shimmer)" strokeWidth={3} opacity={0.6} />
          </g>

          {/* Stage divider lines */}
          {dividers.map((x, i) => (
            <line key={i} x1={x} y1={0} x2={x} y2={vh} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.4} />
          ))}
        </svg>

        {/* Right-side category labels overlaid */}
        <div className="absolute right-3 top-2 flex flex-col gap-3">
          {categories.map((c, i) => (
            <div
              key={c.label}
              className="text-right"
              style={{
                opacity: 0,
                animation: `fadeInRight 0.5s ease-out ${0.6 + i * 0.15}s forwards`,
              }}
            >
              <div className="text-xs font-semibold" style={{ color: c.color }}>{c.label}</div>
              <div className="text-[10px] text-slate-400">{c.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex items-center gap-1 py-1.5 text-xs text-slate-500">
        <span>Signal-to-noise: <span className={`font-semibold ${isInvestigating ? 'text-indigo-600' : 'text-emerald-600'}`}>{isInvestigating ? '0.06%' : '0.002%'}</span></span>
        <span className="text-slate-300">·</span>
        <span>Noise suppressed: <span className={`font-semibold ${isInvestigating ? 'text-amber-500' : 'text-emerald-500'}`}>{isInvestigating ? '86%' : '97%'}</span></span>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100 my-2" />

      {/* ── Service Health ── */}
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-semibold text-slate-800">Service Health</h3>
        <span className="text-xs text-slate-400">Last 30 min</span>
      </div>

      <div className="flex flex-col">
        {services.map((svc, idx) => (
          <div key={svc.name} className="flex items-center gap-4 py-2.5 hover:bg-slate-50/40 transition-colors -mx-1 px-1 rounded">
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-3 w-3 rounded-full opacity-20 animate-ping" style={{ backgroundColor: statusColors[svc.status] }} />
              <span className="relative h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[svc.status] }} />
            </div>
            <div className="w-40 shrink-0">
              <div className="text-sm font-medium text-slate-800">{svc.name}</div>
              <div className="text-[11px] text-slate-400">{svc.reqs} req/s</div>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full svc-bar-pulse"
                  style={{
                    width: mounted ? `${Math.min((svc.latency / maxLatency) * 100, 100)}%` : '0%',
                    background: svc.status === 'error'
                      ? 'linear-gradient(90deg, #fca5a5, #ef4444)'
                      : svc.status === 'warning'
                      ? 'linear-gradient(90deg, #fde68a, #f59e0b)'
                      : 'linear-gradient(90deg, #a7f3d0, #10b981)',
                    transition: `width 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.3 + idx * 0.08}s`,
                    animationDelay: `${idx * 0.3}s`,
                  }}
                />
              </div>
              <span className="text-xs text-slate-500 w-12 text-right">{svc.latency}ms</span>
            </div>
            <div className={`w-14 text-right text-xs font-semibold ${svc.status === 'error' ? 'text-red-500' : svc.status === 'warning' ? 'text-amber-500' : 'text-slate-400'}`}>
              {svc.errRate}%
            </div>
            <AreaSparkline data={svc.trend} color={statusColors[svc.status]} delay={0.4 + idx * 0.08} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── View Toggle Group ── */

function ViewToggleGroup({
  activeView,
  onViewChange,
}: {
  activeView: string;
  onViewChange: (view: string) => void;
}) {
  const views = [
    { id: 'feed', icon: ListChecks },
    { id: 'applicationMap', icon: Network },
    { id: 'service', icon: Server },
  ];

  return (
    <div className="flex items-center rounded-lg overflow-hidden" data-testid="view-toggle">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = activeView === view.id;
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`flex items-center justify-center p-2 ${
              isActive ? 'bg-white' : 'bg-slate-50'
            } transition-colors hover:bg-white`}
            aria-label={view.id}
          >
            <Icon className={`size-4 ${isActive ? 'text-blue-600' : 'text-oui-dark-shade'}`} />
          </button>
        );
      })}
    </div>
  );
}

/* ── Main HomePage component ── */

export function HomePage({ investigatingOverride = false }: { investigatingOverride?: boolean }) {
  const { state: ollyState } = useOllyState();
  const { createWorkspace, addCanvasPage, addConversation } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const fromWorkspace = (location.state as { fromWorkspace?: boolean })?.fromWorkspace ?? false;
  const [textValue, setTextValue] = useState('');
  const [configOpen, setConfigOpen] = useState(false);
  const [activeView, setActiveView] = useState('feed');
  const [inputExpanded, setInputExpanded] = useState(!fromWorkspace);
  const [navMode, setNavMode] = useState<'collapsed' | 'expanded'>('collapsed');
  const [askOllyExpanded, setAskOllyExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  // Collapse textarea back to "Ask Olly" when user scrolls down a certain amount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const delta = currentScrollTop - lastScrollTopRef.current;

      // If scrolling down by more than 80px from where they last were, collapse
      if (delta > 80 && askOllyExpanded) {
        setAskOllyExpanded(false);
        textareaRef.current?.blur();
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [askOllyExpanded]);

  useEffect(() => {
    if (fromWorkspace) {
      const frame = requestAnimationFrame(() => setInputExpanded(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [fromWorkspace]);

  useAlertInvestigation();

  const isInvestigating = investigatingOverride || ollyState === 'investigating';
  const [insightsReady, setInsightsReady] = useState(!isInvestigating);

  useEffect(() => {
    if (isInvestigating && !insightsReady) {
      const timer = setTimeout(() => setInsightsReady(true), 6000);
      return () => clearTimeout(timer);
    }
  }, [isInvestigating, insightsReady]);

  const handlePromptClick = (text: string) => {
    setTextValue(text);
    setAskOllyExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSubmit = () => {
    if (!textValue.trim()) return;
    try {
      const workspace = createWorkspace(textValue.trim());
      setTextValue('');
      navigate(`/workspace/${workspace.id}`, { state: { fromHome: true } });
    } catch {
      toast.error('Failed to create workspace. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    navigate(`/workspace/${workspaceId}`, { state: { fromHome: true } });
  };

  const handleStartInvestigationWorkspace = () => {
    const workspace = createWorkspace('P95 Latency Investigation');
    workspace.dataSources = [{ id: crypto.randomUUID(), name: 'Investigation', type: 'investigation' }];

    const presetPages: import('@/types').CanvasPage[] = [
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        title: 'Summary',
        order: 0,
        addedBy: 'olly',
        addedAt: new Date(),
        content: `# P95 Latency Alert — Payment Processing Service\n\nEndpoint /api/v1/payments/process has breached the 800ms latency threshold. Current P95 is 2,012ms, sustained for 13 minutes.\n\n> ⚠️ This incident correlates with the PaymentService v3.8.2 deployment at 10:42 UTC. Immediate attention required.\n\n[tags:Payment service|20,000 Impacted customers|Sev-1|Security risk]\n\n[chart]\n\n---\n\n## Impact\n\n- Checkout completion rate dropped from 94% → 31%\n- ~20,000 customers affected during peak traffic window\n- Downstream services (receipt generation, inventory reservation) experiencing cascading timeouts\n- 💰 Estimated revenue impact: ~$48K/min\n\n[bar:31:100:bg-red-500:Checkout Completion Rate]\n\n---\n\n## What Olly Has Investigated\n\n- ✅ Confirmed latency spike is isolated to /payments/process — other payment endpoints are healthy\n- ✅ Correlated with PaymentService v3.8.2 deployment at 10:42 UTC\n- ✅ Database connection pool for payments-db-primary at 97% saturation\n- ✅ No infrastructure issues detected (CPU 42%, Memory 61%, Network normal)\n- ✅ Upstream dependencies (Stripe API, fraud-check service) responding normally\n- ✅ Identified new ORM query pattern in v3.8.2 that opens 3x connections per transaction\n\n---\n\n## Hypotheses\n\n- 🔴 DB Connection Pool Exhaustion — v3.8.2 introduced a new ORM pattern opening 3 parallel connections per transaction instead of 1, pushing pool utilization from 45% to 97% [view:Hypothesis: DB Connection Pool Exhaustion]\n- 🟠 Lock Contention on Payment Records — A new row-level locking strategy acquires exclusive locks earlier in the transaction, causing 68% of handler threads to enter WAITING state [view:Hypothesis: Lock Contention on Payment Records]\n\n---\n\n## Suggested Next Steps\n\n- Roll back PaymentService v3.8.2 → v3.8.1 to restore normal latency\n- Investigate new database query pattern in v3.8.2 causing connection pool exhaustion\n- Scale up payments-db connection pool as temporary mitigation\n- Enable circuit breaker on checkout flow to prevent cascading failures\n- Review the 2 hypothesis pages for detailed evidence and validation steps`,
      },
      {
        id: crypto.randomUUID(),
        type: 'dashboard',
        title: 'Dashboard',
        order: 1,
        content: 'mock-dashboard',
        addedBy: 'olly',
        addedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'hypothesis',
        title: 'Hypothesis: DB Connection Pool Exhaustion',
        order: 2,
        addedBy: 'olly',
        addedAt: new Date(),
        content: `> The v3.8.2 deployment introduced a new ORM query pattern that opens multiple database connections per transaction instead of reusing a single connection, causing pool saturation at 97%.\n\n[bar:97:100:bg-red-500:DB Connection Pool Utilization]\n\n[bar:45:100:bg-emerald-500:Baseline Pool Utilization (2 weeks avg)]\n\n---\n\n## Supporting Evidence\n\n- Connection pool utilization jumped from 45% to 97% within 5 minutes of the v3.8.2 deployment\n- The v3.8.2 changelog includes a refactor of the payment validation logic that splits a single transaction into 3 parallel sub-queries\n- Historical data shows connection pool usage was stable at 40–50% for the past 2 weeks under similar traffic\n- Active connections per request increased from 1 to 3.2 (average) post-deployment\n\n---\n\n## How to Validate\n\n- Compare the DB connection acquisition pattern between v3.8.1 and v3.8.2 in the service traces\n- Check if rolling back to v3.8.1 restores connection pool utilization to baseline\n- Run a load test against v3.8.2 in staging with connection pool monitoring enabled`,
      },
      {
        id: crypto.randomUUID(),
        type: 'hypothesis',
        title: 'Hypothesis: Lock Contention on Payment Records',
        order: 3,
        addedBy: 'olly',
        addedAt: new Date(),
        content: `> A new row-level locking strategy in v3.8.2 acquires exclusive locks earlier in the transaction lifecycle, causing concurrent payment requests to queue behind each other.\n\n[bar:68:100:bg-red-500:Payment Handler Threads in WAITING State]\n\n---\n\n## Supporting Evidence\n\n- Database slow query logs show a 12x increase in lock wait times on the payments table since 10:42 UTC\n- The P95 latency spike correlates more strongly with concurrent request count than with total request volume\n- Thread dump analysis shows 68% of payment handler threads are in WAITING state on DB lock acquisition\n- The issue is more pronounced during burst traffic patterns (consistent with lock convoy behavior)\n\n---\n\n## How to Validate\n\n- Analyze the payments table lock statistics before and after the deployment\n- Check if reducing max concurrent payment threads alleviates the latency (would confirm contention)\n- Review the v3.8.2 diff for changes to transaction isolation level or locking hints`,
      },
    ];

    presetPages.forEach((page) => addCanvasPage(workspace.id, page));

    const ollyWelcomeMessage: import('@/types').ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'olly',
      text: `I've set up this workspace to investigate the P95 latency spike on /api/v1/payments/process. Here's what I found so far:\n\n• Current P95 latency is 2,012ms — well above the 800ms threshold\n• The spike correlates with the PaymentService v3.8.2 deployment at 10:42 UTC\n• DB connection pool is at 97% saturation, up from a 45% baseline\n• ~20,000 customers are affected, with checkout completion dropping to 31%\n\nI've prepared a Summary page with full details, a Dashboard for live metrics, and two Hypothesis pages exploring likely root causes (connection pool exhaustion and lock contention).\n\nLet me know how you'd like to proceed — I can help with rollback analysis, deeper trace inspection, or anything else.`,
      timestamp: new Date(),
    };

    addConversation(workspace.id, 'P95 Latency Investigation', [ollyWelcomeMessage]);

    navigate(`/workspace/${workspace.id}`, { state: { fromHome: true, investigating: true } });
  };

  const handleStartSearchWorkspace = () => {
    const workspace = createWorkspace('Search CTR Investigation — "wireless headphones"');
    workspace.icon = '🔍';
    workspace.dataSources = [{ id: crypto.randomUUID(), name: 'Search Analytics', type: 'search' }];

    const presetPages: import('@/types').CanvasPage[] = [
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        title: 'Summary',
        order: 0,
        addedBy: 'olly',
        addedAt: new Date(),
        content: `# Search CTR Investigation — "wireless headphones"\n\nUBI analytics detected a significant click-through rate drop on the query "wireless headphones" — from 12.4% to 3.1% over the past 7 days, affecting ~18,000 daily searches.\n\n> 🔍 The agent autonomously analyzed UBI event data, generated hypotheses, tested query modifications against evaluation sets, and deployed an improved query configuration.\n\n[search-tags:ecommerce-prod|UBI Analytics|CTR Drop 75%|~18K daily searches]\n\n[search-ctr-chart]\n\n---\n\n## Impact\n\n- Click-through rate dropped from 12.4% → 3.1% (75% decline)\n- ~18,000 daily searches affected — "wireless headphones" is a top-20 query\n- Conversion rate on this query fell from 4.2% to 0.8%\n- 💰 Estimated revenue impact: ~$12K/day in lost conversions\n\n[bar:3:100:bg-red-500:Current CTR (3.1%)]\n[bar:12:100:bg-emerald-500:Baseline CTR (12.4%)]\n\n---\n\n## What the Agent Investigated\n\n- ✅ Analyzed 7-day UBI click stream for "wireless headphones" — 126,000 search events\n- ✅ Identified result set shift after index mapping change on Mar 5 — product_category field analyzer was modified\n- ✅ Top-10 results now dominated by accessories (cases, cables) instead of actual headphones\n- ✅ Compared current BM25 scoring with pre-change baseline — relevance drift confirmed\n- ✅ Tested 4 query reformulations against offline evaluation set (1,200 judged queries)\n- ✅ Best candidate: boosted product_name match + category filter reweight — CTR predicted at 14.1%\n\n---\n\n## Evaluation Results\n\n[search-comparison-table]\n\n---\n\n## Hypotheses\n\n- 🔴 Analyzer Change Impact — The Mar 5 mapping update changed the product_category analyzer from keyword to standard, causing category tokens to fragment and BM25 to over-score accessories [view:Hypothesis: Analyzer Change Impact]\n- 🟢 Query Boost Fix (Deployed) — Boosting product_name^3 with a category reweight function restored headphone products to top positions — validated against 1,200 judged queries with NDCG@10 improvement from 0.34 to 0.78 [view:Hypothesis: Query Boost Fix]\n\n---\n\n## Actions Taken\n\n- Agent deployed query boost configuration to ecommerce-prod search pipeline\n- A/B test running: 50% traffic on new config, 50% on baseline\n- Early results (2 hours): CTR at 13.8% on treatment group vs 3.1% on control\n- Full evaluation scheduled for 24-hour mark`,
      },
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        title: 'Hypothesis: Analyzer Change Impact',
        order: 1,
        addedBy: 'olly',
        addedAt: new Date(),
        content: `# Hypothesis: Analyzer Change Impact\n\n> The index mapping change on Mar 5 modified the product_category field analyzer from "keyword" to "standard", causing category values like "Wireless Headphones" to be tokenized into ["wireless", "headphones"]. This made BM25 over-score accessories that mention "wireless" in their category.\n\n[bar:75:100:bg-red-500:Results containing accessories (post-change)]\n[bar:15:100:bg-emerald-500:Results containing accessories (pre-change)]\n\n---\n\n## Supporting Evidence\n\n- The mapping change was deployed Mar 5 at 14:22 UTC — CTR decline began within 2 hours\n- Before the change, "Wireless Headphones" was stored as a single keyword token — exact match only\n- After the change, "wireless" and "headphones" became separate tokens, matching any product with either term in its category\n- Accessories like "wireless charging cable" and "headphone case" now score equally to actual wireless headphones\n- Top-10 result overlap between pre and post change: only 3 of 10 products remain the same\n\n---\n\n## Validation\n\n- Reverted the analyzer on a shadow index and re-ran the query — original result ranking restored\n- NDCG@10 on shadow index: 0.76 (matching pre-change baseline)\n- Confirmed root cause: analyzer change is the primary driver of relevance drift`,
      },
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        title: 'Hypothesis: Query Boost Fix',
        order: 2,
        addedBy: 'olly',
        addedAt: new Date(),
        content: `# Hypothesis: Query Boost Fix (Deployed)\n\n> Rather than reverting the analyzer (which other queries depend on), the agent tested a targeted query-time fix: boosting product_name matches and adding a category reweight function to prefer exact category matches.\n\n[bar:78:100:bg-emerald-500:NDCG@10 — With Boost Fix (0.78)]\n[bar:34:100:bg-red-500:NDCG@10 — Current Production (0.34)]\n[bar:76:100:bg-blue-500:NDCG@10 — Pre-change Baseline (0.76)]\n\n---\n\n## Query Modifications Tested\n\n- Variant A: product_name^2 boost — NDCG@10: 0.58 (partial improvement)\n- Variant B: product_name^3 boost — NDCG@10: 0.71 (good but accessories still leak in)\n- Variant C: product_name^3 + category exact match reweight — NDCG@10: 0.78 ✅ (best)\n- Variant D: function_score with category decay — NDCG@10: 0.72 (over-penalizes related products)\n\n---\n\n## Evaluation Against Query Sets\n\n- Tested against 1,200 human-judged query-document pairs\n- Variant C outperformed all others across NDCG@10, Precision@5, and MRR\n- No regression detected on related queries ("bluetooth headphones", "noise cancelling headphones", "earbuds")\n- Variant C deployed to production search pipeline with A/B test wrapper\n\n---\n\n## Current A/B Test Status\n\n- Treatment (Variant C): CTR 13.8%, Conversion 4.0%\n- Control (current prod): CTR 3.1%, Conversion 0.8%\n- Statistical significance: p < 0.001 after 2 hours\n- Full 24-hour evaluation in progress`,
      },
    ];

    presetPages.forEach((page) => addCanvasPage(workspace.id, page));

    const ollyWelcomeMessage: import('@/types').ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'olly',
      text: `I've set up this workspace to walk through the search CTR investigation on "wireless headphones". Here's the summary:\n\n• UBI data showed CTR dropped from 12.4% to 3.1% over 7 days\n• Root cause: a Mar 5 index mapping change altered the product_category analyzer, causing relevance drift\n• I tested 4 query reformulations against 1,200 judged queries\n• Best fix: product_name^3 boost + category reweight — NDCG@10 improved from 0.34 to 0.78\n• Fix is deployed with an A/B test — early results show CTR at 13.8% on treatment\n\nThe Summary page has the full analysis with UBI charts and evaluation results. The two hypothesis pages detail the root cause and the fix.\n\nLet me know if you'd like to explore the query variants, see the raw UBI data, or adjust the boost configuration.`,
      timestamp: new Date(),
    };

    addConversation(workspace.id, 'Search CTR Investigation', [ollyWelcomeMessage]);

    navigate(`/workspace/${workspace.id}`, { state: { fromHome: true } });
  };

  const overlayGradient = isInvestigating
    ? 'linear-gradient(161deg, rgba(255,255,255,0.3) 5%, rgba(222,201,255,0.3) 27%, rgba(255,255,255,0.3) 52%, rgba(229,229,229,0.3) 83%)'
    : 'linear-gradient(161deg, rgba(255,255,255,0.3) 5%, rgba(204,230,255,0.3) 27%, rgba(255,255,255,0.3) 52%, rgba(229,229,229,0.3) 83%)';

  return (
    <div
      className={`flex h-screen ${isInvestigating ? 'animate-gradient-bg-investigating' : 'animate-gradient-bg'}`}
      data-testid="home-page"
    >
      {/* Frosted overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: overlayGradient }}
      />

      {/* Left Navigation */}
      <LeftNav
        mode={navMode}
        onWorkspaceClick={handleWorkspaceClick}
        onHomeClick={() => {}}
        onExpandClick={() => setNavMode('expanded')}
        onCollapseClick={() => setNavMode('collapsed')}
        showHomeButton={false}
        animate={fromWorkspace}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-between pb-6 pt-12">
          {/* Scrollable content */}
          <div className="flex flex-1 flex-col items-center gap-6 w-[1000px] max-w-full px-6 overflow-y-auto">
            {/* Olly Icon */}
            <OllyIcon size="large" logoSrc={isInvestigating ? (insightsReady ? './image/Logo-v2.svg' : './image/Logo-v3.svg') : undefined} />

            {/* Greeting row + view toggle + config */}
            <div className="flex w-full items-center justify-between">
              <h1
                className="text-base font-bold text-black tracking-tight"
                data-testid="greeting"
              >
                {isInvestigating
                  ? 'Hi, I\'m Olly. Here are my insights on the disruptions I\'ve been investigating for you:'
                  : `${getGreeting()}! I'm Olly. Here are the latest insights I've gathered for you:`}
              </h1>
              <div className="flex items-center gap-3 shrink-0">
                {/* Status badge */}
                <div
                  className={`flex items-center gap-2 px-3 h-8 rounded-lg border ${
                    isInvestigating
                      ? 'border-red-400 bg-red-500/10 text-red-600'
                      : 'border-green-400 bg-green-500/10 text-green-600'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                        isInvestigating ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        isInvestigating ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                  </span>
                  <span className="text-sm font-medium">
                    {isInvestigating ? 'Alert' : 'Live'}
                  </span>
                </div>
                <button
                  onClick={() => setConfigOpen((v) => !v)}
                  className="flex items-center justify-center rounded-lg bg-white p-2 transition-colors hover:bg-slate-50"
                  data-testid="config-button"
                  aria-label="Alert configuration"
                >
                  <ShieldAlert className="size-4 text-oui-dark-shade" />
                </button>
                <ViewToggleGroup activeView={activeView} onViewChange={setActiveView} />
              </div>
            </div>

            {/* Content area based on active view */}
            <div className="w-full flex-1 overflow-hidden mb-10">
              {activeView === 'feed' && (
                <FeedList items={MOCK_FEED_ITEMS} isInvestigating={isInvestigating} insightsReady={insightsReady} onStartWorkspace={handleStartInvestigationWorkspace} onStartSearchWorkspace={handleStartSearchWorkspace} />
              )}
              {activeView === 'applicationMap' && <ApplicationMapView isInvestigating={isInvestigating} />}
              {activeView === 'service' && <ServiceView isInvestigating={isInvestigating} />}
            </div>
          </div>

          {/* Bottom: Ask Olly input + Suggested Prompts */}
          <div className="w-[1000px] max-w-full px-6 shrink-0">
            {/* Compact "Ask Olly" row — fades/slides out when expanded */}
            <div
              className="flex items-center gap-3 flex-nowrap overflow-x-auto scrollbar-none transition-all duration-300 ease-in-out"
              style={{
                opacity: askOllyExpanded ? 0 : 1,
                maxHeight: askOllyExpanded ? 0 : 40,
                marginBottom: askOllyExpanded ? 0 : 0,
                pointerEvents: askOllyExpanded ? 'none' : 'auto',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => {
                  setAskOllyExpanded(true);
                  setTimeout(() => textareaRef.current?.focus(), 200);
                }}
                className="flex h-8 w-[160px] shrink-0 items-center gap-2 rounded-lg bg-white pl-3 pr-3 text-xs text-slate-400 tracking-tight transition-colors hover:bg-slate-50"
                data-testid="ask-olly-button"
              >
                <span className="flex-1 text-left truncate leading-[18px]">Ask Olly</span>
                <Mic className="size-4 shrink-0" />
              </button>
              <SuggestedPrompts onPromptClick={handlePromptClick} />
            </div>

            {/* Expanded textarea — grows in when expanded */}
            <div
              className="flex flex-col gap-3 transition-all duration-300 ease-in-out origin-bottom"
              style={{
                opacity: askOllyExpanded ? 1 : 0,
                maxHeight: askOllyExpanded ? 200 : 0,
                transform: askOllyExpanded ? 'translateY(0)' : 'translateY(8px)',
                pointerEvents: askOllyExpanded ? 'auto' : 'none',
                overflow: 'hidden',
              }}
            >
              <SuggestedPrompts onPromptClick={handlePromptClick} />
              <div
                className="flex flex-col rounded-lg bg-white transition-[max-width] duration-300 ease-in-out"
                style={{ maxWidth: inputExpanded ? 1000 : 360 }}
                data-testid="input-group"
              >
                <textarea
                  ref={textareaRef}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Olly anything. Type / for quick actions."
                  rows={1}
                  style={{ height: 64 }}
                  className="w-full resize-none border-0 bg-transparent px-3 pt-3 pb-1 text-xs text-oui-darkest-shade placeholder:text-slate-500 focus:outline-none"
                  data-testid="home-text-area"
                />
                <div className="flex items-center justify-between px-3 pb-3 pt-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:bg-slate-50"
                      aria-label="Attach"
                    >
                      <Plus className="size-4" />
                    </button>
                    <button
                      className="flex size-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                      aria-label="Mention"
                    >
                      <AtSign className="size-4" />
                    </button>
                    <button
                      className="flex size-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                      aria-label="Command"
                    >
                      <SquareSlash className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        setAskOllyExpanded(false);
                        setTextValue('');
                      }}
                      className="flex size-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                      aria-label="Minimize"
                    >
                      <Minimize2 className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex size-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600"
                      aria-label="Voice input"
                    >
                      <Mic className="size-4" />
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!textValue.trim()}
                      className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                      aria-label="Send message"
                      data-testid="send-button"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert & Skills Panel */}
        <AlertSkillsPanel open={configOpen} onClose={() => setConfigOpen(false)} />
      </main>
    </div>
  );
}

