import { useEffect, useState, useCallback } from 'react';
import { AlertService } from '@/services/alert-service';
import { useOllyState } from '@/contexts/OllyStateContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { Alert } from '@/types';

interface AlertInvestigation {
  /** The alert that triggered the investigation, or null if none active. */
  activeAlert: Alert | null;
  /** The workspace ID created for the investigation, or null. */
  investigationWorkspaceId: string | null;
  /** Call to end the investigation and return Olly to normal. */
  completeInvestigation: () => void;
}

export function useAlertInvestigation(): AlertInvestigation {
  const { transitionTo, completeInvestigation: ollyComplete } = useOllyState();
  const { createWorkspace } = useWorkspace();

  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [investigationWorkspaceId, setInvestigationWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = AlertService.onAlertTriggered((alert) => {
      // Transition Olly to investigating
      transitionTo('investigating');

      // Create a workspace for the investigation
      const ws = createWorkspace(`Investigation: ${alert.name}`);
      setActiveAlert(alert);
      setInvestigationWorkspaceId(ws.id);
    });

    return unsubscribe;
  }, [transitionTo, createWorkspace]);

  const handleComplete = useCallback(() => {
    ollyComplete();
    setActiveAlert(null);
    setInvestigationWorkspaceId(null);
  }, [ollyComplete]);

  return {
    activeAlert,
    investigationWorkspaceId,
    completeInvestigation: handleComplete,
  };
}
