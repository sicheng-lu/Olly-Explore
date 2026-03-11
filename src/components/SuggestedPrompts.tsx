import { CornerDownLeft } from 'lucide-react';
import type { SuggestedPrompt } from '@/types';

interface SuggestedPromptsProps {
  onPromptClick: (text: string) => void;
  className?: string;
}

const WORKSPACE_TYPE_ICONS: Record<string, string> = {
  observability: '/image/obv.svg',
  security: '/image/security.svg',
  search: '/image/search.svg',
};

const DEFAULT_PROMPTS: (SuggestedPrompt & { workspaceType?: string })[] = [
  { id: 'create-alert', text: 'Create alert', category: 'action' },
  { id: 'error-spike', text: 'Why are error rates spiking', category: 'action' },
  { id: 'recent-anomalies', text: 'Summarize recent anomalies', category: 'action' },
  { id: 'observability-workspace', text: 'Start an observability workspace', category: 'workspace', workspaceType: 'observability' },
  { id: 'security-workspace', text: 'Start a security analytics workspace', category: 'workspace', workspaceType: 'security' },
  { id: 'search-workspace', text: 'Start a search workspace', category: 'workspace', workspaceType: 'search' },
];

export function SuggestedPrompts({ onPromptClick, className = '' }: SuggestedPromptsProps) {
  return (
    <div
      className={`flex flex-nowrap gap-3 overflow-x-auto overflow-y-visible scrollbar-none ${className}`}
      data-testid="suggested-prompts"
    >
      {DEFAULT_PROMPTS.map((prompt) => {
        const isWorkspace = prompt.category === 'workspace';
        return (
          <button
            key={prompt.id}
            onClick={() => onPromptClick(prompt.text)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 transition-colors whitespace-nowrap ${
              isWorkspace
                ? 'bg-white/60 hover:bg-white/80'
                : 'bg-slate-50/80 hover:bg-slate-100/80'
            }`}
          >
            {isWorkspace && prompt.workspaceType ? (
              <img
                src={WORKSPACE_TYPE_ICONS[prompt.workspaceType]}
                alt=""
                className="size-4"
              />
            ) : (
              <CornerDownLeft className="size-4 text-slate-400" />
            )}
            {prompt.text}
          </button>
        );
      })}
    </div>
  );
}
