import { useCallback, useState } from 'react';
import { StickyNote } from 'lucide-react';

import { GenerationService } from '../../services/generation-service';
import type { CanvasPage } from '../../types';
import { GeneratingAnimation } from './GeneratingAnimation';

interface NotePageEmptyProps {
  workspacePages: CanvasPage[];
  onGenerationComplete?: (content: string) => void;
  onGenerationError?: (error: string) => void;
}

type GenerationState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'complete'; content: string }
  | { status: 'error'; error: string };

export function NotePageEmpty({
  workspacePages,
  onGenerationComplete,
  onGenerationError,
}: NotePageEmptyProps) {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<GenerationState>({ status: 'idle' });

  const generate = useCallback(async () => {
    if (!prompt.trim()) return;
    setState({ status: 'generating' });

    const result = await GenerationService.generateNote(workspacePages, prompt);

    if (result.error) {
      setState({ status: 'error', error: result.error });
      onGenerationError?.(result.error);
    } else {
      setState({ status: 'complete', content: result.content });
      onGenerationComplete?.(result.content);
    }
  }, [prompt, workspacePages, onGenerationComplete, onGenerationError]);

  if (state.status === 'idle' || state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center" data-testid="note-empty">
        <StickyNote className="size-10 text-slate-300" />
        <p className="text-sm text-slate-500">Describe what you'd like to capture in this note</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Summarize the root cause and next steps..."
          className="w-full max-w-md rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
          rows={3}
          data-testid="note-prompt-input"
          aria-label="Note prompt"
        />
        {state.status === 'error' && (
          <p className="text-sm text-red-600" data-testid="generation-error">{state.error}</p>
        )}
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={generate}
          disabled={!prompt.trim()}
          data-testid="generate-note-button"
        >
          {state.status === 'error' ? 'Retry' : 'Generate Note'}
        </button>
      </div>
    );
  }

  if (state.status === 'generating') {
    return <GeneratingAnimation label="Generating note..." />;
  }

  return (
    <div className="p-6" data-testid="note-content">
      <p className="text-sm text-slate-700 whitespace-pre-wrap">{state.content}</p>
    </div>
  );
}
