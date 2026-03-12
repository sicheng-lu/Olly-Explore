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
import { useTimeline, TIMELINE_ICONS } from '@/contexts/TimelineContext';
import { PAGE_TYPES as REGISTERED_PAGE_TYPES } from '@/components/pages/page-types';
import type { CanvasPage } from '@/types';

export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromHome = (location.state as { fromHome?: boolean })?.fromHome ?? false;
  const investigatingFromNav = (location.state as { investigating?: boolean })?.investigating ?? false;
  const { getWorkspace, shareWorkspace, addConversation, removeConversation, addCanvasPage, removeCanvasPage } =
    useWorkspace();
  const { state: ollyState } = useOllyState();
  const { addEvent } = useTimeline();

  const workspace = getWorkspace(workspaceId ?? '');

  const [viewListCollapsed, setViewListCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [activePageId, setActivePageId] = useState('');
  const [ollyThinking, setOllyThinking] = useState(false);
  const [ollyThinkingPhase, setOllyThinkingPhase] = useState<'gathering' | 'thinking'>('gathering');
  const [logoOverride, setLogoOverride] = useState<string | undefined>(undefined);
  const [pendingMessage, setPendingMessage] = useState<import('@/types').ChatMessage | null>(null);
  const [hypothesisRuledOut, setHypothesisRuledOut] = useState(false);

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

  const handleOllyIconClick = () => {};
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

  const handleCloseConversation = (conversationId: string) => {
    removeConversation(workspace.id, conversationId);
    if (conversationId === activeConversationId) {
      const remaining = workspace.conversations.filter((c) => c.id !== conversationId);
      setActiveConversationId(remaining.length > 0 ? remaining[remaining.length - 1].id : '');
    }
  };

  const handleOpenPage = (pageId: string) => {
    // Handle rule-out requests from chat (format: "ruleout||hypothesisName")
    if (pageId.startsWith('ruleout||')) {
      const hypothesisName = pageId.split('||')[1];
      const page = workspace.canvasPages.find(
        (p) => p.type === 'hypothesis' && p.title.toLowerCase().includes(hypothesisName.toLowerCase())
      );
      if (page) {
        // Remove the hypothesis page
        removeCanvasPage(workspace.id, page.id);
        addEvent({ ...TIMELINE_ICONS.hypothesisRuledOut, text: `${page.title.replace(/^Hypothesis:\s*/i, '')} hypothesis ruled out`, pageRef: { pageId: page.id, pageTitle: page.title, pageType: page.type, removed: true } });
        if (page.id === activePageId) {
          const remaining = workspace.canvasPages.filter((p) => p.id !== page.id);
          setActivePageId(remaining.length > 0 ? remaining[0].id : '');
        }

        // Start the thinking flow
        const isDbPool = hypothesisName.toLowerCase().includes('connection pool') || hypothesisName.toLowerCase().includes('db pool');
        const remainingHypothesis = workspace.canvasPages.find(
          (p) => p.type === 'hypothesis' && p.id !== page.id
        );
        setHypothesisRuledOut(true);
        setLogoOverride('./image/Logo-v3.svg');
        setOllyThinking(true);
        setOllyThinkingPhase('gathering');

        setTimeout(() => {
          setOllyThinkingPhase('thinking');
        }, 4000);

        setTimeout(() => {
          setOllyThinking(false);
          setLogoOverride('./image/Logo-v2.svg');

          const responseText = isDbPool
            ? `I've ruled out "${hypothesisName}." While connection pool utilization is elevated at 97%, the trace analysis shows the pool wait times are a downstream effect of lock contention — not the primary cause.\n\nThis narrows our focus to the Lock Contention hypothesis. The SERIALIZABLE isolation level change in v3.8.2 is the more likely root cause. I recommend investigating trace lock-trace-445-contention-01 for confirmation.`
            : `I've ruled out "${hypothesisName}." The lock wait patterns in the traces don't fully account for the latency spike — the contention resolves within acceptable thresholds under normal concurrency.\n\nThis points us toward the DB Connection Pool Exhaustion hypothesis as the primary cause. The 3x connection multiplier from the new ORM pattern in v3.8.2 is the stronger signal. I recommend reviewing the pool saturation traces for confirmation.`;

          setPendingMessage({
              id: crypto.randomUUID(),
              sender: 'olly',
              text: responseText,
              timestamp: new Date(),
          });
          addEvent({ ...TIMELINE_ICONS.ollyAction, text: 'Olly re-evaluated remaining hypotheses' });
          addEvent({ ...TIMELINE_ICONS.ollyUpdate, text: 'Remaining hypothesis confidence updated', ...(remainingHypothesis ? { pageRef: { pageId: remainingHypothesis.id, pageTitle: remainingHypothesis.title, pageType: remainingHypothesis.type } } : {}) });
        }, 8000);
      }
      return;
    }

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
        order: Math.max(0, ...workspace.canvasPages.map((p) => p.order)) + 1,
        content: contentKey,
        addedBy: 'olly',
        addedAt: new Date(),
      };
      addCanvasPage(workspace.id, newPage);
      addEvent({ ...TIMELINE_ICONS.pageCreated, text: `${title} page created`, pageRef: { pageId: newPage.id, pageTitle: newPage.title, pageType: newPage.type } });
      setActivePageId(newPage.id);
      return;
    }

    const newPage: CanvasPage = {
      id: pageId,
      type: 'discover',
      title: `Page ${pageId.slice(0, 6)}`,
      order: Math.max(0, ...workspace.canvasPages.map((p) => p.order)) + 1,
      addedBy: 'olly',
      addedAt: new Date(),
    };
    addCanvasPage(workspace.id, newPage);
    setActivePageId(pageId);
  };

  const handleNavigateToPage = (pageId: string) => {
    setActivePageId(pageId);
  };

  const [navTick, setNavTick] = useState(0);
  const handlePageSelect = (pageId: string) => {
    setActivePageId(pageId);
    setNavTick((t) => t + 1);
  };

  const handlePageClose = (pageId: string) => {
    const page = workspace.canvasPages.find((p) => p.id === pageId);

    // Summary pages are permanent landing pages and cannot be removed
    if (page?.type === 'summary') return;

    const isHypothesis = page?.type === 'hypothesis';

    removeCanvasPage(workspace.id, pageId);

    if (!isHypothesis && page) {
      addEvent({ ...TIMELINE_ICONS.userAction, text: `${page.title} page removed`, pageRef: { pageId: page.id, pageTitle: page.title, pageType: page.type, removed: true } });
    }

    // If closing the active page, switch to the first remaining page
    if (pageId === activePageId) {
      const remaining = workspace.canvasPages.filter((p) => p.id !== pageId);
      setActivePageId(remaining.length > 0 ? remaining[0].id : '');
    }

    if (isHypothesis && page) {
      // Switch logo to thinking state
      addEvent({ ...TIMELINE_ICONS.hypothesisRuledOut, text: `${page.title.replace(/^Hypothesis:\s*/i, '')} hypothesis ruled out`, pageRef: { pageId: page.id, pageTitle: page.title, pageType: page.type, removed: true } });
      setHypothesisRuledOut(true);
      setLogoOverride('./image/Logo-v3.svg');
      setOllyThinking(true);
      setOllyThinkingPhase('gathering');

      const hypothesisName = page.title.replace(/^Hypothesis:\s*/i, '').trim();
      const isDbPool = hypothesisName.toLowerCase().includes('connection pool') || hypothesisName.toLowerCase().includes('db pool');
      const remainingHyp = workspace.canvasPages.find(
        (p) => p.type === 'hypothesis' && p.id !== page.id
      );

      // Switch to "Thinking..." phase after 4s
      setTimeout(() => {
        setOllyThinkingPhase('thinking');
      }, 4000);

      setTimeout(() => {
        setOllyThinking(false);
        setLogoOverride('./image/Logo-v2.svg');

        const responseText = isDbPool
          ? `I've ruled out "${hypothesisName}." While connection pool utilization is elevated at 97%, the trace analysis shows the pool wait times are a downstream effect of lock contention — not the primary cause.\n\nThis narrows our focus to the Lock Contention hypothesis. The SERIALIZABLE isolation level change in v3.8.2 is the more likely root cause. I recommend investigating trace lock-trace-445-contention-01 for confirmation.`
          : `I've ruled out "${hypothesisName}." The lock wait patterns in the traces don't fully account for the latency spike — the contention resolves within acceptable thresholds under normal concurrency.\n\nThis points us toward the DB Connection Pool Exhaustion hypothesis as the primary cause. The 3x connection multiplier from the new ORM pattern in v3.8.2 is the stronger signal. I recommend reviewing the pool saturation traces for confirmation.`;

        setPendingMessage({
            id: crypto.randomUUID(),
            sender: 'olly',
            text: responseText,
            timestamp: new Date(),
        });
        addEvent({ ...TIMELINE_ICONS.ollyAction, text: 'Olly re-evaluated remaining hypotheses' });
        addEvent({ ...TIMELINE_ICONS.ollyUpdate, text: 'Remaining hypothesis confidence updated', ...(remainingHyp ? { pageRef: { pageId: remainingHyp.id, pageTitle: remainingHyp.title, pageType: remainingHyp.type } } : {}) });
      }, 8000);
    }
  };

  const handleAddPage = (pageType: string) => {
    const id = crypto.randomUUID();
    const isRegisteredType = pageType in REGISTERED_PAGE_TYPES;
    const newPage: CanvasPage = {
      id,
      type: pageType,
      title: pageType.charAt(0).toUpperCase() + pageType.slice(1),
      order: Math.max(0, ...workspace.canvasPages.map((p) => p.order)) + 1,
      addedBy: 'user',
      addedAt: new Date(),
      ...(isRegisteredType ? { generationStatus: 'idle' as const } : {}),
    };
    addCanvasPage(workspace.id, newPage);
    addEvent({ ...TIMELINE_ICONS.userAction, text: `User added ${newPage.title} page`, pageRef: { pageId: newPage.id, pageTitle: newPage.title, pageType: newPage.type } });
    setActivePageId(id);
  };

  const handleAddMockPage = (page: CanvasPage) => {
    const existing = workspace.canvasPages.find((p) => p.id === page.id);
    if (!existing) {
      addCanvasPage(workspace.id, page);
      addEvent({ ...TIMELINE_ICONS.pageCreated, text: `${page.title} page created`, pageRef: { pageId: page.id, pageTitle: page.title, pageType: page.type } });
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
        logoOverride={logoOverride}
        animate={fromHome}
      />

      {/* Right panel */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <WorkspaceHeader
          workspace={workspace}
          viewListCollapsed={viewListCollapsed}
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
            animate={fromHome}
            pendingMessage={pendingMessage}
            onPendingMessageConsumed={() => setPendingMessage(null)}
            ollyThinking={ollyThinking}
            ollyThinkingPhase={ollyThinkingPhase}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            onCloseConversation={handleCloseConversation}
            onOpenPage={handleOpenPage}
            onNavigateToPage={handleNavigateToPage}
          />

          <Canvas
            pages={workspace.canvasPages}
            activePageId={activePageId}
            onPageSelect={handlePageSelect}
            onAddMockPage={handleAddMockPage}
            onRemovePage={handlePageClose}
            hypothesisRuledOut={hypothesisRuledOut}
            navTick={navTick}
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
