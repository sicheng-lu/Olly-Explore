import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Download, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const SELECTED_FIELDS = ['_source'];

const AVAILABLE_FIELDS = [
  '_id', '_index', '_score', '_type', 'category', 'currency',
  'customer_first_name', 'customer_full_name', 'customer_gender',
  'customer_id', 'customer_last_name', 'customer_phone',
  'day_of_week', 'day_of_week_i', 'email', 'event.dataset',
  'geoip.city_name', 'geoip.continent_name', 'geoip.country_iso_code',
  'geoip.location', 'geoip.region_name', 'manufacturer',
];

const HISTOGRAM_DATA = [
  4, 2, 3, 1, 5, 2, 6, 3, 4, 2, 1, 3, 5, 7, 4, 2, 3, 6, 4, 2,
  3, 5, 2, 4, 3, 1, 2, 4, 3, 5, 2, 4, 3, 2, 5, 3, 4, 2, 6, 3,
  4, 2, 3, 8,
];

const LOG_ENTRIES = [
  {
    time: 'Mar 7, 2026 @ 19:00:00.000',
    source: `category: Women's Shoes  currency: EUR  customer_first_name: Pia  customer_full_name: Pia Lawrence  customer_gender: FEMALE  customer_id: 45  customer_last_name: Lawrence  manufacturer: Tigress Enterprises, Angeldale  order_date: Mar 7, 2026 @ 19:00:00.000  order_id: 582920`,
  },
  {
    time: 'Mar 7, 2026 @ 18:51:22.000',
    source: `category: Men's Clothing  currency: EUR  customer_first_name: Phil  customer_full_name: Phil Abbott  customer_gender: MALE  customer_id: 50  customer_last_name: Abbott  day_of_week: Sunday  manufacturer: Microlutions, Elitelligence`,
  },
  {
    time: 'Mar 7, 2026 @ 18:35:31.000',
    source: `category: Men's Shoes, Men's Clothing  currency: EUR  customer_first_name: Phil  customer_full_name: Phil Cummings  customer_gender: MALE  customer_id: 50  customer_last_name: Cummings  manufacturer: Low Tide Media`,
  },
  {
    time: 'Mar 7, 2026 @ 18:32:38.000',
    source: `category: Women's Shoes, Women's Clothing  currency: EUR  customer_first_name: Elyssa  customer_full_name: Elyssa Byrd  customer_gender: FEMALE  customer_id: 27  manufacturer: Pyramidustries`,
  },
];

function FieldBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    t: 'bg-oui-primary/20 text-oui-primary',
    '#': 'bg-oui-link/20 text-oui-link',
    f: 'bg-oui-warning/20 text-oui-warning',
  };
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold shrink-0 ${colors[type] || colors.t}`}>
      {type}
    </span>
  );
}

export function DiscoverPage() {
  const [fieldSearch, setFieldSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const maxBar = Math.max(...HISTOGRAM_DATA);

  const filteredFields = AVAILABLE_FIELDS.filter((f) =>
    f.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-[500px] gap-0 rounded-lg overflow-hidden border border-oui-lightest-shade">
      {/* Sidebar */}
      <div className="w-[200px] shrink-0 border-r border-oui-lightest-shade bg-white flex flex-col">
        {/* Index pattern selector */}
        <div className="flex items-center gap-1.5 border-b border-oui-lightest-shade px-3 py-2">
          <span className="text-xs text-oui-darkest-shade font-medium truncate">Olly@stable::opensear...</span>
          <ChevronDown className="size-3 text-oui-dark-shade shrink-0" />
        </div>

        {/* Field search */}
        <div className="px-2 py-2 border-b border-oui-lightest-shade">
          <div className="flex items-center gap-1.5 rounded border border-oui-lightest-shade px-2 py-1">
            <Search className="size-3 text-oui-dark-shade" />
            <input
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-oui-medium-shade"
              placeholder="Search field name"
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
            />
            <Filter className="size-3 text-oui-dark-shade" />
            <span className="text-[10px] text-oui-dark-shade bg-oui-lightest-shade/50 rounded px-1">0</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 py-2">
            {/* Selected fields */}
            <p className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide mb-1">Selected fields</p>
            {SELECTED_FIELDS.map((f) => (
              <div key={f} className="flex items-center gap-1.5 py-0.5 text-xs text-oui-darkest-shade">
                <FieldBadge type="t" />
                <span className="truncate">{f}</span>
              </div>
            ))}

            {/* Available fields */}
            <p className="text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide mt-3 mb-1">Available fields</p>
            {filteredFields.map((f) => (
              <div key={f} className="flex items-center gap-1.5 py-0.5 text-xs text-oui-darkest-shade hover:bg-oui-lightest-shade/50 rounded px-1 cursor-pointer">
                <FieldBadge type={f.includes('id') || f.includes('week_i') ? '#' : 't'} />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-oui-lightest-shade px-4 py-2">
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-oui-primary" />
            <div className="h-5 w-px bg-oui-lightest-shade" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-oui-link">Lucene</span>
            <ChevronDown className="size-3 text-oui-dark-shade" />
            <span className="text-xs text-oui-darkest-shade">OpenSearch Assistant</span>
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-oui-dark-shade border-b border-oui-lightest-shade">
          <span>Mar 6, 2026 @ 19:00:18.105 – Mar 7, 2026 @ 19:00:18.105 per</span>
          <span className="text-oui-darkest-shade font-medium">Auto</span>
          <ChevronDown className="size-3" />
        </div>

        {/* Histogram */}
        <div className="px-4 py-3 border-b border-oui-lightest-shade">
          <div className="flex items-end gap-[2px] h-[80px]">
            {HISTOGRAM_DATA.map((v, i) => (
              <div
                key={i}
                className="flex-1 bg-oui-link/70 rounded-t-[1px] min-w-[3px] transition-all hover:bg-oui-link"
                style={{ height: `${(v / maxBar) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-oui-dark-shade">
            <span>21:00</span><span>00:00</span><span>03:00</span><span>06:00</span>
            <span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span>
          </div>
          <p className="text-center text-[10px] text-oui-dark-shade mt-1">order_date per 30 minutes</p>
        </div>

        {/* Results header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-oui-lightest-shade">
          <span className="text-xs font-semibold text-oui-darkest-shade">Results (156/156)</span>
          <button className="flex items-center gap-1 text-xs text-oui-link hover:underline">
            <Download className="size-3" />
            Download as CSV
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[180px_1fr] border-b border-oui-lightest-shade px-4 py-1.5 text-[10px] font-semibold text-oui-dark-shade uppercase tracking-wide">
          <span>Time</span>
          <span>_source</span>
        </div>

        {/* Log rows */}
        <ScrollArea className="flex-1">
          {LOG_ENTRIES.map((entry, i) => (
            <div
              key={i}
              className="grid grid-cols-[180px_1fr] border-b border-oui-lightest-shade px-4 py-2 hover:bg-oui-lightest-shade/30 cursor-pointer"
              onClick={() => toggleRow(i)}
            >
              <span className="text-xs text-oui-dark-shade">{entry.time}</span>
              <div className="text-xs text-oui-darkest-shade font-mono leading-relaxed">
                {expandedRows.has(i) ? (
                  <pre className="whitespace-pre-wrap text-[11px]">{entry.source}</pre>
                ) : (
                  <p className="line-clamp-3">
                    {entry.source.split('  ').map((pair, j) => {
                      const [key, ...rest] = pair.split(': ');
                      return (
                        <span key={j}>
                          <span className="text-oui-link">{key}</span>
                          {rest.length > 0 && `: ${rest.join(': ')}`}
                          {'  '}
                        </span>
                      );
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
