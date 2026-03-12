interface GeneratingAnimationProps {
  label?: string;
}

export function GeneratingAnimation({ label = 'Generating...' }: GeneratingAnimationProps) {
  return (
    <div
      className="w-full pointer-events-none"
      data-testid="generating-animation"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col gap-4 p-6">
        <p className="text-sm text-slate-500 animate-pulse">{label}</p>

        {/* Skeleton lines */}
        <div className="space-y-3">
          <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-slate-200 animate-pulse [animation-delay:150ms]" />
          <div className="h-4 w-5/6 rounded bg-slate-200 animate-pulse [animation-delay:300ms]" />
        </div>

        {/* Skeleton block */}
        <div className="h-24 w-full rounded-lg bg-slate-100 animate-pulse [animation-delay:200ms]" />

        <div className="space-y-3">
          <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse [animation-delay:100ms]" />
          <div className="h-4 w-full rounded bg-slate-200 animate-pulse [animation-delay:250ms]" />
        </div>
      </div>
    </div>
  );
}
