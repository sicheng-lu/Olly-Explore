import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Workspace, Conversation, CanvasPage, ChatMessage } from '@/types';

export interface WorkspaceContextType {
  workspaces: Workspace[];
  createWorkspace: (initialPrompt: string) => Workspace;
  shareWorkspace: (id: string) => void;
  listPublicWorkspaces: () => Workspace[];
  getWorkspace: (id: string) => Workspace | undefined;
  addConversation: (workspaceId: string, name: string, initialMessages?: ChatMessage[]) => void;
  addCanvasPage: (workspaceId: string, page: CanvasPage) => void;
  removeCanvasPage: (workspaceId: string, pageId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

function generateId(): string {
  return crypto.randomUUID();
}

const MOCK_PUBLIC_WORKSPACES: Workspace[] = [
  {
    id: generateId(),
    name: 'Cluster Pulse',
    icon: '📊',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Observability', type: 'observability' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Trace Insights',
    icon: '📊',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Observability', type: 'observability' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Sentinel Watch',
    icon: '🛡️',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Security Analytics', type: 'security' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Discovery Lab',
    icon: '🔍',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Search', type: 'search' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Log Explorer',
    icon: '📊',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Observability', type: 'observability' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Threat Hunter',
    icon: '🛡️',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Security Analytics', type: 'security' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Metric Stream',
    icon: '📊',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Observability', type: 'observability' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Query Studio',
    icon: '🔍',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Search', type: 'search' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Incident Room',
    icon: '🛡️',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Security Analytics', type: 'security' }],
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Anomaly Radar',
    icon: '📊',
    privacy: 'public' as const,
    conversations: [],
    canvasPages: [],
    dataSources: [{ id: generateId(), name: 'Observability', type: 'observability' }],
    createdAt: new Date(),
  },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_PUBLIC_WORKSPACES);

  const createWorkspace = useCallback((initialPrompt: string): Workspace => {
    const workspace: Workspace = {
      id: generateId(),
      name: initialPrompt.slice(0, 50),
      icon: '📊',
      privacy: 'private',
      conversations: [],
      canvasPages: [],
      dataSources: [],
      createdAt: new Date(),
    };
    setWorkspaces((prev) => [...prev, workspace]);
    return workspace;
  }, []);

  const shareWorkspace = useCallback((id: string): void => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, privacy: 'public' as const } : ws))
    );
  }, []);

  const listPublicWorkspaces = useCallback((): Workspace[] => {
    return workspaces.filter((ws) => ws.privacy === 'public');
  }, [workspaces]);

  const getWorkspace = useCallback(
    (id: string): Workspace | undefined => {
      return workspaces.find((ws) => ws.id === id);
    },
    [workspaces]
  );

  const addConversation = useCallback((workspaceId: string, name: string, initialMessages?: ChatMessage[]): void => {
    const conversation: Conversation = {
      id: generateId(),
      workspaceId,
      name,
      messages: initialMessages ?? [],
      createdAt: new Date(),
    };
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceId
          ? { ...ws, conversations: [...ws.conversations, conversation] }
          : ws
      )
    );
  }, []);

  const addCanvasPage = useCallback((workspaceId: string, page: CanvasPage): void => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceId
          ? { ...ws, canvasPages: [...ws.canvasPages, page] }
          : ws
      )
    );
  }, []);

  const removeCanvasPage = useCallback((workspaceId: string, pageId: string): void => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceId
          ? { ...ws, canvasPages: ws.canvasPages.filter((p) => p.id !== pageId) }
          : ws
      )
    );
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        createWorkspace,
        shareWorkspace,
        listPublicWorkspaces,
        getWorkspace,
        addConversation,
        addCanvasPage,
        removeCanvasPage,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
