import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FilePlus2,
  RefreshCw,
  XCircle,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export interface TimelinePageRef {
  pageId: string;
  pageTitle: string;
  pageType: string;
  removed?: boolean;
}

export interface TimelineEvent {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  text: string;
  time: string;
  pageRef?: TimelinePageRef;
}

interface TimelineContextType {
  events: TimelineEvent[];
  addEvent: (event: Omit<TimelineEvent, 'id' | 'time'>) => void;
  seedEvents: (events: TimelineEvent[]) => void;
}

const TimelineContext = createContext<TimelineContextType | null>(null);

function nowUTC(): string {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';
}

export const TIMELINE_ICONS = {
  pageCreated: { icon: FilePlus2, iconColor: 'text-blue-500' },
  hypothesisCreated: { icon: FilePlus2, iconColor: 'text-amber-500' },
  ollyUpdate: { icon: RefreshCw, iconColor: 'text-emerald-500' },
  hypothesisRuledOut: { icon: XCircle, iconColor: 'text-red-500' },
  ollyAction: { icon: Sparkles, iconColor: 'text-purple-500' },
  userAction: { icon: MessageSquare, iconColor: 'text-slate-500' },
} as const;

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const addEvent = useCallback((event: Omit<TimelineEvent, 'id' | 'time'>) => {
    setEvents((prev) => [
      ...prev,
      { ...event, id: crypto.randomUUID(), time: nowUTC() },
    ]);
  }, []);

  const seedEvents = useCallback((initial: TimelineEvent[]) => {
    setEvents(initial);
  }, []);

  return (
    <TimelineContext.Provider value={{ events, addEvent, seedEvents }}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline(): TimelineContextType {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
}
