import { useState } from 'react';
import { Search, ChevronDown, Download, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Mock logs page for Hypothesis 1: DB Connection Pool Exhaustion.
 * Query: service.name:"PaymentService" AND log.level:"ERROR" AND "connection pool"
 */

const SELECTED_FIELDS = ['_source'];

const AVAILABLE_FIELDS = [
  '_id', '_index', 'service.name', 'log.level', 'message',
  'db.pool.active', 'db.pool.max', 'db.pool.wait_time_ms',
  'deployment.version', 'host.name', 'trace.id', 'span.id',
  'transaction.type', 'db.statement', 'db.connection_id',
  'thread.name', 'error.type', 'error.message',
];

const HISTOGRAM_DATA = [
  1, 1, 0, 1, 0, 1, 1, 2, 1, 1, 0, 1, 2, 3, 4, 6, 8, 12, 15, 18,
  22, 25, 28, 30, 32, 35, 33, 36, 34, 38, 35, 37, 36, 38, 34, 36, 35, 37, 36, 35,
  34, 36, 35, 37,
];

const LOG_ENTRIES = [
  {
    time: 'Mar 6, 2026 @ 10:55:12.334',
    source: `service.name: PaymentService  log.level: ERROR  message: Connection pool exhausted — cannot acquire connection within 5000ms timeout  db.pool.active: 97  db.pool.max: 100  db.pool.wait_time_ms: 5003  deployment.version: v3.8.2  host.name: payment-node-02  trace.id: abc123def456  thread.name: payment-handler-47`,
  },
  {
    time: 'Mar 6, 2026 @ 10:54:58.112',
    source: `service.name: PaymentService  log.level: WARN  message: Connection pool utilization at 95% — approaching saturation  db.pool.active: 95  db.pool.max: 100  db.pool.wait_time_ms: 3200  deployment.version: v3.8.2  host.name: payment-node-01  trace.id: def789abc012  thread.name: payment-handler-31`,
  },
  {
    time: 'Mar 6, 2026 @ 10:54:41.887',
    source: `service.name: PaymentService  log.level: ERROR  message: Failed to acquire DB connection for payment validation — pool saturated  db.pool.active: 98  db.pool.max: 100  db.pool.wait_time_ms: 5001  deployment.version: v3.8.2  host.name: payment-node-03  trace.id: 789ghi012jkl  error.type: ConnectionPoolExhaustedException  transaction.type: payment-process`,
  },
  {
    time: 'Mar 6, 2026 @ 10:53:22.445',
    source: `service.name: PaymentService  log.level: ERROR  message: ORM query opened 3 parallel connections for single transaction — unexpected connection multiplier  db.pool.active: 93  db.pool.max: 100  db.statement: SELECT * FROM payment_validations WHERE txn_id = ? FOR UPDATE  deployment.version: v3.8.2  host.name: payment-node-01  db.connection_id: conn-8842`,
  },
  {
    time: 'Mar 6, 2026 @ 10:52:05.221',
    source: `service.name: PaymentService  log.level: WARN  message: Connection acquisition latency exceeding 2000ms — pool contention detected  db.pool.active: 88  db.pool.max: 100  db.pool.wait_time_ms: 2340  deployment.version: v3.8.2  host.name: payment-node-02  thread.name: payment-handler-12`,
  },
  {
    time: 'Mar 6, 2026 @ 10:50:33.109',
    source: `service.name: PaymentService  log.level: ERROR  message: Transaction rolled back — connection pool timeout during payment fraud check sub-query  db.pool.active: 91  db.pool.max: 100  db.pool.wait_time_ms: 5002  deployment.version: v3.8.2  host.name: payment-node-03  error.type: TransactionRollbackException  trace.id: mno345pqr678`,
  },
  {
    time: 'Mar 6, 2026 @ 10:48:17.556',
    source: `service.name: PaymentService  log.level: INFO  message: Connection pool stats — active connections spiked post-deployment  db.pool.active: 78  db.pool.max: 100  db.pool.wait_time_ms: 890  deployment.version: v3.8.2  host.name: payment-node-01  thread.name: pool-monitor-1`,
  },
  {
    time: 'Mar 6, 2026 @ 10:44:02.003',
    source: `service.name: PaymentService  log.level: INFO  message: Deployment v3.8.2 activated — new ORM query pattern enabled for payment validation  deployment.version: v3.8.2  host.name: payment-node-01  thread.name: deployer-main`,
  },
  {
    time: 'Mar 6, 2026 @ 10:42:55.881',
    source: `service.name: PaymentService  log.level: INFO  message: Deployment v3.8.2 rolling out — 3 of 3 nodes updated  deployment.version: v3.8.2  host.name: payment-node-03  thread.name: deployer-main`,
  },
  {
    time: 'Mar 6, 2026 @ 10:41:30.220',
    source: `service.name: PaymentService  log.level: INFO  message: Connection pool healthy — baseline utilization normal  db.pool.active: 45  db.pool.max: 100  db.pool.wait_time_ms: 12  deployment.version: v3.8.1  host.name: payment-node-01  thread.name: pool-monitor-1`,
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

export function LogsPageMockDBPool() {
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
    <div data-testid="logs-mock-dbpool" className="flex h-full min-h-[500px] gap-0 rounded-lg overflow-hidden border border-oui-lightest-shade">
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
                <FieldBadge type={f.includes('id') || f.includes('active') || f.includes('max') || f.includes('wait_time') ? '#' : 't'} />
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
            service.name:"PaymentService" AND log.level:("ERROR" OR "WARN") AND "connection pool"
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
                className={`flex-1 rounded-t-[1px] min-w-[3px] transition-all ${v > 15 ? 'bg-red-500/80 hover:bg-red-500' : 'bg-oui-link/70 hover:bg-oui-link'}`}
                style={{ height: `${Math.max((v / maxBar) * 100, 2)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-oui-dark-shade">
            <span>10:30</span><span>10:35</span><span>10:40</span><span>10:45</span>
            <span>10:50</span><span>10:55</span><span>11:00</span>
          </div>
          <p className="text-center text-[10px] text-oui-dark-shade mt-1">log events per 30 seconds — spike after v3.8.2 deployment at 10:42</p>
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
