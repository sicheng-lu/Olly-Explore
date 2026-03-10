import { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenLine,
  History,
  PanelLeftClose,
  Plus,
  ArrowUp,
  AlertCircle,
  RotateCcw,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OllyIcon } from '@/components/OllyIcon';
import { OllyService } from '@/services/olly-service';
import type { Conversation, ChatMessage } from '@/types';

/* ── Typewriter effect for Olly messages ── */

function TypewriterText({
  text,
  speed = 8,
  onComplete,
  onTick,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onTick?: () => void;
}) {
  const [charIndex, setCharIndex] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (charIndex >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    const timer = setTimeout(() => {
      // Advance by a chunk for speed — 3 chars at a time feels fast but readable
      setCharIndex((prev) => Math.min(prev + 3, text.length));
      onTick?.();
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, text, speed, onComplete, onTick]);

  return <>{text.slice(0, charIndex)}{charIndex < text.length && <span className="inline-block w-px h-3 bg-slate-400 animate-pulse ml-0.5 align-middle" />}</>;
}

/* ── Olly message with typewriter + action icons ── */

function OllyMessage({
  msg,
  isTyped,
  onTypeComplete,
  onTick,
}: {
  msg: ChatMessage;
  isTyped: boolean;
  onTypeComplete: () => void;
  onTick: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-900 whitespace-pre-wrap leading-relaxed">
        {isTyped ? (
          msg.text
        ) : (
          <TypewriterText text={msg.text} speed={8} onComplete={onTypeComplete} onTick={onTick} />
        )}
      </p>
      {isTyped && (
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-white/50 rounded" aria-label="Copy">
            <Copy className="size-4 text-slate-400" />
          </button>
          <button className="p-1 hover:bg-white/50 rounded" aria-label="Regenerate">
            <RefreshCw className="size-4 text-slate-400" />
          </button>
          <button className="p-1 hover:bg-white/50 rounded" aria-label="Thumbs up">
            <ThumbsUp className="size-4 text-slate-400" />
          </button>
          <button className="p-1 hover:bg-white/50 rounded" aria-label="Thumbs down">
            <ThumbsDown className="size-4 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
}

interface ChatPanelProps {
  workspaceId: string;
  conversations: Conversation[];
  activeConversationId: string;
  isCollapsed: boolean;
  animate?: boolean;
  onCollapse: () => void;
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  onOpenPage: (pageId: string) => void;
  onNavigateToPage: (pageId: string) => void;
}

export function ChatPanel({
  conversations,
  activeConversationId,
  isCollapsed,
  animate = false,
  onCollapse,
  onNewConversation,
  onSelectConversation,
  onOpenPage,
  onNavigateToPage,
}: ChatPanelProps) {
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [failedMessageIds, setFailedMessageIds] = useState<Set<string>>(new Set());
  const [typedMessageIds, setTypedMessageIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [settled, setSettled] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const frame = requestAnimationFrame(() => setSettled(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [animate]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const messages: ChatMessage[] = [
    ...(activeConversation?.messages ?? []),
    ...(localMessages[activeConversationId] ?? []),
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendWithRetry = useCallback(
    async (conversationId: string, text: string, messageId: string, attempt = 0): Promise<boolean> => {
      const MAX_RETRIES = 3;
      try {
        const response = await OllyService.sendMessage(conversationId, text);
        const ollyMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'olly',
          text: response.text,
          pageAction: response.pageAction,
          timestamp: new Date(),
        };
        setLocalMessages((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] ?? []), ollyMessage],
        }));
        setFailedMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
        if (response.pageAction) {
          if (response.pageAction.type === 'open') onOpenPage(response.pageAction.pageId);
          else if (response.pageAction.type === 'navigate') onNavigateToPage(response.pageAction.pageId);
        }
        return true;
      } catch {
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return sendWithRetry(conversationId, text, messageId, attempt + 1);
        }
        setFailedMessageIds((prev) => new Set(prev).add(messageId));
        return false;
      }
    },
    [onOpenPage, onNavigateToPage]
  );

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isSending || !activeConversationId) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setLocalMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] ?? []), userMessage],
    }));
    setInputValue('');
    setIsSending(true);
    await sendWithRetry(activeConversationId, text, userMessage.id);
    setIsSending(false);
  }, [inputValue, isSending, activeConversationId, sendWithRetry]);

  const handleRetry = useCallback(
    async (messageId: string) => {
      const allMsgs = localMessages[activeConversationId] ?? [];
      const failedMsg = allMsgs.find((m) => m.id === messageId);
      if (!failedMsg) return;
      setIsSending(true);
      await sendWithRetry(activeConversationId, failedMsg.text, messageId);
      setIsSending(false);
    },
    [activeConversationId, localMessages, sendWithRetry]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isCollapsed) {
    return (
      <div
        className="shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
        style={{ width: 0 }}
        data-testid="chat-panel"
      />
    );
  }

  return (
    <div
      className="flex flex-col h-full shrink-0 pb-6 overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: settled ? 360 : '100%' }}
      data-testid="chat-panel"
    >
      {/* Header */}
      <div className="flex h-6 items-center gap-3 shrink-0">
        <span
          className="flex-1 truncate text-sm text-slate-500"
          data-testid="chat-panel-conversation-name"
        >
          {activeConversation?.name ?? 'New Conversation'}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onNewConversation}
            className="flex size-6 items-center justify-center rounded-lg hover:bg-white/50"
            aria-label="New conversation"
            data-testid="chat-panel-new-conversation"
          >
            <PenLine className="size-4 text-oui-dark-shade" />
          </button>
          <button
            className="flex size-6 items-center justify-center rounded-lg hover:bg-white/50"
            aria-label="History"
          >
            <History className="size-4 text-oui-dark-shade" />
          </button>
          <button
            onClick={onCollapse}
            className="flex size-6 items-center justify-center rounded-lg hover:bg-white/50"
            aria-label="Collapse chat panel"
            data-testid="chat-panel-collapse"
          >
            <PanelLeftClose className="size-4 text-oui-dark-shade" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <OllyIcon size="large" />
              <p className="mt-3 text-sm">Start a conversation with Olly</p>
            </div>
          )}
          {messages.map((msg) => {
            const isFailed = msg.sender === 'user' && failedMessageIds.has(msg.id);
            return (
              <div key={msg.id} data-testid={`chat-message-${msg.sender}`}>
                {msg.sender === 'user' ? (
                  /* User message — right-aligned pill */
                  <div className="flex flex-col items-end pl-6">
                    <div
                      className={`rounded-lg px-2 py-1 text-xs ${
                        isFailed
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-slate-200 text-slate-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {isFailed && (
                      <div className="flex items-center gap-1.5 mt-1 text-red-500" data-testid="message-failed-indicator">
                        <AlertCircle className="size-3.5" />
                        <span className="text-xs">Failed to send</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRetry(msg.id)}
                          disabled={isSending}
                          aria-label="Retry sending message"
                          data-testid="message-retry-button"
                          className="h-5 w-5 text-red-500"
                        >
                          <RotateCcw className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Olly response — left-aligned with action icons */
                  <OllyMessage
                    msg={msg}
                    isTyped={typedMessageIds.has(msg.id)}
                    onTypeComplete={() => setTypedMessageIds((prev) => new Set(prev).add(msg.id))}
                    onTick={() => {
                      if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
          {isSending && (
            <div className="flex gap-2 justify-start" data-testid="chat-message-loading">
              <div className="shrink-0 mt-1">
                <OllyIcon size="small" />
              </div>
              <div className="rounded-lg px-3 py-2 text-xs text-slate-400">
                Olly is thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area — same style as home page */}
      <div className="flex flex-col rounded-lg bg-white shrink-0">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your service"
          rows={1}
          style={{ height: 64 }}
          className="w-full resize-none border-0 bg-transparent px-3 pt-3 pb-1 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none"
          data-testid="chat-panel-input"
        />
        <div className="flex items-center justify-between px-3 pb-3 pt-1.5">
          <button
            className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:bg-slate-50"
            aria-label="Attach"
          >
            <Plus className="size-4" />
          </button>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
            aria-label="Send message"
            data-testid="chat-panel-send"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
