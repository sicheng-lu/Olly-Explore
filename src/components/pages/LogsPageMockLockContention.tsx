import { useState } from 'react';
import { Search, ChevronDown, Download, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Mock logs page for Hypothesis 2: Lock Contention on Payment Records.
 * Query: service.name:"PaymentService" AND ("lock wait" OR "WAITING" OR "row lock" OR "deadlock")
 */

const SELECTED_FIELDS = ['_source'];

const AVAILABLE_FIELDS = [
  '_id', '_index', 'service.name', 'log.level', 'message',
  'db.lock.wait_time_ms', 'db.lock.type', 'db.lock.table',
  'thread.name', 'thread.state', 'deployment.version',
  'host.name', 'trace.id', 'db.statement',
  'transaction.id', 'transaction.duration_ms', 'concurrent.requests',
];

const HISTOGRAM_DATA = [
  0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 2, 1, 2, 3, 5, 7, 10, 14, 18,
  20, 24, 26, 28, 30, 28, 32, 30, 34, 32, 30, 33, 31, 35, 32, 34, 30, 33, 31, 32,
  30, 34, 32, 33,
];

const LOG_ENTRIES = [
  {
    time: 'Mar 6, 2026 @ 10:56:01.442',
    source: `service.name: PaymentService  log.level: ERROR  message: Lock wait timeout exceeded on payments table — transaction aborted after 8000ms  db.lock.wait_time_ms: 8003  db.lock.type: ROW_EXCLUSIVE  db.lock.table: payments  thread.name: payment-handler-52  thread.state: WAITING  deployment.version: v3.8.2  host.name: payment-node-02  transaction.id: txn-99281`,
  },
  {
    time: 'Mar 6, 2026 @ 10:55:44.118',
    source: `service.name: PaymentService  log.level: WARN  message: Thread dump snapshot — 68% of payment handler threads in WAITING state on DB lock acquisition  thread.state: WAITING  concurrent.requests: 342  deployment.version: v3.8.2  host.name: payment-node-01  thread.name: jvm-monitor-1`,
  },
  {
    time: 'Mar 6, 2026 @ 10:55:18.773',
    source: `service.name: PaymentService  log.level: ERROR  message: Exclusive row lock acquired too early in transaction lifecycle — blocking concurrent payment requests  db.lock.type: ROW_EXCLUSIVE  db.lock.table: payments  db.lock.wait_time_ms: 6200  db.statement: UPDATE payments SET status = 'validating' WHERE id = ? FOR UPDATE  deployment.version: v3.8.2  host.name: payment-node-03  trace.id: lock-trace-445`,
  },
  {
    time: 'Mar 6, 2026 @ 10:54:33.201',
    source: `service.name: PaymentService  log.level: WARN  message: Lock convoy detected — sequential lock acquisition pattern causing cascading waits  db.lock.type: ROW_EXCLUSIVE  db.lock.table: payments  concurrent.requests: 289  transaction.duration_ms: 4500  deployment.version: v3.8.2  host.name: payment-node-01  thread.name: payment-handler-18`,
  },
  {
    time: 'Mar 6, 2026 @ 10:53:55.667',
    source: `service.name: PaymentService  log.level: ERROR  message: Slow query log — lock wait time 12x above baseline on payments table  db.lock.wait_time_ms: 7800  db.lock.type: ROW_EXCLUSIVE  db.lock.table: payments  db.statement: SELECT * FROM payments WHERE merchant_id = ? AND status = 'pending' FOR UPDATE  deployment.version: v3.8.2  host.name: payment-node-02  trace.id: lock-trace-398`,
  },
  {
    time: 'Mar 6, 2026 @ 10:52:12.334',
    source: `service.name: PaymentService  log.level: WARN  message: P95 latency spike correlates with concurrent request count — lock contention pattern confirmed  concurrent.requests: 256  transaction.duration_ms: 3800  deployment.version: v3.8.2  host.name: payment-node-03  thread.name: metrics-reporter-1`,
  },
  {
    time: 'Mar 6, 2026 @ 10:50:48.990',
    source: `service.name: PaymentService  log.level: ERROR  message: Near-deadlock detected — two transactions waiting on each other's row locks  db.lock.type: ROW_EXCLUSIVE  db.lock.table: payments  db.lock.wait_time_ms: 5500  deployment.version: v3.8.2  host.name: payment-node-01  transaction.id: txn-98744  trace.id: lock-trace-312`,
  },
  {
    time: 'Mar 6, 2026 @ 10:48:05.112',
    source: `service.name: PaymentService  log.level: WARN  message: New locking strategy in v3.8.2 acquires exclusive locks at transaction start instead of commit phase  db.lock.type: ROW_EXCLUSIVE  db.lock.table: payments  deployment.version: v3.8.2  host.name: payment-node-02  thread.name: payment-handler-07`,
  },
  {
    time: 'Mar 6, 2026 @ 10:43:22.556',
    source: `service.name: PaymentService  log.level: INFO  message: Transaction isolation level changed to SERIALIZABLE in v3.8.2 payment flow  deployment.version: v3.8.2  host.name: payment-node-01  thread.name: deployer-main`,
  },
  {
    time: 'Mar 6, 2026 @ 10:41:15.003',
    source: `service.name: PaymentService  log.level: INFO  message: Lock wait times nominal — no contention detected  db.lock.wait_time_ms: 8  db.lock.table: payments  concurrent.requests: 180  deployment.version: v3.8.1  host.name: payment-node-01  thread.name: jvm-monitor-1`,
  },
];

function FieldBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    t: 'bg-oui-primary/20 text-oui-primary',
    '#': 'bg-oui-link/20 text-oui-link',
  };
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold shrink-0 ${colors[type] || colors.t}`}>
      {type}
    </span>
  );
}

export function LogsPageMockLockContention() {
  const [fieldSearch, setFieldSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const maxBar = Math.max(...HISTOGRAM_DATA);

  const filteredFields = AVAILABLE_FIELDS.filter((f) =>
    f.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div data-testid="logs-mock-lock" className="flex h-full min-h-[500px] gap-0 rounded-lg overflow-hidden border border-oui-lightest-shade">
      {/* Sidebar */}
      <div className="w-[200px] shrink-0 border-r border-oui-lightest-shade bg-white flex flex-col">
        <div className="flex items-center gap-1.5 border-b border-oui-lightest-shade px-3 py-2">
          <span className="text-xs text-oui-darkest-shade font-medium truncate">payments-*</span>
          <ChevronDown className="size-3 text-oui-dark-shade shrink-0" />
        </div>

        <div className="px-2 py-2 border-b border-oui-lightest-shade">
          <div className="flex items-center gap-1.5 rounded border border-oui-lightest-shade px-2 py-1">
            <Search className="size-3 text-oui-dark-shade" />
            <input
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-oui-medium-shade"
              placeholder="Search field name"
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
            />
            <Filter className="size-3 text-oui-dark-shade" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 py-2">
            <p className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide mb-1">Selected fields</p>
            {SELECTED_FIELDS.map((f) => (
              <div key={f} className="flex items-center gap-1.5 py-0.5 text-xs text-oui-darkest-shade">
                <FieldBadge type="t" />
                <span className="truncate">{f}</span>
              </div>
            ))}
            <p className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide mt-3 mb-1">Available fields</p>
            {filteredFields.map((f) => (
              <div key={f} className="flex items-center gap-1.5 py-0.5 text-xs text-oui-darkest-shade hover:bg-oui-lightest-shade/50 rounded px-1 cursor-pointer">
                <FieldBadge type={f.includes('_ms') || f.includes('requests') || f.includes('duration') ? '#' : 't'} />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Query bar */}
        <div className="flex items-center gap-2 border-b border-oui-lightest-shade px-4 py-2">
          <Filter className="size-3.5 text-oui-primary shrink-0" />
          <div className="h-5 w-px bg-oui-lightest-shade" />
          <span className="text-xs text-oui-darkest-shade font-mono flex-1 truncate">
            service.name:"PaymentService" AND ("lock wait" OR "WAITING" OR "row lock" OR "deadlock")
          </span>
          <span className="text-xs font-medium text-oui-link shrink-0">Lucene</span>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-oui-dark-shade border-b border-oui-lightest-shade">
          <span>Mar 6, 2026 @ 10:30:00.000 – Mar 6, 2026 @ 11:00:00.000</span>
          <span className="text-oui-darkest-shade font-medium">30m</span>
        </div>

        {/* Histogram */}
        <div className="px-4 py-3 border-b border-oui-lightest-shade">
          <div className="flex items-end gap-[2px] h-[80px]">
            {HISTOGRAM_DATA.map((v, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-[1px] min-w-[3px] transition-all ${v > 15 ? 'bg-red-500/80 hover:bg-red-500' : 'bg-amber-500/70 hover:bg-amber-500'}`}
                style={{ height: `${Math.max((v / maxBar) * 100, 2)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-oui-dark-shade">
            <span>10:30</span><span>10:35</span><span>10:40</span><span>10:45</span>
            <span>10:50</span><span>10:55</span><span>11:00</span>
          </div>
          <p className="text-center text-[10px] text-oui-dark-shade mt-1">lock contention events per 30 seconds — escalation after v3.8.2 deployment</p>
        </div>

        {/* Results header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-oui-lightest-shade">
          <span className="text-xs font-semibold text-oui-darkest-shade">
            Results ({LOG_ENTRIES.length}/{LOG_ENTRIES.length})
          </span>
          <button className="flex items-center gap-1 text-xs text-oui-link hover:underline">
            <Download className="size-3" />
            Download as CSV
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[180px_1fr] border-b border-oui-lightest-shade px-4 py-1.5 text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">
          <span>Time</span>
          <span>_source</span>
        </div>

        {/* Log rows */}
        <ScrollArea className="flex-1">
          {LOG_ENTRIES.map((entry, i) => (
            <div
              key={i}
              className="grid grid-cols-[180px_1fr] border-b border-oui-lightest-shade px-4 py-2 hover:bg-oui-lightest-shade/30 cursor-pointer"
              onClick={() => toggleRow(i)}
            >
              <span className="text-xs text-oui-dark-shade">{entry.time}</span>
              <div className="text-xs text-oui-darkest-shade font-mono leading-relaxed">
                {expandedRows.has(i) ? (
                  <pre className="whitespace-pre-wrap text-[11px]">{entry.source}</pre>
                ) : (
                  <p className="line-clamp-3">
                    {entry.source.split('  ').map((pair, j) => {
                      const [key, ...rest] = pair.split(': ');
                      return (
                        <span key={j}>
                          <span className="text-oui-link">{key}</span>
                          {rest.length > 0 && `: ${rest.join(': ')}`}
                          {'  '}
                        </span>
                      );
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
