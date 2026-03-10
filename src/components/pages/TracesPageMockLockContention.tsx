/**
 * Mock traces page for Hypothesis 2: Lock Contention on Payment Records.
 * Shows traces where concurrent payment requests queue behind row-level locks.
 */

const STATUS_COLORS: Record<string, { bar: string; text: string }> = {
  ok: { bar: 'bg-oui-link', text: 'text-oui-link' },
  error: { bar: 'bg-red-500', text: 'text-red-500' },
  waiting: { bar: 'bg-amber-500', text: 'text-amber-600' },
};

interface MockSpan {
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  duration: number;
  status: 'ok' | 'error' | 'waiting';
}

interface MockTrace {
  traceId: string;
  totalDuration: number;
  rootStartTime: number;
  spans: MockSpan[];
}

const TRACES: MockTrace[] = [
  {
    traceId: 'lock-trace-445-contention-01',
    totalDuration: 6_500_000,
    rootStartTime: Date.parse('2026-03-06T10:55:18.773Z'),
    spans: [
      { spanId: 'l1', serviceName: 'API Gateway', operationName: 'POST /api/v1/payments/process', startTime: 0, duration: 6_500_000, status: 'error' },
      { spanId: 'l2', parentSpanId: 'l1', serviceName: 'PaymentService', operationName: 'processPayment', startTime: 40_000, duration: 6_400_000, status: 'error' },
      { spanId: 'l3', parentSpanId: 'l2', serviceName: 'PaymentService', operationName: 'beginTransaction (SERIALIZABLE)', startTime: 80_000, duration: 50_000, status: 'ok' },
      { spanId: 'l4', parentSpanId: 'l2', serviceName: 'payments-db', operationName: 'SELECT ... FOR UPDATE (acquire row lock)', startTime: 150_000, duration: 6_200_000, status: 'error' },
      { spanId: 'l5', parentSpanId: 'l4', serviceName: 'payments-db', operationName: 'WAITING on row lock (merchant_id=4821)', startTime: 200_000, duration: 6_100_000, status: 'waiting' },
      { spanId: 'l6', parentSpanId: 'l2', serviceName: 'PaymentService', operationName: 'validatePayment (blocked)', startTime: 6_350_000, duration: 50_000, status: 'error' },
      { spanId: 'l7', parentSpanId: 'l2', serviceName: 'PaymentService', operationName: 'rollbackTransaction', startTime: 6_400_000, duration: 30_000, status: 'error' },
    ],
  },
  {
    traceId: 'lock-trace-398-contention-02',
    totalDuration: 4_800_000,
    rootStartTime: Date.parse('2026-03-06T10:53:55.667Z'),
    spans: [
      { spanId: 'm1', serviceName: 'API Gateway', operationName: 'POST /api/v1/payments/process', startTime: 0, duration: 4_800_000, status: 'error' },
      { spanId: 'm2', parentSpanId: 'm1', serviceName: 'PaymentService', operationName: 'processPayment', startTime: 35_000, duration: 4_700_000, status: 'error' },
      { spanId: 'm3', parentSpanId: 'm2', serviceName: 'PaymentService', operationName: 'beginTransaction (SERIALIZABLE)', startTime: 70_000, duration: 40_000, status: 'ok' },
      { spanId: 'm4', parentSpanId: 'm2', serviceName: 'payments-db', operationName: 'UPDATE payments SET status=validating FOR UPDATE', startTime: 130_000, duration: 4_500_000, status: 'error' },
      { spanId: 'm5', parentSpanId: 'm4', serviceName: 'payments-db', operationName: 'WAITING on row lock (txn convoy)', startTime: 180_000, duration: 4_400_000, status: 'waiting' },
      { spanId: 'm6', parentSpanId: 'm2', serviceName: 'Stripe API', operationName: 'chargeCreate (never reached)', startTime: 4_700_000, duration: 0, status: 'error' },
    ],
  },
  {
    traceId: 'lock-trace-312-near-deadlock',
    totalDuration: 5_600_000,
    rootStartTime: Date.parse('2026-03-06T10:50:48.990Z'),
    spans: [
      { spanId: 'n1', serviceName: 'API Gateway', operationName: 'POST /api/v1/payments/process', startTime: 0, duration: 5_600_000, status: 'error' },
      { spanId: 'n2', parentSpanId: 'n1', serviceName: 'PaymentService', operationName: 'processPayment (txn-98744)', startTime: 30_000, duration: 5_500_000, status: 'error' },
      { spanId: 'n3', parentSpanId: 'n2', serviceName: 'payments-db', operationName: 'LOCK ROW payments.id=55012', startTime: 100_000, duration: 200_000, status: 'ok' },
      { spanId: 'n4', parentSpanId: 'n2', serviceName: 'payments-db', operationName: 'LOCK ROW payment_items.id=88201 (WAITING)', startTime: 350_000, duration: 5_100_000, status: 'waiting' },
      { spanId: 'n5', parentSpanId: 'n4', serviceName: 'payments-db', operationName: 'blocked by txn-98745 holding lock on payment_items', startTime: 400_000, duration: 5_000_000, status: 'error' },
      { spanId: 'n6', parentSpanId: 'n2', serviceName: 'PaymentService', operationName: 'deadlockDetection — abort txn-98744', startTime: 5_450_000, duration: 80_000, status: 'error' },
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

export function TracesPageMockLockContention() {
  return (
    <div data-testid="traces-mock-lock" className="flex flex-col gap-4">
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
            <div className="grid grid-cols-[160px_260px_1fr_80px] border-b border-oui-lightest-shade px-4 py-1.5 text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">
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
                    className="grid grid-cols-[160px_260px_1fr_80px] items-center border-b border-oui-lightest-shade px-4 py-2.5"
                  >
                    <div className="flex items-center gap-1 overflow-hidden" style={{ paddingLeft: `${depth * 12}px` }}>
                      <span className={`text-xs truncate ${span.status !== 'ok' ? colors.text : 'text-oui-darkest-shade'}`}>
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
