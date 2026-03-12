// Mock dialog data for the Central Agent Interactions page

export type ArtifactType = 'chart' | 'diagram' | 'code' | 'markdown';

export interface ChartArtifactData {
  type: 'chart';
  chartType: 'bar' | 'line' | 'area' | 'pie';
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
}

export interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type?: 'service' | 'database' | 'external' | 'queue';
  status?: 'healthy' | 'warning' | 'error';
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface DiagramArtifactData {
  type: 'diagram';
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface CodeArtifactData {
  type: 'code';
  title: string;
  language: string;
  code: string;
}

export interface MarkdownArtifactData {
  type: 'markdown';
  title: string;
  content: string;
}

export type ArtifactData =
  | ChartArtifactData
  | DiagramArtifactData
  | CodeArtifactData
  | MarkdownArtifactData;

export interface DialogMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  artifact?: ArtifactData;
  delayMs?: number;
}

export interface MockDialog {
  id: string;
  promptLabel: string;
  promptDescription: string;
  turns: DialogMessage[];
}

// Dialog 1: System Architecture Analysis
const systemArchitectureDialog: MockDialog = {
  id: 'system-architecture',
  promptLabel: 'Analyze system architecture',
  promptDescription: 'Review the current OpenSearch cluster topology and identify bottlenecks',
  turns: [
    {
      id: 'sa-1',
      sender: 'user',
      text: 'Can you analyze our current OpenSearch cluster architecture and identify any potential bottlenecks?',
    },
    {
      id: 'sa-2',
      sender: 'agent',
      text: 'I\'ll pull up the current cluster topology. Let me map out the services and their connections for you.',
      delayMs: 1500,
      artifact: {
        type: 'diagram',
        title: 'OpenSearch Cluster Architecture',
        nodes: [
          { id: 'lb', label: 'Load Balancer', x: 300, y: 50, type: 'external', status: 'healthy' },
          { id: 'coord-1', label: 'Coordinator 1', x: 150, y: 170, type: 'service', status: 'healthy' },
          { id: 'coord-2', label: 'Coordinator 2', x: 450, y: 170, type: 'service', status: 'healthy' },
          { id: 'data-1', label: 'Data Node 1', x: 80, y: 310, type: 'service', status: 'healthy' },
          { id: 'data-2', label: 'Data Node 2', x: 250, y: 310, type: 'service', status: 'warning' },
          { id: 'data-3', label: 'Data Node 3', x: 420, y: 310, type: 'service', status: 'healthy' },
          { id: 'data-4', label: 'Data Node 4', x: 590, y: 310, type: 'service', status: 'error' },
          { id: 'master', label: 'Master Node', x: 300, y: 450, type: 'service', status: 'healthy' },
          { id: 'queue', label: 'Ingest Queue', x: 550, y: 50, type: 'queue', status: 'warning' },
          { id: 'storage', label: 'S3 Snapshots', x: 550, y: 450, type: 'database', status: 'healthy' },
        ],
        edges: [
          { from: 'lb', to: 'coord-1', label: 'HTTPS', style: 'solid' },
          { from: 'lb', to: 'coord-2', label: 'HTTPS', style: 'solid' },
          { from: 'coord-1', to: 'data-1', style: 'solid' },
          { from: 'coord-1', to: 'data-2', style: 'solid' },
          { from: 'coord-2', to: 'data-3', style: 'solid' },
          { from: 'coord-2', to: 'data-4', style: 'dashed' },
          { from: 'master', to: 'data-1', label: 'cluster state', style: 'dashed' },
          { from: 'master', to: 'data-2', label: 'cluster state', style: 'dashed' },
          { from: 'master', to: 'data-3', label: 'cluster state', style: 'dashed' },
          { from: 'master', to: 'data-4', label: 'cluster state', style: 'dashed' },
          { from: 'queue', to: 'coord-2', label: 'bulk ingest', style: 'solid' },
          { from: 'data-3', to: 'storage', label: 'snapshots', style: 'dashed' },
        ],
      },
    },
    {
      id: 'sa-3',
      sender: 'user',
      text: 'I see Data Node 4 is in error state. What\'s happening there?',
    },
    {
      id: 'sa-4',
      sender: 'agent',
      text: 'Data Node 4 is experiencing high JVM heap pressure — it\'s been hovering above 90% for the last 2 hours. The connection from Coordinator 2 is intermittent (shown as dashed). This node holds 3 hot indices that are receiving heavy write traffic from the ingest queue. I\'d recommend rebalancing those shards across the healthy nodes.',
      delayMs: 2000,
    },
    {
      id: 'sa-5',
      sender: 'user',
      text: 'Can you show me the resource utilization across all data nodes?',
    },
    {
      id: 'sa-6',
      sender: 'agent',
      text: 'Here\'s the current resource breakdown across all four data nodes. You can clearly see Data Node 4 is the outlier.',
      delayMs: 1800,
      artifact: {
        type: 'chart',
        chartType: 'bar',
        title: 'Data Node Resource Utilization',
        xKey: 'node',
        yKeys: ['cpuPercent', 'heapPercent', 'diskPercent'],
        colors: ['#6366f1', '#f59e0b', '#ef4444'],
        data: [
          { node: 'Data Node 1', cpuPercent: 45, heapPercent: 62, diskPercent: 58 },
          { node: 'Data Node 2', cpuPercent: 68, heapPercent: 74, diskPercent: 71 },
          { node: 'Data Node 3', cpuPercent: 52, heapPercent: 59, diskPercent: 63 },
          { node: 'Data Node 4', cpuPercent: 92, heapPercent: 94, diskPercent: 87 },
        ],
      },
    },
  ],
};

// Dialog 2: Performance Investigation
const performanceDialog: MockDialog = {
  id: 'performance-investigation',
  promptLabel: 'Investigate query performance',
  promptDescription: 'Analyze slow queries and latency trends across the cluster',
  turns: [
    {
      id: 'pi-1',
      sender: 'user',
      text: 'We\'re seeing increased query latency over the past 24 hours. Can you investigate?',
    },
    {
      id: 'pi-2',
      sender: 'agent',
      text: 'I\'ve pulled the P99 and P50 latency metrics for the last 24 hours. There\'s a clear spike starting around 14:00 UTC that hasn\'t fully recovered.',
      delayMs: 2000,
      artifact: {
        type: 'chart',
        chartType: 'line',
        title: 'Query Latency (ms) — Last 24 Hours',
        xKey: 'time',
        yKeys: ['p99', 'p50'],
        colors: ['#ef4444', '#6366f1'],
        data: [
          { time: '00:00', p99: 120, p50: 45 },
          { time: '03:00', p99: 115, p50: 42 },
          { time: '06:00', p99: 130, p50: 48 },
          { time: '09:00', p99: 145, p50: 55 },
          { time: '12:00', p99: 160, p50: 60 },
          { time: '14:00', p99: 340, p50: 125 },
          { time: '15:00', p99: 520, p50: 210 },
          { time: '16:00', p99: 480, p50: 195 },
          { time: '18:00', p99: 390, p50: 150 },
          { time: '21:00', p99: 310, p50: 130 },
          { time: '23:59', p99: 280, p50: 110 },
        ],
      },
    },
    {
      id: 'pi-3',
      sender: 'user',
      text: 'What\'s causing the spike? Can you break it down by query type?',
    },
    {
      id: 'pi-4',
      sender: 'agent',
      text: 'Here\'s the latency breakdown by query type. Aggregation queries are the primary contributor — they jumped 4x during the spike window. This correlates with a new dashboard that was deployed at 13:45 UTC running heavy date histogram aggregations.',
      delayMs: 2200,
      artifact: {
        type: 'chart',
        chartType: 'bar',
        title: 'Avg Latency by Query Type (ms)',
        xKey: 'queryType',
        yKeys: ['before', 'during', 'after'],
        colors: ['#22c55e', '#ef4444', '#f59e0b'],
        data: [
          { queryType: 'Search', before: 35, during: 85, after: 60 },
          { queryType: 'Aggregation', before: 80, during: 340, after: 180 },
          { queryType: 'Scroll', before: 50, during: 120, after: 75 },
          { queryType: 'Multi-search', before: 65, during: 150, after: 95 },
          { queryType: 'Count', before: 15, during: 30, after: 20 },
        ],
      },
    },
    {
      id: 'pi-5',
      sender: 'user',
      text: 'Can you suggest an optimized query for those aggregations?',
    },
    {
      id: 'pi-6',
      sender: 'agent',
      text: 'The problematic dashboard is running an unbounded date_histogram with a 1-minute interval across 30 days of data. Here\'s an optimized version that uses a fixed time range, a coarser interval, and a shard_size limit to reduce memory pressure:',
      delayMs: 2500,
      artifact: {
        type: 'code',
        title: 'Optimized Aggregation Query',
        language: 'json',
        code: `{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-7d",
              "lte": "now"
            }
          }
        }
      ]
    }
  },
  "aggs": {
    "latency_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "fixed_interval": "1h",
        "min_doc_count": 0,
        "extended_bounds": {
          "min": "now-7d",
          "max": "now"
        }
      },
      "aggs": {
        "avg_latency": {
          "avg": { "field": "response_time_ms" }
        },
        "p99_latency": {
          "percentiles": {
            "field": "response_time_ms",
            "percents": [99]
          }
        }
      }
    }
  }
}`,
      },
    },
  ],
};

// Dialog 3: Security Audit
const securityAuditDialog: MockDialog = {
  id: 'security-audit',
  promptLabel: 'Run security audit',
  promptDescription: 'Audit cluster security settings, access patterns, and compliance status',
  turns: [
    {
      id: 'sec-1',
      sender: 'user',
      text: 'Can you run a security audit on our OpenSearch cluster and flag any issues?',
    },
    {
      id: 'sec-2',
      sender: 'agent',
      text: 'I\'ve completed the security audit. Here\'s a summary of findings across authentication, encryption, access control, and audit logging:',
      delayMs: 2000,
      artifact: {
        type: 'markdown',
        title: 'Security Audit Report',
        content: `## Cluster Security Audit — Summary

### ✅ Passing Checks
- **TLS in transit**: All node-to-node and client-to-node traffic is encrypted (TLS 1.3)
- **Authentication**: SAML SSO enabled for Dashboards access
- **Audit logging**: Enabled with write to dedicated audit index

### ⚠️ Warnings
- **Index permissions**: 3 roles have wildcard (\`*\`) index patterns — overly broad access
- **API key rotation**: 12 API keys haven't been rotated in over 90 days
- **Snapshot encryption**: S3 snapshots are using SSE-S3 instead of SSE-KMS

### ❌ Critical Issues
- **Anonymous access**: Anonymous auth is enabled on the cluster — any unauthenticated request gets \`read_all\` permissions
- **Admin password**: The default \`admin\` user still has the initial bootstrap password
- **Audit log gap**: Audit logging was disabled for 4 hours on March 15 due to index rollover failure`,
      },
    },
    {
      id: 'sec-3',
      sender: 'user',
      text: 'That anonymous access issue is critical. Show me how to disable it.',
    },
    {
      id: 'sec-4',
      sender: 'agent',
      text: 'Here\'s the configuration change needed to disable anonymous access. You\'ll need to update the security config and apply it with securityadmin:',
      delayMs: 1800,
      artifact: {
        type: 'code',
        title: 'Disable Anonymous Access',
        language: 'yaml',
        code: `# opensearch-security/config.yml
# Change anonymous_auth_enabled from true to false

config:
  dynamic:
    http:
      anonymous_auth_enabled: false
    authc:
      basic_internal_auth_domain:
        http_enabled: true
        transport_enabled: true
        order: 1
        http_authenticator:
          type: basic
          challenge: true
        authentication_backend:
          type: internal

# Apply with:
# ./securityadmin.sh -cd ../config/ \\
#   -icl -nhnv \\
#   -cacert root-ca.pem \\
#   -cert admin.pem \\
#   -key admin-key.pem`,
      },
    },
    {
      id: 'sec-5',
      sender: 'user',
      text: 'Can you show me the access pattern topology so I can see which services are connecting?',
    },
    {
      id: 'sec-6',
      sender: 'agent',
      text: 'Here\'s the access topology showing all services connecting to the cluster. The red connections indicate services using anonymous access — those are your immediate remediation targets.',
      delayMs: 2200,
      artifact: {
        type: 'diagram',
        title: 'Cluster Access Topology',
        nodes: [
          { id: 'cluster', label: 'OpenSearch Cluster', x: 300, y: 250, type: 'service', status: 'healthy' },
          { id: 'dashboard', label: 'Dashboards', x: 80, y: 100, type: 'service', status: 'healthy' },
          { id: 'logstash', label: 'Logstash Pipeline', x: 300, y: 50, type: 'service', status: 'healthy' },
          { id: 'app-api', label: 'App API Server', x: 520, y: 100, type: 'service', status: 'warning' },
          { id: 'monitoring', label: 'Monitoring Service', x: 80, y: 400, type: 'external', status: 'healthy' },
          { id: 'legacy', label: 'Legacy Ingestor', x: 520, y: 400, type: 'service', status: 'error' },
          { id: 'cron', label: 'Cron Jobs', x: 300, y: 450, type: 'service', status: 'error' },
        ],
        edges: [
          { from: 'dashboard', to: 'cluster', label: 'SAML auth', style: 'solid' },
          { from: 'logstash', to: 'cluster', label: 'API key', style: 'solid' },
          { from: 'app-api', to: 'cluster', label: 'API key (stale)', style: 'dashed' },
          { from: 'monitoring', to: 'cluster', label: 'basic auth', style: 'solid' },
          { from: 'legacy', to: 'cluster', label: 'anonymous', style: 'dashed' },
          { from: 'cron', to: 'cluster', label: 'anonymous', style: 'dashed' },
        ],
      },
    },
  ],
};

export const MOCK_DIALOGS: MockDialog[] = [
  systemArchitectureDialog,
  performanceDialog,
  securityAuditDialog,
];
