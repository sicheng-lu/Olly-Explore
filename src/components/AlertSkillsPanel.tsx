import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface MonitorItem {
  id: string;
  name: string;
  triggerType: string;
  interval: string;
  visualization: string;
  enabled: boolean;
}

const MOCK_MONITORS: MonitorItem[] = [
  { id: '1', name: 'HTTP 5xx Error Rate', triggerType: 'Per query', interval: 'Every 1 minute', visualization: 'Line Chart', enabled: true },
  { id: '2', name: 'DB Connection Pool Exhaustion', triggerType: 'Bucket level', interval: 'Every 5 minutes', visualization: 'Gauge', enabled: true },
  { id: '3', name: 'Payment Latency p99 > 500ms', triggerType: 'Per query', interval: 'Every 1 minute', visualization: 'Area Chart', enabled: true },
  { id: '4', name: 'SMS Delivery Failure Rate', triggerType: 'Per query', interval: 'Every 2 minutes', visualization: 'Bar Chart', enabled: false },
  { id: '5', name: 'CPU Utilization > 85%', triggerType: 'Bucket level', interval: 'Every 1 minute', visualization: 'Heat Map', enabled: true },
  { id: '6', name: 'Log Ingestion Lag > 30s', triggerType: 'Per query', interval: 'Every 3 minutes', visualization: 'Line Chart', enabled: true },
];

interface AlertSkillsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AlertSkillsPanel({ open, onClose }: AlertSkillsPanelProps) {
  const [monitors, setMonitors] = useState(MOCK_MONITORS);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setAnimating(true);
      // Mount first, then trigger slide-in on next frame
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else if (visible) {
      setVisible(false);
      timeoutRef.current = setTimeout(() => setAnimating(false), 300);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open]);

  if (!open && !animating) return null;

  const handleToggle = (id: string) => {
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  return (
    <div
      className={`flex h-full w-[320px] shrink-0 flex-col gap-6 bg-white/50 p-6 transition-all duration-300 ease-in-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="flex-1 text-xs text-slate-900">
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
