import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PageEllipsisMenu } from '@/components/PageEllipsisMenu';

interface MetricCard {
  title: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  change?: string;
}

const LATENCY_METRICS: MetricCard[] = [
  { title: 'P50 Latency', value: '300ms', status: 'normal' },
  { title: 'P95 Latency', value: '2,300ms', status: 'critical', change: '↑ 187%' },
  { title: 'P99 Latency', value: '3,500ms', status: 'critical', change: '↑ 250%' },
];

const IMPACT_METRICS: MetricCard[] = [
  { title: 'Checkout Completion', value: '31%', status: 'critical', change: '↓ from 94%' },
  { title: 'Impacted Customers', value: '~20,000', status: 'critical' },
  { title: 'Cascading Timeouts', value: '3 services', status: 'warning' },
  { title: 'Revenue Impact', value: '~$48K/min', status: 'critical' },
];

const INFRA_METRICS: MetricCard[] = [
  { title: 'Request Volume', value: '1.2K/s', status: 'normal' },
  { title: 'Error Rate', value: '0.3%', status: 'normal' },
  { title: 'CPU Usage', value: '42%', status: 'normal' },
  { title: 'Memory Usage', value: '61%', status: 'normal' },
];

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  normal: { dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  critical: { dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
};

/* Sparkline data for the P95 latency chart */
const P95_POINTS = [
  800, 790, 810, 795, 805, 800, 810, 820, 850, 920,
  1050, 1280, 1500, 1750, 1900, 2050, 2200, 2280, 2300, 2300,
];

/* Sparkline data for request volume (stable) */
const REQ_POINTS = [
  1180, 1220, 1200, 1190, 1210, 1230, 1200, 1195, 1215, 1205,
  1190, 1220, 1200, 1210, 1195, 1225, 1200, 1210, 1190, 1200,
];

function buildPath(points: number[], width: number, height: number, maxVal: number): string {
  const step = width / (points.length - 1);
  return points
    .map((v, i) => {
      const x = i * step;
      const y = height - (v / maxVal) * height;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

function buildArea(points: number[], width: number, height: number, maxVal: number): string {
  return `${buildPath(points, width, height, maxVal)} L${width},${height} L0,${height} Z`;
}

function MiniChart({ points, color, maxVal, threshold }: { points: number[]; color: string; maxVal: number; threshold?: number }) {
  const w = 320;
  const h = 60;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[60px]" preserveAspectRatio="none">
      {threshold != null && (
        <>
          <line x1="0" y1={h - (threshold / maxVal) * h} x2={w} y2={h - (threshold / maxVal) * h} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <text x={w - 30} y={h - (threshold / maxVal) * h - 4} fill="#ef4444" fontSize="7" fontFamily="Inter, sans-serif">800ms</text>
        </>
      )}
      <path d={buildArea(points, w, h, maxVal)} fill={color} opacity="0.1" />
      <path d={buildPath(points, w, h, maxVal)} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.normal;
  const label = status === 'critical' ? 'Critical' : status === 'warning' ? 'Warning' : 'Normal';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.bg} ${s.text}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

export function DashboardPage({ onRemove }: { onRemove?: () => void }) {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900 tracking-tight">Dashboard: Payment Processing Service</p>
          <p className="text-xs text-slate-500 mt-0.5">/api/v1/payments/process — Last 30 minutes</p>
        </div>
        <PageEllipsisMenu onRemove={onRemove} />
      </div>

      {/* Latency metrics row */}
      <div className="grid grid-cols-3 gap-3">
        {LATENCY_METRICS.map((m) => {
          const s = STATUS_STYLES[m.status];
          return (
            <div key={m.title} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{m.title}</span>
                <StatusBadge status={m.status} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${s.text}`}>{m.value}</span>
                {m.change && (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-red-600">
                    <TrendingUp className="size-3" />
                    {m.change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* P95 Latency chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-700">P95 Latency Over Time</span>
          <span className="text-[10px] text-slate-400">Threshold: 800ms</span>
        </div>
        <MiniChart points={P95_POINTS} color="#ef4444" maxVal={2800} threshold={800} />
        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
          <span>-30m</span><span>-20m</span><span>-10m</span><span>Now</span>
        </div>
      </div>

      {/* Impact metrics row */}
      <div className="grid grid-cols-4 gap-3">
        {IMPACT_METRICS.map((m) => {
          const s = STATUS_STYLES[m.status];
          return (
            <div key={m.title} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{m.title}</span>
                <StatusBadge status={m.status} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${s.text}`}>{m.value}</span>
                {m.change && (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-red-600">
                    <TrendingDown className="size-3" />
                    {m.change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Infrastructure metrics row */}
      <div className="grid grid-cols-4 gap-3">
        {INFRA_METRICS.map((m) => {
          const s = STATUS_STYLES[m.status];
          return (
            <div key={m.title} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{m.title}</span>
                <StatusBadge status={m.status} />
              </div>
              <span className={`text-xl font-bold ${s.text}`}>{m.value}</span>
            </div>
          );
        })}
      </div>

      {/* Request volume chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-700">Request Volume</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600">
            <Minus className="size-3" /> Stable
          </span>
        </div>
        <MiniChart points={REQ_POINTS} color="#10b981" maxVal={1500} />
        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
          <span>-30m</span><span>-20m</span><span>-10m</span><span>Now</span>
        </div>
      </div>
    </div>
  );
}
