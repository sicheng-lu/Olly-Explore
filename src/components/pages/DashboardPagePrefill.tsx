import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardMetrics, DashboardMetric } from '../../types';

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  normal: { dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  critical: { dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
};

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

function ChangeIndicator({ change, status }: { change: string; status: string }) {
  const isDown = change.includes('↓') || change.toLowerCase().includes('down');
  const Icon = isDown ? TrendingDown : TrendingUp;
  const color = status === 'normal' ? 'text-emerald-600' : 'text-red-600';
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon className="size-3" />
      {change}
    </span>
  );
}

function MetricCard({ metric, valueSize = 'text-xl' }: { metric: DashboardMetric; valueSize?: string }) {
  const s = STATUS_STYLES[metric.status] ?? STATUS_STYLES.normal;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4" data-testid="metric-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{metric.title}</span>
        <StatusBadge status={metric.status} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`${valueSize} font-bold ${s.text}`}>{metric.value}</span>
        {metric.change && <ChangeIndicator change={metric.change} status={metric.status} />}
      </div>
    </div>
  );
}

interface DashboardPagePrefillProps {
  metrics: DashboardMetrics;
}

export function DashboardPagePrefill({ metrics }: DashboardPagePrefillProps) {
  return (
    <div className="w-full space-y-4 py-4 px-2" data-testid="dashboard-prefill">
      {/* Latency metrics row */}
      {metrics.latency.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2">Latency</p>
          <div className="grid grid-cols-3 gap-3">
            {metrics.latency.map((m) => (
              <MetricCard key={m.title} metric={m} valueSize="text-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* Impact metrics row */}
      {metrics.impact.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2">Impact</p>
          <div className="grid grid-cols-4 gap-3">
            {metrics.impact.map((m) => (
              <MetricCard key={m.title} metric={m} />
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure metrics row */}
      {metrics.infrastructure.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2">Infrastructure</p>
          <div className="grid grid-cols-4 gap-3">
            {metrics.infrastructure.map((m) => (
              <MetricCard key={m.title} metric={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
