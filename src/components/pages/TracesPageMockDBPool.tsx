/**
 * Mock traces page for Hypothesis 1: DB Connection Pool Exhaustion.
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
  status: 'ok' | 'error';
}

const TRACES: { id: string; duration: string; time: string; spans: MockSpan[] }[] = [
  {
    id: 'abc123…pool-01',
    duration: '5.20s',
    time: '10:55:12',
    spans: [
      { id: 's1', depth: 0, service: 'API Gateway', operation: 'POST /payments/process', offsetPct: 0, widthPct: 100, duration: '5.20s', status: 'error' },
      { id: 's2', depth: 1, service: 'PaymentService', operation: 'processPayment', offsetPct: 1, widthPct: 98, duration: '5.10s', status: 'error' },
      { id: 's3', depth: 2, service: 'PaymentService', operation: 'acquireConnection (1/3)', offsetPct: 2, widthPct: 15, duration: '800ms', status: 'ok' },
      { id: 's4', depth: 2, service: 'PaymentService', operation: 'acquireConnection (2/3)', offsetPct: 2, widthPct: 46, duration: '2.40s', status: 'error' },
      { id: 's5', depth: 2, service: 'PaymentService', operation: 'acquireConnection (3/3) — TIMEOUT', offsetPct: 3, widthPct: 96, duration: '5.00s', status: 'error' },
    ],
  },
  {
    id: 'ghi345…baseline',
    duration: '420ms',
    time: '10:41:30',
    spans: [
      { id: 'b1', depth: 0, service: 'API Gateway', operation: 'POST /payments/process', offsetPct: 0, widthPct: 100, duration: '420ms', status: 'ok' },
      { id: 'b2', depth: 1, service: 'PaymentService (v3.8.1)', operation: 'processPayment', offsetPct: 7, widthPct: 86, duration: '360ms', status: 'ok' },
      { id: 'b3', depth: 2, service: 'PaymentService (v3.8.1)', operation: 'acquireConnection (1/1)', offsetPct: 12, widthPct: 3, duration: '12ms', status: 'ok' },
      { id: 'b4', depth: 2, service: 'payments-db', operation: 'SELECT + UPDATE payment', offsetPct: 17, widthPct: 67, duration: '280ms', status: 'ok' },
    ],
  },
];

export function TracesPageMockDBPool() {
  return (
    <div data-testid="traces-mock-dbpool" className="flex flex-col gap-3 text-xs">
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
                className={`truncate ${span.status === 'error' ? 'text-red-500' : 'text-oui-darkest-shade'}`}
                style={{ paddingLeft: `${span.depth * 12}px` }}
              >
                {span.service}
              </span>
              <div className="relative h-4 mx-2">
                <div className="absolute inset-y-0 bg-oui-lightest-shade/50 rounded w-full" />
                <div
                  className={`absolute inset-y-0 rounded ${span.status === 'error' ? 'bg-red-500/70' : 'bg-oui-link/70'}`}
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
