/**
 * Mock traces page for Hypothesis 2: Lock Contention on Payment Records.
 * Simplified waterfall view showing 2 representative traces.
 */

interface MockSpan {
  id: string;
  depth: number;
  service: string;
  operation: string;
  offsetPct: number;
  widthPct: number;
  duration: string;
  status: 'ok' | 'error' | 'waiting';
}

const TRACES: { id: string; duration: string; time: string; spans: MockSpan[] }[] = [
  {
    id: 'lock-445…contention-01',
    duration: '6.50s',
    time: '10:55:18',
    spans: [
      { id: 'l1', depth: 0, service: 'API Gateway', operation: 'POST /payments/process', offsetPct: 0, widthPct: 100, duration: '6.50s', status: 'error' },
      { id: 'l2', depth: 1, service: 'PaymentService', operation: 'processPayment', offsetPct: 1, widthPct: 98, duration: '6.40s', status: 'error' },
      { id: 'l3', depth: 2, service: 'payments-db', operation: 'SELECT … FOR UPDATE (acquire row lock)', offsetPct: 2, widthPct: 95, duration: '6.20s', status: 'error' },
      { id: 'l4', depth: 3, service: 'payments-db', operation: 'WAITING on row lock (merchant_id=4821)', offsetPct: 3, widthPct: 94, duration: '6.10s', status: 'waiting' },
      { id: 'l5', depth: 2, service: 'PaymentService', operation: 'rollbackTransaction', offsetPct: 98, widthPct: 1, duration: '30ms', status: 'error' },
    ],
  },
  {
    id: 'lock-312…near-deadlock',
    duration: '5.60s',
    time: '10:50:48',
    spans: [
      { id: 'n1', depth: 0, service: 'API Gateway', operation: 'POST /payments/process', offsetPct: 0, widthPct: 100, duration: '5.60s', status: 'error' },
      { id: 'n2', depth: 1, service: 'PaymentService', operation: 'processPayment (txn-98744)', offsetPct: 1, widthPct: 98, duration: '5.50s', status: 'error' },
      { id: 'n3', depth: 2, service: 'payments-db', operation: 'LOCK ROW payments.id=55012', offsetPct: 2, widthPct: 4, duration: '200ms', status: 'ok' },
      { id: 'n4', depth: 2, service: 'payments-db', operation: 'LOCK ROW payment_items — WAITING', offsetPct: 6, widthPct: 91, duration: '5.10s', status: 'waiting' },
      { id: 'n5', depth: 2, service: 'PaymentService', operation: 'deadlockDetection — abort', offsetPct: 97, widthPct: 2, duration: '80ms', status: 'error' },
    ],
  },
];

const BAR_COLORS: Record<string, string> = {
  ok: 'bg-oui-link/70',
  error: 'bg-red-500/70',
  waiting: 'bg-amber-500/70',
};

const TEXT_COLORS: Record<string, string> = {
  ok: 'text-oui-darkest-shade',
  error: 'text-red-500',
  waiting: 'text-amber-600',
};

export function TracesPageMockLockContention() {
  return (
    <div data-testid="traces-mock-lock" className="flex flex-col gap-3 text-xs">
      {TRACES.map((trace) => (
        <div key={trace.id} className="flex flex-col border border-oui-lightest-shade rounded-lg overflow-hidden">
          <div className="flex items-center gap-4 px-3 py-2 border-b border-oui-lightest-shade">
            <span className="font-mono text-oui-darkest-shade">{trace.id}</span>
            <span className="text-oui-dark-shade">{trace.time}</span>
            <span className="ml-auto text-oui-darkest-shade font-medium">{trace.duration}</span>
          </div>
          {trace.spans.map((span) => (
            <div key={span.id} className="grid grid-cols-[140px_1fr_60px] items-center px-3 py-1.5 border-b border-oui-lightest-shade last:border-b-0">
              <span
                className={`truncate ${TEXT_COLORS[span.status] ?? 'text-oui-darkest-shade'}`}
                style={{ paddingLeft: `${span.depth * 12}px` }}
              >
                {span.service}
              </span>
              <div className="relative h-4 mx-2">
                <div className="absolute inset-y-0 bg-oui-lightest-shade/50 rounded w-full" />
                <div
                  className={`absolute inset-y-0 rounded ${BAR_COLORS[span.status] ?? 'bg-oui-link/70'}`}
                  style={{ left: `${span.offsetPct}%`, width: `${span.widthPct}%` }}
                />
              </div>
              <span className="text-right text-oui-dark-shade">{span.duration}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
