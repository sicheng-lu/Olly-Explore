import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AgentChatPanel } from '../components/agent/AgentChatPanel';
import { ArtifactPanel } from '../components/agent/ArtifactPanel';
import { ResizableSplitLayout } from '../components/agent/ResizableSplitLayout';
import {
  MOCK_DIALOGS,
  type DialogMessage,
  type ArtifactData,
} from '../data/agent-mock-dialogs';

interface DialogState {
  activeDialogId: string | null;
  currentTurnIndex: number;
  isThinking: boolean;
  activeArtifact: ArtifactData | null;
  isArtifactPanelOpen: boolean;
  messages: DialogMessage[];
}

const initialState: DialogState = {
  activeDialogId: null,
  currentTurnIndex: 0,
  isThinking: false,
  activeArtifact: null,
  isArtifactPanelOpen: false,
  messages: [],
};

export function CentralAgentPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<DialogState>(initialState);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const handlePromptClick = useCallback(
    (dialogId: string) => {
      clearTimeouts();

      const dialog = MOCK_DIALOGS.find((d) => d.id === dialogId);
      if (!dialog || dialog.turns.length === 0) return;

      setState((prev) => ({
        ...prev,
        activeDialogId: dialogId,
        currentTurnIndex: 0,
        messages: [],
        isThinking: false,
      }));

      let cumulativeDelay = 0;

      dialog.turns.forEach((turn, index) => {
        if (turn.sender === 'user') {
          const tid = setTimeout(() => {
            setState((prev) => ({
              ...prev,
              currentTurnIndex: index,
              messages: [...prev.messages, turn],
            }));
          }, cumulativeDelay);
          timeoutsRef.current.push(tid);
          cumulativeDelay += 300;
        } else {
          // Agent turn: show thinking first, then reveal message
          const thinkDelay = cumulativeDelay;
          const thinkDuration = turn.delayMs ?? 1500;

          const thinkTid = setTimeout(() => {
            setState((prev) => ({
              ...prev,
              isThinking: true,
            }));
          }, thinkDelay);
          timeoutsRef.current.push(thinkTid);

          const msgTid = setTimeout(() => {
            setState((prev) => ({
              ...prev,
              currentTurnIndex: index,
              isThinking: false,
              messages: [...prev.messages, turn],
              activeArtifact: turn.artifact ?? prev.activeArtifact,
            }));
          }, thinkDelay + thinkDuration);
          timeoutsRef.current.push(msgTid);

          cumulativeDelay += thinkDuration + 300;
        }
      });
    },
    [clearTimeouts]
  );

  const handleSendMessage = useCallback((_text: string) => {
    // No-op for mock — input is cosmetic
  }, []);

  const handleArtifactClick = useCallback((artifact: ArtifactData) => {
    setState((prev) => ({
      ...prev,
      activeArtifact: artifact,
      isArtifactPanelOpen: true,
    }));
  }, []);

  const handleCloseArtifact = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isArtifactPanelOpen: false,
    }));
  }, []);

  const chatPanel = (
    <AgentChatPanel
      messages={state.messages}
      isThinking={state.isThinking}
      hasActiveDialog={state.activeDialogId !== null}
      onPromptClick={handlePromptClick}
      onSendMessage={handleSendMessage}
      onArtifactClick={handleArtifactClick}
    />
  );

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
      {/* Top bar with home navigation */}
      <div className="flex items-center px-4 py-2 border-b border-slate-700 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Home</span>
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-h-0 relative">
        {state.isArtifactPanelOpen ? (
          <div
            className="h-full w-full"
            style={{ transition: 'all 300ms ease' }}
          >
            <ResizableSplitLayout
              left={chatPanel}
              right={
                <ArtifactPanel
                  artifact={state.activeArtifact}
                  onClose={handleCloseArtifact}
                />
              }
              defaultLeftWidth={45}
              minLeftWidth={280}
              minRightWidth={320}
            />
          </div>
        ) : (
          <div
            className="h-full"
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              transition: 'all 300ms ease',
            }}
          >
            {chatPanel}
          </div>
        )}
      </div>
    </div>
  );
}
