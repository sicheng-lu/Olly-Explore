import { X, FileText } from 'lucide-react';
import type { ArtifactData } from '../../data/agent-mock-dialogs';
import { ChartArtifact } from './ChartArtifact';
import { DiagramArtifact } from './DiagramArtifact';
import { CodeArtifact } from './CodeArtifact';
import { MarkdownArtifact } from './MarkdownArtifact';

interface ArtifactPanelProps {
  artifact: ArtifactData | null;
  onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  return (
    <div className="flex flex-col h-full bg-slate-800 text-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <span className="text-sm font-medium text-slate-300 truncate">
          {artifact?.title ?? 'Artifact'}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close artifact panel"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 min-h-0 p-4">
        {artifact ? renderArtifact(artifact) : <EmptyState />}
      </div>
    </div>
  );
}

function renderArtifact(artifact: ArtifactData) {
  switch (artifact.type) {
    case 'chart':
      return <ChartArtifact config={artifact} />;
    case 'diagram':
      return <DiagramArtifact config={artifact} />;
    case 'code':
      return <CodeArtifact config={artifact} />;
    case 'markdown':
      return <MarkdownArtifact config={artifact} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          Unsupported artifact type
        </div>
      );
  }
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
      <FileText size={40} strokeWidth={1.5} />
      <p className="text-sm">No artifact selected</p>
      <p className="text-xs text-slate-600">Click an artifact card in the chat to view it here</p>
    </div>
  );
}
