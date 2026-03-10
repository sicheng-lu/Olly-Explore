import { useCallback, useState } from 'react';
import { FileText } from 'lucide-react';

import { GenerationService } from '../../services/generation-service';
import type { CanvasPage } from '../../types';
import { GeneratingAnimation } from './GeneratingAnimation';

interface SummaryPageEmptyProps {
  workspacePages: CanvasPage[];
  onGenerationComplete?: (content: string) => void;
  onGenerationError?: (error: string) => void;
}

type GenerationState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'complete'; content: string }
  | { status: 'error'; error: string };

export function SummaryPageEmpty({
  workspacePages,
  onGenerationComplete,
  onGenerationError,
}: SummaryPageEmptyProps) {
  const [state, setState] = useState<GenerationState>({ status: 'idle' });

  const generate = useCallback(async () => {
    setState({ status: 'generating' });

    const result = await GenerationService.generateSummary(workspacePages);

    if (result.error) {
      setState({ status: 'error', error: result.error });
      onGenerationError?.(result.error);
    } else {
      setState({ status: 'complete', content: result.content });
      onGenerationComplete?.(result.content);
    }
  }, [workspacePages, onGenerationComplete, onGenerationError]);

  if (state.status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 text-center" data-testid="summary-empty">
        <FileText className="size-10 text-slate-300" />
        <p className="text-sm text-slate-500">No summary yet</p>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
          onClick={generate}
          data-testid="generate-button"
        >
          Generate Summary
        </button>
      </div>
    );
  }

  if (state.status === 'generating') {
    return <GeneratingAnimation label="Generating summary..." />;
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-red-600" data-testid="generation-error">
          {state.error}
        </p>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
          onClick={generate}
          data-testid="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="summary-content">
      <p className="text-sm text-slate-700 whitespace-pre-wrap">{state.content}</p>
    </div>
  );
}
