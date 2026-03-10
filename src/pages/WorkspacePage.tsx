import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { LeftNav } from '@/components/LeftNav';
import { WorkspaceHeader } from '@/components/WorkspaceHeader';
import { ChatPanel } from '@/components/ChatPanel';
import { Canvas } from '@/components/Canvas';
import { ViewList } from '@/components/ViewList';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useOllyState } from '@/contexts/OllyStateContext';
import { PAGE_TYPES as REGISTERED_PAGE_TYPES } from '@/components/pages/page-types';
import type { CanvasPage } from '@/types';

export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromHome = (location.state as { fromHome?: boolean })?.fromHome ?? false;
  const investigatingFromNav = (location.state as { investigating?: boolean })?.investigating ?? false;
  const { getWorkspace, shareWorkspace, addConversation, addCanvasPage, removeCanvasPage } =
    useWorkspace();
  const { state: ollyState } = useOllyState();

  const workspace = getWorkspace(workspaceId ?? '');

  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [viewListCollapsed, setViewListCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [activePageId, setActivePageId] = useState('');

  // Redirect to home if workspace not found
  useEffect(() => {
    if (!workspaceId || !workspace) {
      toast.error('Workspace not found');
      navigate('/', { replace: true });
    }
  }, [workspaceId, workspace, navigate]);

  // Create an initial conversation when workspace has none
  useEffect(() => {
    if (workspace && workspace.conversations.length === 0) {
      addConversation(workspace.id, 'New conversation');
    }
  }, [workspace, addConversation]);

  // Keep activeConversationId in sync with workspace conversations
  useEffect(() => {
    if (!workspace) return;
    if (workspace.conversations.length > 0) {
      // If no active conversation or the active one was removed, pick the latest
      const activeExists = workspace.conversations.some((c) => c.id === activeConversationId);
      if (!activeConversationId || !activeExists) {
        setActiveConversationId(workspace.conversations[workspace.conversations.length - 1].id);
      }
    }
  }, [workspace, activeConversationId]);

  // Keep activePageId in sync with canvas pages
  useEffect(() => {
    if (workspace && workspace.canvasPages.length > 0 && !activePageId) {
      setActivePageId(workspace.canvasPages[0].id);
    }
  }, [workspace, activePageId]);

  if (!workspace) return null;

  const isInvestigating = investigatingFromNav || ollyState === 'investigating';

  const handleShare = () => shareWorkspace(workspace.id);
  const handleSettings = () => {}; // placeholder
  const handleMenu = () => setViewListCollapsed((prev) => !prev);

  const handleCollapse = () => setChatCollapsed(true);
  const handleOllyIconClick = () => setChatCollapsed(false);
  const handleHomeClick = () => navigate('/', { state: { fromWorkspace: true } });
  const handleWorkspaceClick = (id: string) => navigate(`/workspace/${id}`);

  const handleNewConversation = () => {
    addConversation(workspace.id, 'New conversation');
    // activeConversationId will be updated by the sync effect once state propagates
    setActiveConversationId('');
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleOpenPage = (pageId: string) => {
    // Handle mock page requests from chat (format: "mock||type||contentKey||title")
    if (pageId.startsWith('mock||')) {
      const [, pageType, contentKey, title] = pageId.split('||');

      // Check if this mock page already exists
      const existing = workspace.canvasPages.find((p) => p.content === contentKey);
      if (existing) {
        setActivePageId(existing.id);
        return;
      }

      const newPage: CanvasPage = {
        id: crypto.randomUUID(),
        type: pageType,
        title,
        order: workspace.canvasPages.length,
        content: contentKey,
      };
      addCanvasPage(workspace.id, newPage);
      setActivePageId(newPage.id);
      return;
    }

    const newPage: CanvasPage = {
      id: pageId,
      type: 'discover',
      title: `Page ${pageId.slice(0, 6)}`,
      order: workspace.canvasPages.length,
    };
    addCanvasPage(workspace.id, newPage);
    setActivePageId(pageId);
  };

  const handleNavigateToPage = (pageId: string) => {
    setActivePageId(pageId);
  };

  const handlePageSelect = (pageId: string) => {
    setActivePageId(pageId);
  };

  const handlePageClose = (pageId: string) => {
    removeCanvasPage(workspace.id, pageId);
    // If closing the active page, switch to the first remaining page
    if (pageId === activePageId) {
      const remaining = workspace.canvasPages.filter((p) => p.id !== pageId);
      setActivePageId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  const handleAddPage = (pageType: string) => {
    const id = crypto.randomUUID();
    const isRegisteredType = pageType in REGISTERED_PAGE_TYPES;
    const newPage: CanvasPage = {
      id,
      type: pageType,
      title: pageType.charAt(0).toUpperCase() + pageType.slice(1),
      order: workspace.canvasPages.length,
      ...(isRegisteredType ? { generationStatus: 'idle' as const } : {}),
    };
    addCanvasPage(workspace.id, newPage);
    setActivePageId(id);
  };

  const handleAddMockPage = (page: CanvasPage) => {
    const existing = workspace.canvasPages.find((p) => p.id === page.id);
    if (!existing) {
      addCanvasPage(workspace.id, page);
    }
    setActivePageId(page.id);
  };

  return (
    <div
      className={`flex h-screen ${isInvestigating ? 'animate-gradient-bg-investigating' : 'animate-gradient-bg'}`}
      data-testid="workspace-page"
    >
      {/* Frosted overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: 'linear-gradient(161deg, rgba(255,255,255,0.3) 5%, rgba(204,230,255,0.3) 27%, rgba(255,255,255,0.3) 52%, rgba(229,229,229,0.3) 83%)',
        }}
      />

      {/* Collapsed LeftNav */}
      <LeftNav
        mode="collapsed"
        onWorkspaceClick={handleWorkspaceClick}
        onHomeClick={handleHomeClick}
        onOllyIconClick={handleOllyIconClick}
        isInvestigating={isInvestigating}
        animate={fromHome}
      />

      {/* Right panel */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <WorkspaceHeader
          workspace={workspace}
          onShare={handleShare}
          onSettings={handleSettings}
          onMenu={handleMenu}
        />

        {/* Content: ChatPanel + Canvas + ViewList */}
        <div className="flex flex-1 gap-3 overflow-hidden px-3">
          <ChatPanel
            workspaceId={workspace.id}
            conversations={workspace.conversations}
            activeConversationId={activeConversationId}
            isCollapsed={chatCollapsed}
            animate={fromHome}
            onCollapse={handleCollapse}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            onOpenPage={handleOpenPage}
            onNavigateToPage={handleNavigateToPage}
          />

          <Canvas
            pages={workspace.canvasPages}
            activePageId={activePageId}
            onPageSelect={handlePageSelect}
            onAddMockPage={handleAddMockPage}
          />

          <ViewList
            pages={workspace.canvasPages}
            activePageId={activePageId}
            onPageClick={handlePageSelect}
            onPageClose={handlePageClose}
            onAddPage={handleAddPage}
            isCollapsed={viewListCollapsed}
          />
        </div>
      </div>
    </div>
  );
}
