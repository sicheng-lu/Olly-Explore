import { useState, useRef, useEffect } from 'react';
import { Send, BarChart3, GitBranch, Code, FileText } from 'lucide-react';
import { ThinkingRobot } from './ThinkingRobot';
import { MOCK_DIALOGS, type DialogMessage, type ArtifactData } from '../../data/agent-mock-dialogs';

interface AgentChatPanelProps {
  messages: DialogMessage[];
  isThinking: boolean;
  hasActiveDialog: boolean;
  onPromptClick: (dialogId: string) => void;
  onSendMessage: (text: string) => void;
  onArtifactClick: (artifact: ArtifactData) => void;
}

function getArtifactIcon(type: ArtifactData['type']) {
  switch (type) {
    case 'chart':
      return <BarChart3 className="w-4 h-4" />;
    case 'diagram':
      return <GitBranch className="w-4 h-4" />;
    case 'code':
      return <Code className="w-4 h-4" />;
    case 'markdown':
      return <FileText className="w-4 h-4" />;
  }
}

export function AgentChatPanel({
  messages,
  isThinking,
  hasActiveDialog,
  onPromptClick,
  onSendMessage,
  onArtifactClick,
}: AgentChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or thinking state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Message list */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-none"
      >
        {/* Suggested prompt chips — hidden when dialog is active */}
        {!hasActiveDialog && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <ThinkingRobot size={64} />
            <p className="text-slate-400 text-sm">How can I help you today?</p>
            <div className="flex flex-col gap-3 w-full max-w-md">
              {MOCK_DIALOGS.map((dialog) => (
                <button
                  key={dialog.id}
                  onClick={() => onPromptClick(dialog.id)}
                  className="text-left px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 hover:border-indigo-500/50 transition-colors cursor-pointer"
                >
                  <span className="block text-sm font-medium text-slate-100">
                    {dialog.promptLabel}
                  </span>
                  <span className="block text-xs text-slate-400 mt-1">
                    {dialog.promptDescription}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {hasActiveDialog &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600/20 text-slate-100'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {/* Artifact card */}
                {msg.artifact && (
                  <button
                    onClick={() => onArtifactClick(msg.artifact!)}
                    className="mt-3 flex items-center gap-3 w-full px-3 py-2.5 rounded-md border border-slate-600 bg-slate-700/50 hover:bg-slate-600/60 hover:border-indigo-400/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 group-hover:text-indigo-300">
                      {getArtifactIcon(msg.artifact.type)}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block text-xs font-medium text-slate-200 group-hover:text-slate-100">
                        {msg.artifact.title}
                      </span>
                    </div>
                    <span className="text-xs text-indigo-400 group-hover:text-indigo-300 font-medium">
                      View
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Thinking robot */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800">
              <ThinkingRobot size={32} />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700 px-4 py-3">
        <div className="flex items-end gap-2 max-w-full">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
