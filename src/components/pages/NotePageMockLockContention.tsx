import { useState, useEffect } from 'react';
import { Code } from 'lucide-react';

import { GeneratingAnimation } from './GeneratingAnimation';

const NOTE_CONTENT = {
  title: 'Root Cause Confirmed: DB Connection Pool Exhaustion',
  traceId: 'abc123def456-pool-exhaust-01',
  sections: [
    {
      heading: 'Conclusion',
      body: 'Trace abc123def456-pool-exhaust-01 confirms that the P95 latency spike is caused by DB connection pool exhaustion introduced in PaymentService v3.8.2. The new ORM query pattern opens 3 parallel database connections per transaction instead of reusing a single connection, pushing pool utilization from 45% to 97%.',
    },
    {
      heading: 'Evidence from Trace',
      items: [
        'Trace abc123def456-pool-exhaust-01 shows 3 concurrent acquireConnection spans per payment transaction, each competing for pool resources',
        'The third acquireConnection span waits 4,800ms for a free connection before timing out with ConnectionPoolExhaustedException',
        'Pool utilization jumps from 45% to 97% within 5 minutes of the v3.8.2 deployment at 10:42 UTC',
        'Baseline v3.8.1 traces show a single acquireConnection span completing in ~12ms with pool utilization stable at 40–50%',
      ],
    },
    {
      heading: 'Impact',
      items: [
        'Active connections per request increased from 1 to 3.2 (average) post-deployment',
        'Connection pool at 97% saturation across all 3 payment nodes, confirming cluster-wide impact',
        'Checkout completion rate dropped from 94% to 31%, affecting ~20,000 customers',
      ],
    },
    {
      heading: 'Recommended Actions',
      items: [
        'Immediate: Roll back PaymentService to v3.8.1 to restore single-connection-per-transaction behavior',
        'Short-term: Increase connection pool size from 10 to 50 and enable idle timeout (30s)',
        'Medium-term: Refactor the v3.8.2 ORM pattern to reuse a single connection per transaction instead of opening parallel sub-queries',
        'Monitoring: Add alerting on connection pool utilization > 80% and acquireConnection P95 > 500ms',
      ],
    },
  ],
};

export function NotePageMockLockContention() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return <GeneratingAnimation label="Generating note..." />;
  }

  return (
    <div className="w-full space-y-4 py-4 px-2" data-testid="note-mock-lock">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-900 tracking-tight">
          {NOTE_CONTENT.title}
        </h2>
        <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors shrink-0">
          <Code className="size-3" />
          Fix in IDE
        </button>
      </div>

      <div className="rounded-md bg-slate-50 border border-slate-200 px-4 py-2.5">
        <span className="text-xs font-medium text-slate-500">Confirmed Trace ID</span>
        <p className="text-sm font-mono text-slate-800 mt-0.5">{NOTE_CONTENT.traceId}</p>
      </div>

      {NOTE_CONTENT.sections.map((section) => (
        <div key={section.heading}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-4 mb-2">
            {section.heading}
          </h3>
          {section.body && (
            <p className="text-sm text-slate-600 leading-relaxed">{section.body}</p>
          )}
          {section.items && (
            <ul className="space-y-2 pl-0.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed"
                >
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-300" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
