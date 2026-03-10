import type { TraceData, TraceSpan } from '../../types';

interface TracesPagePrefillProps {
  traceData: TraceData[];
}

/** Build an ordered flat list of spans respecting parent-child hierarchy. */
function buildSpanTree(spans: TraceSpan[]): { span: TraceSpan; depth: number }[] {
  const childrenMap = new Map<string | undefined, TraceSpan[]>();
  for (const span of spans) {
    const key = span.parentSpanId ?? undefined;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(span);
  }

  const result: { span: TraceSpan; depth: number }[] = [];

  function walk(parentId: string | undefined, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    for (const child of children) {
      result.push({ span: child, depth });
      walk(child.spanId, depth + 1);
    }
  }

  walk(undefined, 0);
  return result;
}

function formatDuration(us: number): string {
  if (us >= 1_000_000) return `${(us / 1_000_000).toFixed(2)}s`;
  if (us >= 1_000) return `${(us / 1_000).toFixed(2)}ms`;
  return `${us}µs`;
}

const STATUS_COLORS: Record<string, { bar: string; text: string }> = {
  ok: { bar: 'bg-oui-link', text: 'text-oui-link' },
  error: { bar: 'bg-red-500', text: 'text-red-500' },
};

export function TracesPagePrefill({ traceData }: TracesPagePrefillProps) {
  return (
    <div data-testid="traces-prefill" className="flex flex-col gap-4">
      {traceData.map((trace) => {
        const spanRows = buildSpanTree(trace.spans);
        const traceStart = trace.rootSpan.startTime;

        return (
          <div
            key={trace.traceId}
            className="flex flex-col rounded-lg overflow-hidden border border-oui-lightest-shade bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-oui-lightest-shade px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-oui-dark-shade uppercase tracking-wide">Trace ID</span>
                <span className="text-xs text-oui-darkest-shade font-mono">{trace.traceId}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">Duration</span>
                  <span className="text-xs text-oui-darkest-shade">{formatDuration(trace.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">Timestamp</span>
                  <span className="text-xs text-oui-darkest-shade">{new Date(traceStart).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[140px_160px_1fr_80px] border-b border-oui-lightest-shade px-4 py-1.5 text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">
              <span>Service</span>
              <span>Operation</span>
              <span>Span Waterfall</span>
              <span className="text-right">Duration</span>
            </div>

            {/* Span rows */}
            <div className="flex flex-col">
              {spanRows.map(({ span, depth }) => {
                const colors = STATUS_COLORS[span.status] ?? STATUS_COLORS.ok;
                const offsetPct = trace.totalDuration > 0
                  ? ((span.startTime - traceStart) / trace.totalDuration) * 100
                  : 0;
                const widthPct = trace.totalDuration > 0
                  ? Math.max((span.duration / trace.totalDuration) * 100, 1)
                  : 100;

                return (
                  <div
                    key={span.spanId}
                    className="grid grid-cols-[140px_160px_1fr_80px] items-center border-b border-oui-lightest-shade px-4 py-2.5"
                  >
                    {/* Service label with indentation */}
                    <div className="flex items-center gap-1 overflow-hidden" style={{ paddingLeft: `${depth * 12}px` }}>
                      <span className={`text-xs truncate ${span.status === 'error' ? colors.text : 'text-oui-darkest-shade'}`}>
                        {span.serviceName}
                      </span>
                    </div>

                    {/* Operation name */}
                    <span className="text-xs text-oui-darkest-shade truncate">{span.operationName}</span>

                    {/* Waterfall bar */}
                    <div className="px-2 relative h-5">
                      <div
                        className={`absolute top-0.5 h-4 rounded ${colors.bar} opacity-80`}
                        style={{ left: `${offsetPct}%`, width: `${widthPct}%` }}
                      />
                    </div>

                    {/* Duration */}
                    <span className="text-xs text-oui-dark-shade text-right">{formatDuration(span.duration)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
