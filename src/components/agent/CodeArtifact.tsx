import type { CodeArtifactData } from '../../data/agent-mock-dialogs';

interface CodeArtifactProps {
  config: CodeArtifactData;
}

export function CodeArtifact({ config }: CodeArtifactProps) {
  const { title, language, code } = config;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 px-1">{title}</h3>
      <div className="flex-1 min-h-0 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
        <div className="flex items-center px-3 py-1.5 bg-slate-900 border-b border-slate-700">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{language}</span>
        </div>
        <div className="flex-1 overflow-auto bg-slate-900/80 p-4">
          <pre className="m-0">
            <code className="text-sm font-mono text-slate-200 leading-relaxed whitespace-pre">
              {code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
