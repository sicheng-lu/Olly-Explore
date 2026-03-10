import type { CanvasPage, PageTypeConfig } from '../../types';

export const PAGE_TYPES: Record<string, PageTypeConfig> = {
  summary: { id: 'summary', label: 'Summary', autoGenerates: true },
  dashboard: { id: 'dashboard', label: 'Dashboard', autoGenerates: true },
  logs: { id: 'logs', label: 'Logs', autoGenerates: false },
  traces: { id: 'traces', label: 'Traces', autoGenerates: false },
} as const;

export type PageTypeId = keyof typeof PAGE_TYPES;

export function resolvePageState(
  _page: CanvasPage,
  hasInvestigationData: boolean
): 'empty' | 'prefill' {
  return hasInvestigationData ? 'prefill' : 'empty';
}
