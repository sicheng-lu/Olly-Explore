import { Search, ChevronDown, Filter, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

function FieldBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    t: 'bg-oui-primary/20 text-oui-primary',
    '#': 'bg-oui-link/20 text-oui-link',
  };
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold shrink-0 ${colors[type] || colors.t}`}>
      {type}
    </span>
  );
}

const EMPTY_HISTOGRAM = Array(44).fill(0);

const SIDEBAR_FIELDS = [
  '_id', '_index', '_score', '_type', 'category', 'currency',
  'customer_first_name', 'customer_full_name', 'customer_gender',
  'customer_id', 'customer_last_name', 'customer_phone',
  'day_of_week', 'day_of_week_i', 'email', 'event.dataset',
  'geoip.city_name', 'geoip.continent_name', 'geoip.country_iso_code',
  'geoip.location', 'geoip.region_name', 'manufacturer',
];

export function LogsPageEmpty() {
  return (
    <div data-testid="logs-empty" className="flex h-full min-h-[500px] gap-0 rounded-lg overflow-hidden border border-oui-lightest-shade">
      {/* Sidebar */}
      <div className="w-[200px] shrink-0 border-r border-oui-lightest-shade bg-white flex flex-col">
        {/* Index pattern selector */}
        <div className="flex items-center gap-1.5 border-b border-oui-lightest-shade px-3 py-2">
          <span className="text-xs text-oui-darkest-shade font-medium truncate">Select index pattern...</span>
          <ChevronDown className="size-3 text-oui-dark-shade shrink-0" />
        </div>

        {/* Field search */}
        <div className="px-2 py-2 border-b border-oui-lightest-shade">
          <div className="flex items-center gap-1.5 rounded border border-oui-lightest-shade px-2 py-1">
            <Search className="size-3 text-oui-dark-shade" />
            <input
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-oui-medium-shade"
              placeholder="Search field name"
              readOnly
            />
            <Filter className="size-3 text-oui-dark-shade" />
            <span className="text-[10px] text-oui-dark-shade bg-oui-lightest-shade/50 rounded px-1">0</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 py-2">
            {/* Selected fields */}
            <p className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide mb-1">Selected fields</p>
            <div className="flex items-center gap-1.5 py-0.5 text-xs text-oui-darkest-shade">
              <FieldBadge type="t" />
              <span className="truncate">_source</span>
            </div>

            {/* Available fields */}
            <p className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide mt-3 mb-1">Available fields</p>
            {SIDEBAR_FIELDS.map((f) => (
              <div key={f} className="flex items-center gap-1.5 py-0.5 text-xs text-oui-medium-shade rounded px-1">
                <FieldBadge type={f.includes('id') || f.includes('week_i') ? '#' : 't'} />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar / search bar */}
        <div className="flex items-center justify-between border-b border-oui-lightest-shade px-4 py-2">
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-oui-primary" />
            <div className="h-5 w-px bg-oui-lightest-shade" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-oui-link">Lucene</span>
            <ChevronDown className="size-3 text-oui-dark-shade" />
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-oui-dark-shade border-b border-oui-lightest-shade">
          <span>No date range selected</span>
        </div>

        {/* Histogram area (empty / flat bars) */}
        <div className="px-4 py-3 border-b border-oui-lightest-shade">
          <div className="flex items-end gap-[2px] h-[80px]">
            {EMPTY_HISTOGRAM.map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-oui-lightest-shade rounded-t-[1px] min-w-[3px]"
                style={{ height: '2px' }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-oui-dark-shade">
            <span>00:00</span><span>03:00</span><span>06:00</span><span>09:00</span>
            <span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-oui-lightest-shade">
          <span className="text-xs font-semibold text-oui-darkest-shade">0 results</span>
          <button className="flex items-center gap-1 text-xs text-oui-medium-shade cursor-default" disabled>
            <Download className="size-3" />
            Download as CSV
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[180px_1fr] border-b border-oui-lightest-shade px-4 py-1.5 text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">
          <span>Time</span>
          <span>_source</span>
        </div>

        {/* Empty results table */}
        <div className="flex-1 flex items-center justify-center text-sm text-oui-medium-shade py-12">
          No results found
        </div>
      </div>
    </div>
  );
}
