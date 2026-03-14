import { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowLeft, BarChart3, GitBranch, Code, FileText } from 'lucide-react';
import { OpenSearchLogo } from './OpenSearchLogo';
import { ChartArtifact } from './ChartArtifact';
import { MOCK_DIALOGS, type DialogMessage, type ArtifactData } from '../../data/agent-mock-dialogs';

interface AgentChatPanelProps {
  messages: DialogMessage[];
  isThinking: boolean;
  isStreaming: boolean;
  streamingText: string;
  hasActiveDialog: boolean;
  conversationName?: string;
  pendingNextPrompt: string | null;
  pendingNextPromptSuggestion: string | null;
  onPromptClick: (dialogId: string) => void;
  onSendMessage: (text: string) => void;
  onArtifactClick: (artifact: ArtifactData) => void;
  onNextPromptClick: () => void;
  onNextPromptCancel: () => void;
  onReset?: () => void;
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
  isStreaming,
  streamingText,
  hasActiveDialog,
  conversationName,
  pendingNextPrompt,
  pendingNextPromptSuggestion,
  onPromptClick,
  onSendMessage,
  onArtifactClick,
  onNextPromptClick,
  onNextPromptCancel,
  onReset,
}: AgentChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [dotCount, setDotCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isStreaming, streamingText, pendingNextPrompt]);

  useEffect(() => {
    if (!isThinking) return;
    setDotCount(1);
    const id = setInterval(() => setDotCount((d) => (d % 3) + 1), 500);
    return () => clearInterval(id);
  }, [isThinking]);

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

  // Welcome state: no active dialog
  if (!hasActiveDialog) {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-slate-100">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-4 mb-8">
            <OpenSearchLogo size={40} />
            <h1 className="text-4xl font-light text-slate-100 tracking-tight" style={{ fontFamily: "'Rubik', sans-serif" }}>
              Welcome, Maya
            </h1>
          </div>

          <div className="w-full max-w-[640px]">
            <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can I help you today?"
                rows={3}
                className="flex-1 resize-none bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="flex items-center justify-center w-8 h-8 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 mb-1"
                style={{ backgroundColor: '#3b9eed' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5bb2f5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b9eed')}
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {MOCK_DIALOGS.map((dialog) => (
                <button
                  key={dialog.id}
                  onClick={() => onPromptClick(dialog.id)}
                  className="px-4 py-2 rounded-full border border-slate-700 bg-slate-800/40 hover:bg-slate-700/60 hover:border-slate-500 transition-colors cursor-pointer text-xs text-slate-300"
                >
                  {dialog.promptLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active dialog state
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Top nav bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 shrink-0">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-medium text-slate-200 truncate">
          {conversationName ?? 'Conversation'}
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-none">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-3 ${
                msg.sender === 'user'
                  ? 'max-w-[80%] bg-slate-700/50 text-slate-100'
                  : 'w-full text-slate-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

              {/* Inline chart preview for chart artifacts */}
              {msg.artifact && msg.artifact.type === 'chart' && (
                <div className="mt-3 w-full rounded-md overflow-hidden border border-slate-600 bg-slate-900">
                  <div className="flex items-center justify-between px-3 pt-2">
                    <span className="text-xs font-medium text-slate-200">{msg.artifact.title}</span>
                    <button
                      onClick={() => onArtifactClick(msg.artifact!)}
                      className="text-xs font-medium cursor-pointer hover:underline"
                      style={{ color: '#3b9eed' }}
                    >
                      View
                    </button>
                  </div>
                  <div className="h-48 p-2">
                    <ChartArtifact config={{ ...msg.artifact, title: '' }} />
                  </div>
                </div>
              )}

              {/* Clickable card for non-chart artifacts */}
              {msg.artifact && msg.artifact.type !== 'chart' && (
                <button
                  onClick={() => onArtifactClick(msg.artifact!)}
                  className="mt-3 flex items-center gap-3 max-w-[420px] px-3 py-2.5 rounded-md border border-slate-600 bg-slate-900 hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded text-[#3b9eed]" style={{ backgroundColor: 'rgba(59,158,237,0.15)' }}>
                    {getArtifactIcon(msg.artifact.type)}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-xs font-medium text-slate-200 group-hover:text-slate-100">
                      {msg.artifact.title}
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#3b9eed' }}>
                    View
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Streaming agent text */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="w-full rounded-lg px-4 py-3 text-slate-200">
              <p className="text-sm whitespace-pre-wrap">{streamingText}<span className="animate-pulse">▍</span></p>
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-xs text-slate-400">
                Thinking{'.'.repeat(dotCount)}
              </span>
            </div>
          </div>
        )}

        {/* Suggested next action */}
        {pendingNextPrompt && !isThinking && !isStreaming && (
          <div className="flex items-center gap-3 px-4 pt-2 flex-wrap">
            <p className="text-sm text-slate-300">{pendingNextPromptSuggestion ?? pendingNextPrompt}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={onNextPromptClick}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-white cursor-pointer transition-colors"
                style={{ backgroundColor: '#3b9eed' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5bb2f5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b9eed')}
              >
                Run
              </button>
              <button
                onClick={onNextPromptCancel}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-slate-400 border border-slate-600 hover:bg-slate-700/60 hover:text-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Single logo at the end of all chat content */}
        <div className="flex justify-start px-4 pt-4">
          <OpenSearchLogo size={28} />
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700 px-4 py-3">
        <div className="relative max-w-full">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can I help you today?"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3b9eed]/50 focus:ring-1 focus:ring-[#3b9eed]/30"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="absolute right-2 bottom-4 flex items-center justify-center w-8 h-8 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            style={{ backgroundColor: '#3b9eed' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5bb2f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b9eed')}
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
