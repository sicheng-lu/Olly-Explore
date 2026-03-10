export function TracesPageEmpty() {
  return (
    <div data-testid="traces-empty" className="flex flex-col h-full min-h-[500px] rounded-lg overflow-hidden border border-oui-lightest-shade bg-white">
      {/* Header: Trace ID, Duration, Timestamp */}
      <div className="flex items-center justify-between border-b border-oui-lightest-shade px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-oui-dark-shade uppercase tracking-wide">Trace ID</span>
          <span className="text-xs text-oui-medium-shade">—</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">Duration</span>
            <span className="text-xs text-oui-medium-shade">—</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">Timestamp</span>
            <span className="text-xs text-oui-medium-shade">—</span>
          </div>
        </div>
      </div>

      {/* Column headers: Service, Operation, Waterfall */}
      <div className="grid grid-cols-[140px_160px_1fr_80px] border-b border-oui-lightest-shade px-4 py-1.5 text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">
        <span>Service</span>
        <span>Operation</span>
        <span>Span Waterfall</span>
        <span className="text-right">Duration</span>
      </div>

      {/* Empty span rows — structural skeleton */}
      <div className="flex-1 flex flex-col">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[140px_160px_1fr_80px] items-center border-b border-oui-lightest-shade px-4 py-2.5"
          >
            {/* Service label placeholder */}
            <div className="h-3 w-20 rounded bg-oui-lightest-shade" />
            {/* Operation placeholder */}
            <div className="h-3 w-24 rounded bg-oui-lightest-shade" />
            {/* Waterfall bar placeholder */}
            <div className="px-2">
              <div
                className="h-4 rounded bg-oui-lightest-shade"
                style={{ width: `${Math.max(15, 70 - i * 12)}%`, marginLeft: `${i * 5}%` }}
              />
            </div>
            {/* Duration placeholder */}
            <div className="h-3 w-10 rounded bg-oui-lightest-shade ml-auto" />
          </div>
        ))}

        {/* No traces message */}
        <div className="flex-1 flex items-center justify-center text-sm text-oui-medium-shade py-12">
          No traces available
        </div>
      </div>
    </div>
  );
}
