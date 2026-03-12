/**
 * Mock logs page for Hypothesis 2: Lock Contention on Payment Records.
 * Simplified view showing key log entries.
 */

const LOG_ENTRIES = [
  {
    time: '10:56:01',
    level: 'ERROR',
    message: 'Lock wait timeout exceeded on payments table — transaction aborted after 8000ms',
    fields: 'lock.type: ROW_EXCLUSIVE · table: payments · host: payment-node-02 · version: v3.8.2',
  },
  {
    time: '10:55:18',
    level: 'ERROR',
    message: 'Exclusive row lock acquired too early in transaction — blocking concurrent requests',
    fields: 'lock.wait: 6200ms · table: payments · host: payment-node-03 · version: v3.8.2',
  },
  {
    time: '10:54:33',
    level: 'WARN',
    message: 'Lock convoy detected — sequential lock acquisition causing cascading waits',
    fields: 'concurrent.requests: 289 · txn.duration: 4500ms · host: payment-node-01 · version: v3.8.2',
  },
  {
    time: '10:43:22',
    level: 'INFO',
    message: 'Transaction isolation level changed to SERIALIZABLE in v3.8.2 payment flow',
    fields: 'host: payment-node-01 · version: v3.8.2',
  },
  {
    time: '10:41:15',
    level: 'INFO',
    message: 'Lock wait times nominal — no contention detected',
    fields: 'lock.wait: 8ms · concurrent.requests: 180 · version: v3.8.1',
  },
];

const LEVEL_COLORS: Record<string, string> = {
  ERROR: 'text-red-500',
  WARN: 'text-amber-500',
  INFO: 'text-oui-dark-shade',
};

export function LogsPageMockLockContention() {
  return (
    <div data-testid="logs-mock-lock" className="flex flex-col gap-0 text-xs">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-oui-lightest-shade">
        <span className="font-mono text-oui-dark-shade truncate">
          service.name:"PaymentService" AND ("lock wait" OR "row lock" OR "deadlock")
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
