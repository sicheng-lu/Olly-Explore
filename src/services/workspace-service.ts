import type { Workspace } from '@/types';

export const WorkspaceService = {
  async createWorkspace(initialPrompt: string): Promise<Workspace> {
    const id = crypto.randomUUID();
    return {
      id,
      name: initialPrompt.slice(0, 50),
      icon: '📊',
      privacy: 'private',
      conversations: [],
      canvasPages: [],
      dataSources: [],
      createdAt: new Date(),
    };
  },

  async getWorkspace(id: string): Promise<Workspace> {
    return {
      id,
      name: 'Mock Workspace',
      icon: '📊',
      privacy: 'private',
      conversations: [],
      canvasPages: [],
      dataSources: [],
      createdAt: new Date(),
    };
  },

  async listPublicWorkspaces(): Promise<Workspace[]> {
    return [
      {
        id: 'public-1',
        name: 'Observability Workspace',
        icon: '🔍',
        privacy: 'public',
        conversations: [],
        canvasPages: [],
        dataSources: [],
        createdAt: new Date(),
      },
    ];
  },

  async shareWorkspace(_id: string): Promise<void> {
    // no-op stub
  },
};
