interface SummaryPagePrefillProps {
  summaryContent: string;
}

export function SummaryPagePrefill({ summaryContent }: SummaryPagePrefillProps) {
  const blocks = summaryContent.split('\n\n');

  return (
    <div className="w-full space-y-4 py-4 px-2" data-testid="summary-prefill">
      {blocks.map((block, i) => {
        if (block.startsWith('# ') && !block.startsWith('## '))
          return (
            <h2 key={i} className="text-base font-semibold text-slate-900 tracking-tight">
              {block.slice(2)}
            </h2>
          );

        if (block.startsWith('## '))
          return (
            <h3
              key={i}
              className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-6 mb-2"
            >
              {block.slice(3)}
            </h3>
          );

        if (block.trim() === '---')
          return <div key={i} className="h-px bg-slate-100 my-1" />;

        if (block.startsWith('> '))
          return (
            <div key={i} className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-800 leading-relaxed">{block.slice(2)}</p>
            </div>
          );

        if (block.startsWith('- '))
          return (
            <ul key={i} className="space-y-2 pl-0.5">
              {block.split('\n').map((line, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed"
                >
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-300" />
                  {line.replace(/^- /, '')}
                </li>
              ))}
            </ul>
          );

        return (
          <p key={i} className="text-sm text-slate-600 leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}
