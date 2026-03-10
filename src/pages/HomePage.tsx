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
  Ellipsis,
} from 'lucide-react';
import { LeftNav } from '@/components/LeftNav';
import { OllyIcon } from '@/components/OllyIcon';
import { SuggestedPrompts } from '@/components/SuggestedPrompts';
import { ConfigPanel } from '@/components/ConfigPanel';
import { AlertSkillsPanel } from '@/components/AlertSkillsPanel';
import { useOllyState } from '@/contexts/OllyStateContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAlertInvestigation } from '@/hooks/useAlertInvestigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { FeedItem } from '@/types';

/* ── Mock data ── */

interface FeedItemExtended extends FeedItem {
  domain?: string;
  sources?: string[];
}

const MOCK_FEED_ITEMS: FeedItemExtended[] = [
  {
    id: '1',
    type: 'event',
    title: 'Cost anomaly: Lambda invocations up 40% in last hour',
    description: '',
    domain: 'otel-domain',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '2',
    type: 'insight',
    title: 'SMS Service timeout errors spiking - upstream Twilio degradation detected',
    description: '',
    domain: 'os-domain',
    sources: ['dd76-x5', 'os233'],
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '3',
    type: 'event',
    title: 'Deployment completed for OrderService v2.4.1 - all health checks passing',
    description: '',
    domain: 'otel-domain',
    sources: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: '4',
    type: 'insight',
    title: 'Payment Service error rate correlates with DB connection pool saturation',
    description: '',
    domain: 'otel-domain',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 123),
  },
  {
    id: '5',
    type: 'scaling',
    title: 'Auto-scaling triggered for Catalog service - 3 new instances',
    description: '',
    domain: 'test-domain',
    sources: ['os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 144),
  },
  {
    id: '6',
    type: 'event',
    title: 'Kubernetes pod restart detected for auth-proxy in us-east-1',
    description: '',
    domain: 'otel-domain',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    id: '7',
    type: 'insight',
    title: 'Memory leak pattern detected in NotificationWorker - steady 2% growth per hour',
    description: '',
    domain: 'os-domain',
    sources: ['dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
  },
  {
    id: '8',
    type: 'event',
    title: 'SSL certificate renewed for api.prod.internal - expires in 90 days',
    description: '',
    domain: 'test-domain',
    sources: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
  },
  {
    id: '9',
    type: 'insight',
    title: 'Cache hit ratio dropped below 70% on Redis cluster-3 - possible key eviction storm',
    description: '',
    domain: 'otel-domain',
    sources: ['os233', 'os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 290),
  },
  {
    id: '10',
    type: 'scaling',
    title: 'Scale-down event for SearchIndexer - 2 instances terminated',
    description: '',
    domain: 'os-domain',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 320),
  },
  {
    id: '11',
    type: 'event',
    title: 'Database failover completed for orders-db-primary to replica-2',
    description: '',
    domain: 'otel-domain',
    sources: ['dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 360),
  },
  {
    id: '12',
    type: 'insight',
    title: 'Latency p99 for GraphQL gateway exceeds 800ms - correlated with upstream inventory-svc',
    description: '',
    domain: 'otel-domain',
    sources: ['os219', 'os233'],
    timestamp: new Date(Date.now() - 1000 * 60 * 400),
  },
  {
    id: '13',
    type: 'event',
    title: 'Config change pushed to feature-flags service - 12 flags updated',
    description: '',
    domain: 'test-domain',
    sources: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 450),
  },
  {
    id: '14',
    type: 'insight',
    title: 'Disk I/O saturation on logging-node-7 - write queue depth at 94%',
    description: '',
    domain: 'os-domain',
    sources: ['os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 500),
  },
  {
    id: '15',
    type: 'event',
    title: 'Canary deployment started for CheckoutService v3.1.0 - 5% traffic routed',
    description: '',
    domain: 'otel-domain',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 540),
  },
  {
    id: '16',
    type: 'scaling',
    title: 'Spot instance reclaimed for batch-processor-pool - replacement provisioning',
    description: '',
    domain: 'test-domain',
    sources: ['dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 600),
  },
  {
    id: '17',
    type: 'insight',
    title: 'DNS resolution failures spiking for partner-api.external.io - 15% error rate',
    description: '',
    domain: 'otel-domain',
    sources: ['os233'],
    timestamp: new Date(Date.now() - 1000 * 60 * 660),
  },
  {
    id: '18',
    type: 'event',
    title: 'Scheduled maintenance window opened for RDS cluster aurora-prod-1',
    description: '',
    domain: 'os-domain',
    sources: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 720),
  },
  {
    id: '19',
    type: 'insight',
    title: 'Thread pool exhaustion risk on EmailDispatcher - active threads at 92% capacity',
    description: '',
    domain: 'otel-domain',
    sources: ['os219', 'os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 780),
  },
  {
    id: '20',
    type: 'event',
    title: 'WAF rule triggered - blocked 340 requests matching SQL injection pattern',
    description: '',
    domain: 'test-domain',
    sources: ['dd76-x5'],
    timestamp: new Date(Date.now() - 1000 * 60 * 840),
  },
  {
    id: '21',
    type: 'scaling',
    title: 'Horizontal pod autoscaler activated for recommendation-engine - target CPU 78%',
    description: '',
    domain: 'otel-domain',
    sources: ['os233'],
    timestamp: new Date(Date.now() - 1000 * 60 * 900),
  },
  {
    id: '22',
    type: 'event',
    title: 'Circuit breaker opened on InventoryService → WarehouseAPI dependency',
    description: '',
    domain: 'os-domain',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 960),
  },
  {
    id: '23',
    type: 'insight',
    title: 'Garbage collection pause times increasing on JVM service analytics-aggregator',
    description: '',
    domain: 'otel-domain',
    sources: ['dd76-x5', 'os688a'],
    timestamp: new Date(Date.now() - 1000 * 60 * 1020),
  },
  {
    id: '24',
    type: 'event',
    title: 'Blue-green swap completed for UserProfileService - green now active',
    description: '',
    domain: 'test-domain',
    sources: ['os219'],
    timestamp: new Date(Date.now() - 1000 * 60 * 1080),
  },
  {
    id: '25',
    type: 'insight',
    title: 'Network throughput anomaly on VPC peering link vpc-0a3f → vpc-7b2e',
    description: '',
    domain: 'otel-domain',
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
    case 'scaling': return 'bg-blue-400';
    default: return 'bg-slate-400';
  }
}

/* ── Feed row component ── */

function FeedRow({ item }: { item: FeedItemExtended }) {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Status dot */}
      <div className="flex size-4 shrink-0 items-center justify-center">
        <div className={`size-2 rounded-full ${getFeedDotColor(item.type)}`} />
      </div>

      {/* Title + metadata */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-sm text-black truncate">{item.title}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {item.domain && <span>{item.domain}</span>}
          {item.sources?.map((src, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="h-3 w-px bg-slate-300" />
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

function FeedList({ items, isInvestigating = false, insightsReady = true, onStartWorkspace }: { items: FeedItemExtended[]; isInvestigating?: boolean; insightsReady?: boolean; onStartWorkspace?: () => void }) {
  return (
    <div className="h-full w-full overflow-y-auto scrollbar-none">
      <div className="flex flex-col gap-4 pb-12" data-testid="feed-list">
        {/* Critical alert banner — only in investigating mode */}
        {isInvestigating && (
          <>
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

            {/* Alert tags + Join workspace — only after insights ready */}
            {insightsReady ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-500">
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
                <Button variant="ghost" size="sm" className="border-0 bg-white" onClick={onStartWorkspace}>
                  Start a workspace
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-500 transition-colors hover:bg-slate-50"
                      aria-label="More options"
                    >
                      <Ellipsis className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    <DropdownMenuItem>Join related workspace</DropdownMenuItem>
                    <DropdownMenuItem>Ignore</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      Roll back change
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            ) : (
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm text-slate-500 animate-pulse">Generating initial insights...</span>
            </div>
            )}

            {/* Redis memory usage visualization */}
            <div className="w-full rounded-lg bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-700">P95 Latency — /api/v1/payments/process</span>
                <span className="text-xs font-semibold text-red-600">2,012ms</span>
              </div>
              <div className="relative h-[80px] w-full">
                <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
                  {/* Threshold line at 800ms */}
                  <line x1="0" y1="48" x2="400" y2="48" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                  <text x="404" y="51" fill="#ef4444" fontSize="8" fontFamily="Inter, sans-serif">800ms</text>

                  {/* Grid lines */}
                  <line x1="0" y1="24" x2="400" y2="24" stroke="#e2e8f0" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#e2e8f0" strokeWidth="0.5" />

                  {/* Area fill */}
                  <path
                    d="M0,65 L30,64 L60,62 L90,60 L120,58 L150,55 L180,52 L210,48 L240,42 L270,34 L300,24 L330,16 L360,10 L390,8 L400,8 L400,80 L0,80 Z"
                    fill="url(#redGradient)"
                  />

                  {/* Line */}
                  <path
                    d="M0,65 L30,64 L60,62 L90,60 L120,58 L150,55 L180,52 L210,48 L240,42 L270,34 L300,24 L330,16 L360,10 L390,8 L400,8"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />

                  {/* Current value dot */}
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

            {/* Divider */}
            <div className="h-px w-full bg-slate-300" />
          </>
        )}

        {items.map((item) => (
          <FeedRow key={item.id} item={item} />
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

function ServiceCard({ node }: { node: ServiceNode }) {
  return (
    <div
      data-node-id={node.id}
      className="flex w-[160px] flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${STATUS_DOT[node.status]}`} />
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

function ApplicationMapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; isError: boolean }[]>([]);

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
        </defs>
        {lines.map((line, i) => {
          const color = line.isError ? '#ef4444' : '#94a3b8';
          const dotColor = line.isError ? '#ef4444' : '#10b981';
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
              {/* Animated dot traveling along the line */}
              <circle r={3} fill={dotColor} filter={line.isError ? 'url(#glow-red)' : 'url(#glow-green)'}>
                <animateMotion
                  dur={`${Math.max(2, len / 80)}s`}
                  repeatCount="indefinite"
                  path={`M${line.x1},${line.y1} L${line.x2},${line.y2}`}
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Service cards */}
      <div className="relative z-10 flex min-w-[900px] flex-col items-center gap-6 p-6">
        {SERVICE_MAP_ROWS.map((row, i) => (
          <div key={i} className="flex flex-wrap justify-center gap-4">
            {row.map((node) => (
              <ServiceCard key={node.id} node={node} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceView() {
  return (
    <div
      className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-slate-400"
      data-testid="service-view"
    >
      <div className="text-center">
        <Server className="mx-auto mb-2 size-8" />
        <p className="text-sm">Service view</p>
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

  useEffect(() => {
    if (fromWorkspace) {
      const frame = requestAnimationFrame(() => setInputExpanded(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [fromWorkspace]);

  const { activeAlert, investigationWorkspaceId } = useAlertInvestigation();

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

    const presetPages: import('@/types').CanvasPage[] = [
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        title: 'Summary',
        order: 0,
        content: `# P95 Latency Alert — Payment Processing Service\n\nEndpoint /api/v1/payments/process has breached the 800ms latency threshold. Current P95 is 2,012ms, sustained for 13 minutes.\n\n> ⚠️ This incident correlates with the PaymentService v3.8.2 deployment at 10:42 UTC. Immediate attention required.\n\n[tags:Payment service|20,000 Impacted customers|Sev-1|Security risk]\n\n[chart]\n\n---\n\n## Impact\n\n- Checkout completion rate dropped from 94% → 31%\n- ~20,000 customers affected during peak traffic window\n- Downstream services (receipt generation, inventory reservation) experiencing cascading timeouts\n- 💰 Estimated revenue impact: ~$48K/min\n\n[bar:31:100:bg-red-500:Checkout Completion Rate]\n\n---\n\n## What Olly Has Investigated\n\n- ✅ Confirmed latency spike is isolated to /payments/process — other payment endpoints are healthy\n- ✅ Correlated with PaymentService v3.8.2 deployment at 10:42 UTC\n- ✅ Database connection pool for payments-db-primary at 97% saturation\n- ✅ No infrastructure issues detected (CPU 42%, Memory 61%, Network normal)\n- ✅ Upstream dependencies (Stripe API, fraud-check service) responding normally\n- ✅ Identified new ORM query pattern in v3.8.2 that opens 3x connections per transaction\n\n---\n\n## Suggested Next Steps\n\n- Roll back PaymentService v3.8.2 → v3.8.1 to restore normal latency\n- Investigate new database query pattern in v3.8.2 causing connection pool exhaustion\n- Scale up payments-db connection pool as temporary mitigation\n- Enable circuit breaker on checkout flow to prevent cascading failures\n- Review 2 hypotheses generated by Olly (see Hypothesis pages)`,
      },
      {
        id: crypto.randomUUID(),
        type: 'dashboard',
        title: 'Dashboard',
        order: 1,
        content: 'mock-dashboard',
      },
      {
        id: crypto.randomUUID(),
        type: 'hypothesis',
        title: 'Hypothesis: DB Connection Pool Exhaustion',
        order: 2,
        content: `> The v3.8.2 deployment introduced a new ORM query pattern that opens multiple database connections per transaction instead of reusing a single connection, causing pool saturation at 97%.\n\n[bar:97:100:bg-red-500:DB Connection Pool Utilization]\n\n[bar:45:100:bg-emerald-500:Baseline Pool Utilization (2 weeks avg)]\n\n---\n\n## Supporting Evidence\n\n- Connection pool utilization jumped from 45% to 97% within 5 minutes of the v3.8.2 deployment\n- The v3.8.2 changelog includes a refactor of the payment validation logic that splits a single transaction into 3 parallel sub-queries\n- Historical data shows connection pool usage was stable at 40–50% for the past 2 weeks under similar traffic\n- Active connections per request increased from 1 to 3.2 (average) post-deployment\n\n---\n\n## How to Validate\n\n- Compare the DB connection acquisition pattern between v3.8.1 and v3.8.2 in the service traces\n- Check if rolling back to v3.8.1 restores connection pool utilization to baseline\n- Run a load test against v3.8.2 in staging with connection pool monitoring enabled`,
      },
      {
        id: crypto.randomUUID(),
        type: 'hypothesis',
        title: 'Hypothesis: Lock Contention on Payment Records',
        order: 3,
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
        mode="expanded"
        onWorkspaceClick={handleWorkspaceClick}
        animate={fromWorkspace}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-between pb-6 pt-12">
          {/* Scrollable content */}
          <div className="flex flex-1 flex-col items-center gap-6 w-[1000px] max-w-full px-6 overflow-y-auto">
            {/* Olly Icon */}
            <OllyIcon size="large" logoSrc={isInvestigating ? (insightsReady ? '/image/Logo-v2.svg' : '/image/Logo-v3.svg') : undefined} />

            {/* Greeting row + view toggle + config */}
            <div className="flex w-full items-center justify-between">
              <h1
                className="text-base font-bold text-black tracking-tight"
                data-testid="greeting"
              >
                {isInvestigating
                  ? 'Hi, I am Olly. I am here to help you investigate the disruptions.'
                  : `${getGreeting()}, I am Olly. Here is what I've looking into since last time:`}
              </h1>
              <div className="flex items-center gap-3 shrink-0">
                <ViewToggleGroup activeView={activeView} onViewChange={setActiveView} />
                <button
                  onClick={() => setConfigOpen((v) => !v)}
                  className="flex items-center justify-center rounded-lg bg-white p-2 transition-colors hover:bg-slate-50"
                  data-testid="config-button"
                  aria-label="Alert configuration"
                >
                  <ShieldAlert className="size-4 text-oui-dark-shade" />
                </button>
              </div>
            </div>

            {/* Content area based on active view */}
            <div className="w-full flex-1 overflow-hidden mb-10">
              {activeView === 'feed' && (
                <FeedList items={MOCK_FEED_ITEMS} isInvestigating={isInvestigating} insightsReady={insightsReady} onStartWorkspace={handleStartInvestigationWorkspace} />
              )}
              {activeView === 'applicationMap' && <ApplicationMapView />}
              {activeView === 'service' && <ServiceView />}
            </div>
          </div>

          {/* Bottom: Suggested Prompts + Input */}
          <div className="w-[1000px] max-w-full px-6 flex flex-col gap-3 shrink-0">
            <SuggestedPrompts onPromptClick={handlePromptClick} />

            {/* Input area */}
            <div
              className="flex flex-col rounded-lg bg-white transition-[max-width] duration-300 ease-in-out"
              style={{ maxWidth: inputExpanded ? 1000 : 360 }}
              data-testid="input-group"
            >
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your service"
                rows={1}
                style={{ height: 64 }}
                className="w-full resize-none border-0 bg-transparent px-3 pt-3 pb-1 text-xs text-oui-darkest-shade placeholder:text-slate-500 focus:outline-none"
                data-testid="home-text-area"
              />
              <div className="flex items-center justify-between px-3 pb-3 pt-1.5">
                <button
                  className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:bg-slate-50"
                  aria-label="Attach"
                >
                  <Plus className="size-4" />
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

        {/* Alert & Skills Panel */}
        <AlertSkillsPanel open={configOpen} onClose={() => setConfigOpen(false)} />
      </main>
    </div>
  );
}

