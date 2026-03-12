import { useCallback, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Server, Database, Globe, Inbox } from 'lucide-react';
import type { DiagramArtifactData, DiagramNode, DiagramEdge } from '../../data/agent-mock-dialogs';

interface DiagramArtifactProps {
  config: DiagramArtifactData;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.2;

const STATUS_COLORS: Record<string, string> = {
  healthy: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

const NODE_ICONS: Record<string, typeof Server> = {
  service: Server,
  database: Database,
  external: Globe,
  queue: Inbox,
};

const NODE_WIDTH = 140;
const NODE_HEIGHT = 56;

export function DiagramArtifact({ config }: DiagramArtifactProps) {
  const { title, nodes, edges } = config;
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta));
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const zoomIn = () => setScale((s) => Math.min(MAX_ZOOM, s + ZOOM_STEP));
  const zoomOut = () => setScale((s) => Math.max(MIN_ZOOM, s - ZOOM_STEP));
  const resetView = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors" aria-label="Zoom out">
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors" aria-label="Zoom in">
            <ZoomIn size={16} />
          </button>
          <button onClick={resetView} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors" aria-label="Reset zoom">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-hidden rounded-lg bg-slate-900/50 border border-slate-700 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg
          width="100%"
          height="100%"
          style={{ transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`, transformOrigin: 'center center' }}
        >
          {edges.map((edge, i) => renderEdge(edge, nodeMap, i))}
          {nodes.map((node) => renderNode(node))}
        </svg>
      </div>
    </div>
  );
}

function renderNode(node: DiagramNode) {
  const statusColor = STATUS_COLORS[node.status ?? 'healthy'] ?? STATUS_COLORS.healthy;
  const Icon = NODE_ICONS[node.type ?? 'service'] ?? Server;
  const cx = node.x;
  const cy = node.y;

  return (
    <g key={node.id}>
      <rect
        x={cx - NODE_WIDTH / 2}
        y={cy - NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={10}
        fill="#1e293b"
        stroke={statusColor}
        strokeWidth={2}
      />
      <foreignObject x={cx - NODE_WIDTH / 2} y={cy - NODE_HEIGHT / 2} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div className="flex flex-col items-center justify-center h-full gap-0.5 px-2">
          <Icon size={16} color={statusColor} />
          <span className="text-[10px] text-slate-200 text-center leading-tight truncate w-full">{node.label}</span>
        </div>
      </foreignObject>
    </g>
  );
}

function renderEdge(edge: DiagramEdge, nodeMap: Map<string, DiagramNode>, index: number) {
  const from = nodeMap.get(edge.from);
  const to = nodeMap.get(edge.to);
  if (!from || !to) return null;

  const isDashed = edge.style === 'dashed';
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <g key={`edge-${index}`}>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#475569"
        strokeWidth={1.5}
        strokeDasharray={isDashed ? '6 4' : undefined}
        markerEnd="url(#arrowhead)"
      />
      {edge.label && (
        <>
          <rect
            x={midX - edge.label.length * 3.2}
            y={midY - 8}
            width={edge.label.length * 6.4}
            height={16}
            rx={4}
            fill="#0f172a"
            opacity={0.85}
          />
          <text x={midX} y={midY + 4} textAnchor="middle" className="text-[9px] fill-slate-400">
            {edge.label}
          </text>
        </>
      )}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#475569" />
        </marker>
      </defs>
    </g>
  );
}
