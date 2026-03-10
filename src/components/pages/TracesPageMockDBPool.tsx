/**
 * Mock traces page for Hypothesis 1: DB Connection Pool Exhaustion.
 * Shows traces where payment transactions open 3x connections and wait on pool.
 */

const STATUS_COLORS: Record<string, { bar: string; text: string }> = {
  ok: { bar: 'bg-oui-link', text: 'text-oui-link' },
  error: { bar: 'bg-red-500', text: 'text-red-500' },
};

interface MockSpan {
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  duration: number;
  status: 'ok' | 'error';
}

interface MockTrace {
  traceId: string;
  totalDuration: number;
  rootStartTime: number;
  spans: MockSpan[];
}

const TRACES: MockTrace[] = [
  {
    traceId: 'abc123def456-pool-exhaust-01',
    totalDuration: 5_200_000,
    rootStartTime: Date.parse('2026-03-06T10:55:12.334Z'),
    spans: [
      { spanId: 's1', serviceName: 'API Gateway', operationName: 'POST /api/v1/payments/process', startTime: 0, duration: 5_200_000, status: 'error' },
      { spanId: 's2', parentSpanId: 's1', serviceName: 'PaymentService', operationName: 'processPayment', startTime: 50_000, duration: 5_100_000, status: 'error' },
      { spanId: 's3', parentSpanId: 's2', serviceName: 'PaymentService', operationName: 'acquireConnection (1/3)', startTime: 100_000, duration: 800_000, status: 'ok' },
      { spanId: 's4', parentSpanId: 's2', serviceName: 'PaymentService', operationName: 'acquireConnection (2/3)', startTime: 120_000, duration: 2_400_000, status: 'error' },
      { spanId: 's5', parentSpanId: 's2', serviceName: 'PaymentService', operationName: 'acquireConnection (3/3)', startTime: 140_000, duration: 5_003_000, status: 'error' },
      { spanId: 's6', parentSpanId: 's3', serviceName: 'payments-db', operationName: 'SELECT payment_validations', startTime: 950_000, duration: 120_000, status: 'ok' },
      { spanId: 's7', parentSpanId: 's4', serviceName: 'payments-db', operationName: 'SELECT fraud_check_rules', startTime: 2_550_000, duration: 95_000, status: 'ok' },
      { spanId: 's8', parentSpanId: 's5', serviceName: 'payments-db', operationName: 'TIMEOUT waiting for connection', startTime: 5_143_000, duration: 0, status: 'error' },
    ],
  },
  {
    traceId: 'def789abc012-pool-exhaust-02',
    totalDuration: 3_800_000,
    rootStartTime: Date.parse('2026-03-06T10:53:22.445Z'),
    spans: [
      { spanId: 't1', serviceName: 'API Gateway', operationName: 'POST /api/v1/payments/process', startTime: 0, duration: 3_800_000, status: 'error' },
      { spanId: 't2', parentSpanId: 't1', serviceName: 'PaymentService', operationName: 'processPayment', startTime: 45_000, duration: 3_700_000, status: 'error' },
      { spanId: 't3', parentSpanId: 't2', serviceName: 'PaymentService', operationName: 'acquireConnection (1/3)', startTime: 80_000, duration: 600_000, status: 'ok' },
      { spanId: 't4', parentSpanId: 't2', serviceName: 'PaymentService', operationName: 'acquireConnection (2/3)', startTime: 95_000, duration: 1_800_000, status: 'ok' },
      { spanId: 't5', parentSpanId: 't2', serviceName: 'PaymentService', operationName: 'acquireConnection (3/3)', startTime: 110_000, duration: 3_200_000, status: 'error' },
      { spanId: 't6', parentSpanId: 't3', serviceName: 'payments-db', operationName: 'SELECT payment_validations FOR UPDATE', startTime: 720_000, duration: 150_000, status: 'ok' },
      { spanId: 't7', parentSpanId: 't4', serviceName: 'payments-db', operationName: 'SELECT fraud_check_rules', startTime: 1_950_000, duration: 80_000, status: 'ok' },
      { spanId: 't8', parentSpanId: 't5', serviceName: 'PaymentService', operationName: 'connectionPoolWait', startTime: 110_000, duration: 3_100_000, status: 'error' },
    ],
  },
  {
    traceId: 'ghi345jkl678-pool-baseline',
    totalDuration: 420_000,
    rootStartTime: Date.parse('2026-03-06T10:41:30.220Z'),
    spans: [
      { spanId: 'b1', serviceName: 'API Gateway', operationName: 'POST /api/v1/payments/process', startTime: 0, duration: 420_000, status: 'ok' },
      { spanId: 'b2', parentSpanId: 'b1', serviceName: 'PaymentService (v3.8.1)', operationName: 'processPayment', startTime: 30_000, duration: 360_000, status: 'ok' },
      { spanId: 'b3', parentSpanId: 'b2', serviceName: 'PaymentService (v3.8.1)', operationName: 'acquireConnection (1/1)', startTime: 50_000, duration: 12_000, status: 'ok' },
      { spanId: 'b4', parentSpanId: 'b3', serviceName: 'payments-db', operationName: 'SELECT + UPDATE payment', startTime: 70_000, duration: 280_000, status: 'ok' },
      { spanId: 'b5', parentSpanId: 'b2', serviceName: 'Stripe API', operationName: 'chargeCreate', startTime: 200_000, duration: 150_000, status: 'ok' },
    ],
  },
];

function buildSpanTree(spans: MockSpan[]): { span: MockSpan; depth: number }[] {
  const childrenMap = new Map<string | undefined, MockSpan[]>();
  for (const span of spans) {
    const key = span.parentSpanId ?? undefined;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(span);
  }
  const result: { span: MockSpan; depth: number }[] = [];
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
  if (us >= 1_000) return `${(us / 1_000).toFixed(1)}ms`;
  return `${us}µs`;
}

export function TracesPageMockDBPool() {
  return (
    <div data-testid="traces-mock-dbpool" className="flex flex-col gap-4">
      {TRACES.map((trace) => {
        const spanRows = buildSpanTree(trace.spans);
        return (
          <div key={trace.traceId} className="flex flex-col rounded-lg overflow-hidden border border-oui-lightest-shade bg-white">
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
                  <span className="text-xs text-oui-darkest-shade">{new Date(trace.rootStartTime).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[160px_200px_1fr_80px] border-b border-oui-lightest-shade px-4 py-1.5 text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">
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
                  ? (span.startTime / trace.totalDuration) * 100
                  : 0;
                const widthPct = trace.totalDuration > 0
                  ? Math.max((span.duration / trace.totalDuration) * 100, 1)
                  : 100;

                return (
                  <div
                    key={span.spanId}
                    className="grid grid-cols-[160px_200px_1fr_80px] items-center border-b border-oui-lightest-shade px-4 py-2.5"
                  >
                    <div className="flex items-center gap-1 overflow-hidden" style={{ paddingLeft: `${depth * 12}px` }}>
                      <span className={`text-xs truncate ${span.status === 'error' ? colors.text : 'text-oui-darkest-shade'}`}>
                        {span.serviceName}
                      </span>
                    </div>
                    <span className="text-xs text-oui-darkest-shade truncate">{span.operationName}</span>
                    <div className="px-2 relative h-5">
                      <div
                        className={`absolute top-0.5 h-4 rounded ${colors.bar} opacity-80`}
                        style={{ left: `${offsetPct}%`, width: `${widthPct}%` }}
                      />
                    </div>
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
