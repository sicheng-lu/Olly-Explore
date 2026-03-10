import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface MonitorItem {
  id: string;
  name: string;
  triggerType: string;
  interval: string;
  visualization: string;
  enabled: boolean;
}

const MOCK_MONITORS: MonitorItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: crypto.randomUUID(),
  name: 'test-monitor',
  triggerType: 'Per query',
  interval: 'Every 1 minute',
  visualization: 'Visual Graph',
  enabled: true,
}));

interface AlertSkillsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AlertSkillsPanel({ open, onClose }: AlertSkillsPanelProps) {
  const [activeTab, setActiveTab] = useState<'alert' | 'skills'>('alert');
  const [monitors, setMonitors] = useState(MOCK_MONITORS);

  if (!open) return null;

  const handleToggle = (id: string) => {
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col gap-6 bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center">
          <ShieldAlert className="size-4 text-oui-dark-shade" />
        </div>
        <span className="flex-1 text-xs text-oui-medium-shade">
          Alert &amp; Skills for Olly
        </span>
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center"
          aria-label="Close panel"
        >
          <X className="size-4 text-oui-dark-shade" />
        </button>
      </div>

      {/* Toggle Group */}
      <div className="flex w-full items-center rounded-lg border border-oui-light-shade overflow-hidden">
        <button
          onClick={() => setActiveTab('alert')}
          className={`flex flex-1 items-center justify-center p-2 text-xs font-medium transition-colors ${
            activeTab === 'alert'
              ? 'bg-oui-primary text-white'
              : 'bg-oui-empty-shade text-oui-dark-shade hover:bg-oui-lightest-shade'
          }`}
        >
          Alert
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex flex-1 items-center justify-center p-2 text-xs font-medium transition-colors ${
            activeTab === 'skills'
              ? 'bg-oui-primary text-white'
              : 'bg-oui-empty-shade text-oui-dark-shade hover:bg-oui-lightest-shade'
          }`}
        >
          Skills
        </button>
      </div>

      {/* Monitor List */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto scrollbar-none">
        {monitors.map((monitor) => (
          <div
            key={monitor.id}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm text-black">{monitor.name}</span>
              <div className="flex items-center gap-2 text-xs text-oui-medium-shade">
                <span>{monitor.triggerType}</span>
                <span className="h-3 w-px bg-oui-light-shade" />
                <span>{monitor.interval}</span>
                <span className="h-3 w-px bg-oui-light-shade" />
                <span>{monitor.visualization}</span>
              </div>
            </div>
            <ToggleSwitch
              checked={monitor.enabled}
              onChange={() => handleToggle(monitor.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-[14px] w-[26px] shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? 'bg-oui-link' : 'bg-oui-light-shade'
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-3 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[13px]' : 'translate-x-px'
        }`}
        style={{ marginTop: '1px' }}
      />
    </button>
  );
}
