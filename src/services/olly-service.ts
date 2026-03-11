import type { ChatResponse } from '@/types';

interface MockPageMapping {
  pattern: RegExp;
  mockContentKey: string;
  pageType: 'logs' | 'traces' | 'note';
  pageTitle: string;
  responseText: string;
}

const MOCK_PAGE_MAPPINGS: MockPageMapping[] = [
  {
    pattern: /confirm\b.*\broot/i,
    mockContentKey: 'mock-note-lock',
    pageType: 'note',
    pageTitle: 'Note: Root Cause Confirmed',
    responseText: `Got it — I've confirmed Trace ID abc123def456-pool-exhaust-01 as the root cause and created a note with the full analysis. The DB connection pool exhaustion from the new ORM pattern in v3.8.2 is causing the P95 latency spike.\n\nThe note includes the evidence from the trace, impact summary, and recommended next steps.`,
  },
  {
    pattern: /logs?\b.*\b(connection pool|db pool|pool exhaustion)/i,
    mockContentKey: 'mock-logs-dbpool',
    pageType: 'logs',
    pageTitle: 'Logs: DB Pool Exhaustion',
    responseText: `Here are the logs related to the DB Connection Pool Exhaustion hypothesis. I queried for PaymentService error and warning logs mentioning "connection pool" in the 30-minute window around the v3.8.2 deployment.\n\nKey findings in the logs:\n• Connection pool utilization jumped from 45% to 97% within 5 minutes of deployment\n• Multiple ConnectionPoolExhaustedException errors with 5000ms acquisition timeouts\n• ORM is opening 3 parallel connections per transaction instead of reusing one\n• Errors concentrated on all 3 payment nodes, confirming cluster-wide impact`,
  },
  {
    pattern: /traces?\b.*\b(connection pool|db pool|pool exhaustion)/i,
    mockContentKey: 'mock-traces-dbpool',
    pageType: 'traces',
    pageTitle: 'Traces: DB Pool Exhaustion',
    responseText: `I've pulled the traces showing the connection pool exhaustion pattern. You can see the waterfall view comparing v3.8.2 behavior against the v3.8.1 baseline.\n\nNotice how v3.8.2 traces show 3 parallel acquireConnection spans per transaction — the third one often times out waiting for a free connection. The baseline v3.8.1 trace only acquires a single connection and completes in ~420ms total.`,
  },
  {
    pattern: /logs?\b.*\b(lock contention|lock |row lock|locking)/i,
    mockContentKey: 'mock-logs-lock',
    pageType: 'logs',
    pageTitle: 'Logs: Lock Contention',
    responseText: `Here are the logs for the Lock Contention hypothesis. I searched for lock wait events, WAITING thread states, and deadlock indicators on the PaymentService.\n\nKey findings:\n• 68% of payment handler threads are in WAITING state on DB lock acquisition\n• Lock wait times increased 12x on the payments table after the v3.8.2 deployment\n• The new SERIALIZABLE isolation level is causing exclusive row locks to be acquired at transaction start\n• Near-deadlock scenarios detected between concurrent payment transactions`,
  },
  {
    pattern: /traces?\b.*\b(lock contention|lock |row lock|locking)/i,
    mockContentKey: 'mock-traces-lock',
    pageType: 'traces',
    pageTitle: 'Traces: Lock Contention',
    responseText: `I've pulled traces showing the lock contention pattern. The waterfall views clearly show long WAITING spans where transactions are blocked on row-level locks.\n\nThe first two traces show the v3.8.2 behavior — exclusive locks acquired early via SELECT ... FOR UPDATE, causing concurrent requests to queue. The third trace shows a near-deadlock where two transactions were waiting on each other's row locks before one was aborted.`,
  },
];

export const OllyService = {
  async sendMessage(
    _conversationId: string,
    message: string
  ): Promise<ChatResponse> {
    // Check for rule-out prompts first
    const ruleOutMatch = message.match(/rule\s*out\b.*\bhypothesis[:\s]*(.+)/i);
    if (ruleOutMatch) {
      const hypothesisName = ruleOutMatch[1].trim();
      return {
        text: `Got it — I'll rule out "${hypothesisName}" and re-evaluate the remaining hypotheses. Let me gather some additional data to narrow things down.`,
        pageAction: {
          type: 'open',
          pageId: `ruleout||${hypothesisName}`,
        },
      };
    }

    // Check for investigation-related prompts
    for (const mapping of MOCK_PAGE_MAPPINGS) {
      if (mapping.pattern.test(message)) {
        return {
          text: mapping.responseText,
          pageAction: {
            type: 'open',
            pageId: `mock||${mapping.pageType}||${mapping.mockContentKey}||${mapping.pageTitle}`,
          },
        };
      }
    }

    return {
      text: 'This is a mock response from Olly.',
    };
  },
};
