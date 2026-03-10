import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { OllyState } from '@/types';

export interface OllyStateContextType {
  state: OllyState;
  transitionTo: (newState: OllyState) => void;
  canTransition: (newState: OllyState) => boolean;
  completeInvestigation: () => void;
}

const STATE_PRIORITY: Record<OllyState, number> = {
  normal: 1,
  thinking: 2,
  investigating: 3,
};

const OllyStateContext = createContext<OllyStateContextType | null>(null);

export function OllyStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OllyState>('normal');

  const canTransition = useCallback(
    (newState: OllyState): boolean => {
      return STATE_PRIORITY[newState] >= STATE_PRIORITY[state];
    },
    [state]
  );

  const transitionTo = useCallback(
    (newState: OllyState): void => {
      if (canTransition(newState)) {
        setState(newState);
      }
    },
    [canTransition]
  );

  const completeInvestigation = useCallback((): void => {
    setState('normal');
  }, []);

  return (
    <OllyStateContext.Provider value={{ state, transitionTo, canTransition, completeInvestigation }}>
      {children}
    </OllyStateContext.Provider>
  );
}

export function useOllyState(): OllyStateContextType {
  const context = useContext(OllyStateContext);
  if (!context) {
    throw new Error('useOllyState must be used within an OllyStateProvider');
  }
  return context;
}
