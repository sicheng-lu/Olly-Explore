import type { Alert, Workspace } from '@/types';

type AlertCallback = (alert: Alert) => void;

const listeners: AlertCallback[] = [];

export const AlertService = {
  onAlertTriggered(callback: AlertCallback): () => void {
    listeners.push(callback);
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },

  async startInvestigation(alert: Alert): Promise<Workspace> {
    return {
      id: crypto.randomUUID(),
      name: `Investigation: ${alert.name}`,
      icon: '🚨',
      privacy: 'private',
      conversations: [],
      canvasPages: [],
      dataSources: [{ id: crypto.randomUUID(), name: 'Investigation', type: 'investigation' }],
      createdAt: new Date(),
    };
  },

  /** Demo helper — fires a mock alert after a short delay. */
  simulateAlert(delayMs = 3000): void {
    setTimeout(() => {
      const alert: Alert = {
        id: crypto.randomUUID(),
        name: 'High CPU usage on node-03',
        severity: 'critical',
        triggeredAt: new Date(),
        metadata: { node: 'node-03', cpu: 98.2 },
      };
      listeners.forEach((cb) => cb(alert));
    }, delayMs);
  },
};
