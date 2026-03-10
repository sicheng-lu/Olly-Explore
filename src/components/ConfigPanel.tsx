import { Settings, Bell, Target, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConfigPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigPanel({ open, onOpenChange }: ConfigPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] bg-oui-empty-shade">
        <SheetHeader className="border-b border-oui-light-shade pb-4">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-oui-primary" />
            <SheetTitle className="text-oui-darkest-shade">
              Set up Alert &amp; Skills for Olly
            </SheetTitle>
          </div>
          <SheetDescription className="text-oui-medium-shade">
            Configure alert rules and Olly's investigation goals.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-6 py-4">
            {/* Alert Configuration Section */}
            <section data-testid="alert-config-section">
              <div className="mb-3 flex items-center gap-2">
                <Bell className="size-4 text-oui-warning" />
                <h3 className="text-sm font-semibold text-oui-darkest-shade">
                  Alert Configuration
                </h3>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border border-oui-light-shade bg-white p-4">
                {/* Alert Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="alert-name"
                    className="text-xs font-medium text-oui-dark-shade"
                  >
                    Alert Name
                  </label>
                  <input
                    id="alert-name"
                    type="text"
                    placeholder="e.g. High CPU Usage"
                    className="rounded-md border border-oui-light-shade bg-oui-empty-shade px-3 py-2 text-sm text-oui-darkest-shade placeholder:text-oui-medium-shade focus:border-oui-primary focus:outline-none"
                    data-testid="alert-name-input"
                  />
                </div>

                {/* Severity Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="alert-severity"
                    className="text-xs font-medium text-oui-dark-shade"
                  >
                    Severity
                  </label>
                  <div className="relative">
                    <select
                      id="alert-severity"
                      className="w-full appearance-none rounded-md border border-oui-light-shade bg-oui-empty-shade px-3 py-2 pr-8 text-sm text-oui-darkest-shade focus:border-oui-primary focus:outline-none"
                      defaultValue="medium"
                      data-testid="alert-severity-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-oui-medium-shade" />
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="alert-enabled"
                    className="text-xs font-medium text-oui-dark-shade"
                  >
                    Enable Alert
                  </label>
                  <button
                    id="alert-enabled"
                    type="button"
                    role="switch"
                    aria-checked="true"
                    className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-oui-primary transition-colors focus:outline-none focus:ring-2 focus:ring-oui-primary focus:ring-offset-2"
                    data-testid="alert-enabled-toggle"
                  >
                    <span className="pointer-events-none inline-block size-4 translate-x-4 rounded-full bg-white shadow-sm transition-transform" />
                  </button>
                </div>
              </div>
            </section>

            {/* Olly Goals / Skills Section */}
            <section data-testid="olly-goals-section">
              <div className="mb-3 flex items-center gap-2">
                <Target className="size-4 text-oui-primary" />
                <h3 className="text-sm font-semibold text-oui-darkest-shade">
                  Olly Goals &amp; Skills
                </h3>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border border-oui-light-shade bg-white p-4">
                {/* Goal Text Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="olly-goal"
                    className="text-xs font-medium text-oui-dark-shade"
                  >
                    Investigation Goal
                  </label>
                  <textarea
                    id="olly-goal"
                    rows={3}
                    placeholder="e.g. Monitor API latency and auto-investigate spikes above 500ms"
                    className="resize-none rounded-md border border-oui-light-shade bg-oui-empty-shade px-3 py-2 text-sm text-oui-darkest-shade placeholder:text-oui-medium-shade focus:border-oui-primary focus:outline-none"
                    data-testid="olly-goal-input"
                  />
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="olly-priority"
                    className="text-xs font-medium text-oui-dark-shade"
                  >
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      id="olly-priority"
                      className="w-full appearance-none rounded-md border border-oui-light-shade bg-oui-empty-shade px-3 py-2 pr-8 text-sm text-oui-darkest-shade focus:border-oui-primary focus:outline-none"
                      defaultValue="medium"
                      data-testid="olly-priority-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-oui-medium-shade" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer with Save button */}
        <div className="border-t border-oui-light-shade p-4">
          <Button className="w-full" data-testid="config-save-button">
            Save Configuration
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
