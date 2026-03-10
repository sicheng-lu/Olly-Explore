import { CornerDownLeft, LayoutGrid } from 'lucide-react';
import type { SuggestedPrompt } from '@/types';

interface SuggestedPromptsProps {
  onPromptClick: (text: string) => void;
  className?: string;
}

const DEFAULT_PROMPTS: SuggestedPrompt[] = [
  { id: 'error-spike', text: 'Why are error rates spiking', category: 'action' },
  { id: 'top-latency', text: 'Show top latency contributors', category: 'action' },
  { id: 'last-deployment', text: 'Summarize recent anomalies', category: 'action' },
  { id: 'last-deployment-2', text: 'What happened during last deployment', category: 'action' },
  { id: 'observability-workspace', text: 'Start an observability workspace', category: 'workspace' },
  { id: 'security-workspace', text: 'Start a security analytics workspace', category: 'workspace' },
  { id: 'search-workspace', text: 'Start a search workspace', category: 'workspace' },
];

export function SuggestedPrompts({ onPromptClick, className = '' }: SuggestedPromptsProps) {
  return (
    <div
      className={`flex flex-nowrap gap-3 overflow-x-auto overflow-y-visible scrollbar-none ${className}`}
      data-testid="suggested-prompts"
    >
      {DEFAULT_PROMPTS.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => onPromptClick(prompt.text)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-2 py-2 text-xs text-slate-500 transition-colors hover:bg-slate-50 whitespace-nowrap"
        >
          {prompt.category === 'workspace' ? (
            <LayoutGrid className="size-4 text-slate-400" />
          ) : (
            <CornerDownLeft className="size-4 text-slate-400" />
          )}
          {prompt.text}
        </button>
      ))}
    </div>
  );
}
