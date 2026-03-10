import { Shield, Compass, Activity, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURE_CARDS = [
  {
    icon: Shield,
    description: 'Configure Security Analytics tools and components to get started.',
    label: 'Get started guide',
  },
  {
    icon: Compass,
    description: 'Explore data to uncover and discover insights.',
    label: 'Discover',
  },
  {
    icon: Activity,
    description: 'Identify security threats in your log data with detection rules.',
    label: 'Threat detection',
  },
  {
    icon: Waves,
    description: 'Scan your log data for malicious actors from known indicators of compromise.',
    label: 'Threat intelligence',
  },
];

const STAT_CARDS = [
  { label: 'Total active threat alerts', value: 0 },
  { label: 'Correlations', value: 0 },
  { label: 'Detection rule findings', value: 0 },
  { label: 'Threat intel findings', value: 0 },
];

const FINDINGS_SECTIONS = [
  { title: 'Recent threat alerts', action: 'View Alerts' },
  { title: 'Recent detection rule findings', action: 'View all' },
  { title: 'Recent threat intel findings', action: 'View all' },
];

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-3 min-h-[500px]">
      {/* Feature cards */}
      <div className="grid grid-cols-4 gap-3">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-oui-lightest-shade bg-white p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <card.icon className="size-6 text-oui-link" />
            <p className="text-xs text-oui-dark-shade leading-relaxed">{card.description}</p>
            <p className="text-xs font-medium text-oui-darkest-shade mt-auto">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Stat counters */}
      <div className="grid grid-cols-4 gap-3">
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-oui-lightest-shade bg-oui-lightest-shade/30 px-4 py-3 flex flex-col items-center"
          >
            <span className="text-[11px] text-oui-dark-shade text-center">{stat.label}</span>
            <span className="text-xl font-bold text-oui-darkest-shade mt-1">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Findings sections */}
      <div className="grid grid-cols-2 gap-3">
        {FINDINGS_SECTIONS.slice(0, 2).map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-oui-lightest-shade bg-white p-5"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-semibold text-oui-darkest-shade">{section.title}</h4>
              <Button variant="outline" size="sm" className="text-xs h-7 border-oui-link text-oui-link hover:bg-oui-link/5">
                {section.action}
              </Button>
            </div>
            <p className="text-xs text-oui-dark-shade text-center py-4">
              No recent {section.title.toLowerCase().replace('recent ', '')}.<br />
              Adjust the time range to see more results.
            </p>
          </div>
        ))}
      </div>

      {/* Last findings section - full width but half */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-oui-lightest-shade bg-white p-5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-semibold text-oui-darkest-shade">{FINDINGS_SECTIONS[2].title}</h4>
            <Button variant="outline" size="sm" className="text-xs h-7 border-oui-link text-oui-link hover:bg-oui-link/5">
              {FINDINGS_SECTIONS[2].action}
            </Button>
          </div>
          <p className="text-xs text-oui-dark-shade text-center py-4">
            No recent findings.<br />
            Adjust the time range to see more results.
          </p>
        </div>
      </div>
    </div>
  );
}
