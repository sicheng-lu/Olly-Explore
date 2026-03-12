/**
 * Mock logs page for Hypothesis 1: DB Connection Pool Exhaustion.
 * Simplified view showing key log entries.
 */

const LOG_ENTRIES = [
  {
    time: '10:55:12',
    level: 'ERROR',
    message: 'Connection pool exhausted — cannot acquire connection within 5000ms timeout',
    fields: 'db.pool.active: 97/100 · host: payment-node-02 · version: v3.8.2',
  },
  {
    time: '10:54:41',
    level: 'ERROR',
    message: 'Failed to acquire DB connection for payment validation — pool saturated',
    fields: 'db.pool.active: 98/100 · host: payment-node-03 · version: v3.8.2',
  },
  {
    time: '10:53:22',
    level: 'ERROR',
    message: 'ORM query opened 3 parallel connections for single transaction',
    fields: 'db.pool.active: 93/100 · host: payment-node-01 · version: v3.8.2',
  },
  {
    time: '10:44:02',
    level: 'INFO',
    message: 'Deployment v3.8.2 activated — new ORM query pattern enabled',
    fields: 'host: payment-node-01 · version: v3.8.2',
  },
  {
    time: '10:41:30',
    level: 'INFO',
    message: 'Connection pool healthy — baseline utilization normal',
    fields: 'db.pool.active: 45/100 · wait: 12ms · version: v3.8.1',
  },
];

const LEVEL_COLORS: Record<string, string> = {
  ERROR: 'text-red-500',
  WARN: 'text-amber-500',
  INFO: 'text-oui-dark-shade',
};

export function LogsPageMockDBPool() {
  return (
    <div data-testid="logs-mock-dbpool" className="flex flex-col gap-0 text-xs">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-oui-lightest-shade">
        <span className="font-mono text-oui-dark-shade truncate">
          service.name:"PaymentService" AND "connection pool"
        </span>
        <span className="ml-auto text-oui-dark-shade shrink-0">{LOG_ENTRIES.length} hits</span>
      </div>
      {LOG_ENTRIES.map((entry, i) => (
        <div key={i} className="flex gap-3 px-3 py-2 border-b border-oui-lightest-shade hover:bg-oui-lightest-shade/30">
          <span className="text-oui-dark-shade shrink-0 w-[52px]">{entry.time}</span>
          <span className={`shrink-0 w-[40px] font-medium ${LEVEL_COLORS[entry.level] ?? ''}`}>{entry.level}</span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-oui-darkest-shade">{entry.message}</span>
            <span className="text-oui-dark-shade text-[11px]">{entry.fields}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
