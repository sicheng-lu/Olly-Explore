import { useState, useCallback, useRef } from 'react';
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
  /** Index of the next turn to process in the dialog */
  nextTurnIndex: number;
  isThinking: boolean;
  isStreaming: boolean;
  streamingText: string;
  streamingMsgId: string | null;
  activeArtifact: ArtifactData | null;
  isArtifactPanelOpen: boolean;
  messages: DialogMessage[];
  /** Recommended next prompt shown after agent finishes streaming */
  pendingNextPrompt: string | null;
  /** Agent-framed suggestion text */
  pendingNextPromptSuggestion: string | null;
}

const initialState: DialogState = {
  activeDialogId: null,
  nextTurnIndex: 0,
  isThinking: false,
  isStreaming: false,
  streamingText: '',
  streamingMsgId: null,
  activeArtifact: null,
  isArtifactPanelOpen: false,
  messages: [],
  pendingNextPrompt: null,
  pendingNextPromptSuggestion: null,
};

export function CentralAgentPage() {
  const [state, setState] = useState<DialogState>(initialState);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  }, []);

  /** Stream agent text character-by-character, then finalize */
  const streamAgentMessage = useCallback(
    (turn: DialogMessage, _dialog: typeof MOCK_DIALOGS[number], turnIndex: number) => {
      const fullText = turn.text;
      let charIndex = 0;
      const charsPerTick = 2;
      const tickMs = 20;

      setState((prev) => ({
        ...prev,
        isThinking: false,
        isStreaming: true,
        streamingText: '',
        streamingMsgId: turn.id,
      }));

      streamIntervalRef.current = setInterval(() => {
        charIndex += charsPerTick;
        if (charIndex >= fullText.length) {
          // Done streaming — finalize
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            streamingText: '',
            streamingMsgId: null,
            messages: [...prev.messages, turn],
            activeArtifact: turn.artifact ?? prev.activeArtifact,
            nextTurnIndex: turnIndex + 1,
            pendingNextPrompt: turn.nextPrompt ?? null,
            pendingNextPromptSuggestion: turn.nextPromptSuggestion ?? null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            streamingText: fullText.slice(0, charIndex),
          }));
        }
      }, tickMs);
    },
    []
  );

  /** Advance the dialog by processing the next pair of turns (user + agent) */
  const advanceDialog = useCallback(
    (dialogId: string, fromTurnIndex: number) => {
      const dialog = MOCK_DIALOGS.find((d) => d.id === dialogId);
      if (!dialog) return;

      const turns = dialog.turns;
      let idx = fromTurnIndex;

      // If the next turn is a user turn, add it immediately
      if (idx < turns.length && turns[idx].sender === 'user') {
        const userTurn = turns[idx];
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, userTurn],
          pendingNextPrompt: null,
          pendingNextPromptSuggestion: null,
        }));
        idx++;
      }

      // If the next turn is an agent turn, show thinking then stream
      if (idx < turns.length && turns[idx].sender === 'agent') {
        const agentTurn = turns[idx];
        const thinkDuration = agentTurn.delayMs ?? 1500;

        setState((prev) => ({ ...prev, isThinking: true }));

        const tid = setTimeout(() => {
          streamAgentMessage(agentTurn, dialog, idx);
        }, thinkDuration);
        timeoutsRef.current.push(tid);
      }
    },
    [streamAgentMessage]
  );

  const handlePromptClick = useCallback(
    (dialogId: string) => {
      clearAllTimers();

      const dialog = MOCK_DIALOGS.find((d) => d.id === dialogId);
      if (!dialog || dialog.turns.length === 0) return;

      setState({
        ...initialState,
        activeDialogId: dialogId,
      });

      // Kick off from turn 0 after a brief tick so state settles
      setTimeout(() => advanceDialog(dialogId, 0), 50);
    },
    [clearAllTimers, advanceDialog]
  );

  /** Called when user clicks the recommended next prompt chip */
  const handleNextPromptClick = useCallback(() => {
    if (!state.activeDialogId) return;
    advanceDialog(state.activeDialogId, state.nextTurnIndex);
  }, [state.activeDialogId, state.nextTurnIndex, advanceDialog]);

  /** Called when user cancels the suggested next prompt */
  const handleNextPromptCancel = useCallback(() => {
    setState((prev) => ({ ...prev, pendingNextPrompt: null, pendingNextPromptSuggestion: null }));
  }, []);

  const handleSendMessage = useCallback((_text: string) => {
    // No-op for mock
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

  const handleReset = useCallback(() => {
    clearAllTimers();
    setState(initialState);
  }, [clearAllTimers]);

  const activeDialog = state.activeDialogId
    ? MOCK_DIALOGS.find((d) => d.id === state.activeDialogId)
    : null;

  const chatPanel = (
    <AgentChatPanel
      messages={state.messages}
      isThinking={state.isThinking}
      isStreaming={state.isStreaming}
      streamingText={state.streamingText}
      hasActiveDialog={state.activeDialogId !== null}
      conversationName={activeDialog?.promptLabel}
      pendingNextPrompt={state.pendingNextPrompt}
      pendingNextPromptSuggestion={state.pendingNextPromptSuggestion}
      onPromptClick={handlePromptClick}
      onSendMessage={handleSendMessage}
      onArtifactClick={handleArtifactClick}
      onNextPromptClick={handleNextPromptClick}
      onNextPromptCancel={handleNextPromptCancel}
      onReset={handleReset}
    />
  );

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        {state.isArtifactPanelOpen ? (
          <div className="h-full w-full" style={{ transition: 'all 300ms ease' }}>
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
            style={{ maxWidth: '720px', margin: '0 auto', transition: 'all 300ms ease' }}
          >
            {chatPanel}
          </div>
        )}
      </div>
    </div>
  );
}
