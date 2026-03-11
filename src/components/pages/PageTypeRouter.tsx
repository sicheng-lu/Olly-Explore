import { FileText } from 'lucide-react';

import type { CanvasPage, InvestigationData } from '../../types';
import { PAGE_TYPES, resolvePageState } from './page-types';
import { SummaryPageEmpty } from './SummaryPageEmpty';
import { SummaryPagePrefill } from './SummaryPagePrefill';
import { DashboardPageEmpty } from './DashboardPageEmpty';
import { DashboardPagePrefill } from './DashboardPagePrefill';
import { LogsPageEmpty } from './LogsPageEmpty';
import { LogsPagePrefill } from './LogsPagePrefill';
import { TracesPageEmpty } from './TracesPageEmpty';
import { TracesPagePrefill } from './TracesPagePrefill';
import { NotePageEmpty } from './NotePageEmpty';
import { NotePagePrefill } from './NotePagePrefill';

export interface PageTypeRouterProps {
  page: CanvasPage;
  hasInvestigationData: boolean;
  workspacePages: CanvasPage[];
  investigationData?: InvestigationData;
  onGenerationComplete?: (pageId: string, content: string) => void;
  onGenerationError?: (pageId: string, error: string) => void;
}

export function PageTypeRouter({
  page,
  hasInvestigationData,
  workspacePages,
  investigationData,
  onGenerationComplete,
  onGenerationError,
}: PageTypeRouterProps) {
  // Fall back to a generic placeholder for unregistered page types
  if (!(page.type in PAGE_TYPES)) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full py-8 px-2 text-slate-400"
        data-testid="page-placeholder-generic"
      >
        <FileText className="size-10 mb-2" />
        <span className="text-sm">Page content for "{page.type}"</span>
      </div>
    );
  }

  const state = resolvePageState(page, hasInvestigationData);

  switch (page.type) {
    case 'summary':
      return state === 'prefill' ? (
        <SummaryPagePrefill summaryContent={investigationData?.summaryContent ?? ''} />
      ) : (
        <SummaryPageEmpty
          workspacePages={workspacePages}
          onGenerationComplete={(content) => onGenerationComplete?.(page.id, content)}
          onGenerationError={(error) => onGenerationError?.(page.id, error)}
        />
      );

    case 'dashboard':
      return state === 'prefill' && investigationData?.dashboardMetrics ? (
        <DashboardPagePrefill metrics={investigationData.dashboardMetrics} />
      ) : (
        <DashboardPageEmpty
          workspacePages={workspacePages}
          onGenerationComplete={(content) => onGenerationComplete?.(page.id, content)}
          onGenerationError={(error) => onGenerationError?.(page.id, error)}
        />
      );

    case 'logs':
      return state === 'prefill' && investigationData?.logEntries ? (
        <LogsPagePrefill logEntries={investigationData.logEntries} />
      ) : (
        <LogsPageEmpty />
      );

    case 'traces':
      return state === 'prefill' && investigationData?.traceData ? (
        <TracesPagePrefill traceData={investigationData.traceData} />
      ) : (
        <TracesPageEmpty />
      );

    case 'note':
      return state === 'prefill' && investigationData?.noteContent ? (
        <NotePagePrefill noteContent={investigationData.noteContent} />
      ) : (
        <NotePageEmpty
          workspacePages={workspacePages}
          onGenerationComplete={(content) => onGenerationComplete?.(page.id, content)}
          onGenerationError={(error) => onGenerationError?.(page.id, error)}
        />
      );

    default:
      return null;
  }
}
