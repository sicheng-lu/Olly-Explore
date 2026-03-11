export type OllyState = 'normal' | 'thinking' | 'investigating';

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  privacy: 'private' | 'public';
  conversations: Conversation[];
  canvasPages: CanvasPage[];
  dataSources: DataSource[];
  createdAt: Date;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'olly';
  text: string;
  pageAction?: { type: 'open' | 'navigate'; pageId: string };
  timestamp: Date;
}

export interface CanvasPage {
  id: string;
  type: string;
  title: string;
  order: number;
  content?: string;
  generationStatus?: 'idle' | 'generating' | 'complete' | 'error';
  generationError?: string;
}

export interface Alert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: Date;
  metadata: Record<string, unknown>;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  category: 'action' | 'workspace';
}

export interface FeedItem {
  id: string;
  type: 'event' | 'insight';
  title: string;
  description: string;
  timestamp: Date;
}

export interface ChatResponse {
  text: string;
  pageAction?: { type: 'open' | 'navigate'; pageId: string };
}

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  duration: number;
  status: 'ok' | 'error';
}

export interface TraceData {
  traceId: string;
  rootSpan: TraceSpan;
  spans: TraceSpan[];
  totalDuration: number;
}

export interface DashboardMetric {
  title: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  change?: string;
}

export interface DashboardMetrics {
  latency: DashboardMetric[];
  impact: DashboardMetric[];
  infrastructure: DashboardMetric[];
}

export interface LogEntry {
  time: string;
  source: string;
}

export interface InvestigationData {
  summaryContent?: string;
  dashboardMetrics?: DashboardMetrics;
  logEntries?: LogEntry[];
  traceData?: TraceData[];
  noteContent?: string;
}

export interface PageTypeConfig {
  id: string;
  label: string;
  autoGenerates: boolean;
}
