import { Share2, Settings, Menu } from 'lucide-react';
import { toast } from 'sonner';
import type { Workspace } from '@/types';

const WORKSPACE_TYPE_ICONS: Record<string, { svg: string; alt: string }> = {
  observability: { svg: '/image/obv.svg', alt: 'Observability' },
  security: { svg: '/image/security.svg', alt: 'Security' },
  search: { svg: '/image/search.svg', alt: 'Search' },
  default: { svg: '/image/workspace.svg', alt: 'Workspace' },
};

const WORKSPACE_COLORS = [
  '#9333ea', '#2563eb', '#e11d48', '#0891b2', '#059669',
  '#d97706', '#7c3aed', '#dc2626', '#0d9488', '#c026d3',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

interface WorkspaceHeaderProps {
  workspace: Workspace;
  onShare: () => void;
  onSettings: () => void;
  onMenu: () => void;
}

export function WorkspaceHeader({ workspace, onShare, onSettings, onMenu }: WorkspaceHeaderProps) {
  const handleShare = () => {
    try {
      onShare();
    } catch {
      toast.error('Failed to share workspace. Please try again.');
    }
  };

  const wsType = workspace.dataSources[0]?.type ?? 'default';
  const icon = WORKSPACE_TYPE_ICONS[wsType] ?? WORKSPACE_TYPE_ICONS.default;
  const color = WORKSPACE_COLORS[hashName(workspace.name) % WORKSPACE_COLORS.length];

  return (
    <header
      data-testid="workspace-header"
      className="flex h-[72px] items-center justify-between px-3"
    >
      {/* Left: icon + name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-6 shrink-0 items-center justify-center">
          <div
            className="size-4"
            style={{
              backgroundColor: color,
              WebkitMaskImage: `url(${icon.svg})`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskImage: `url(${icon.svg})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }}
            role="img"
            aria-label={icon.alt}
          />
        </div>
        <h1 className="truncate text-base font-bold text-black tracking-tight">
          {workspace.name}
        </h1>
      </div>

      {/* Right: data sources + actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Cluster names */}
        <div className="flex items-center gap-2 text-xs text-oui-dark-shade">
          {['otel-domain', 'os219', 'xiaosi233'].map((name, i) => (
            <span key={name} className="flex items-center gap-2">
              {i > 0 && <span className="h-3 w-px bg-oui-light-shade" />}
              <span>{name}</span>
            </span>
          ))}
        </div>

        <button
          onClick={handleShare}
          className="flex items-center justify-center rounded-lg bg-white p-2 transition-colors hover:bg-slate-50"
          aria-label="Share workspace"
          data-testid="share-button"
        >
          <Share2 className="size-4 text-oui-dark-shade" />
        </button>

        <button
          onClick={onSettings}
          className="flex items-center justify-center rounded-lg bg-white p-2 transition-colors hover:bg-slate-50"
          aria-label="Settings"
          data-testid="settings-button"
        >
          <Settings className="size-4 text-oui-dark-shade" />
        </button>

        <button
          onClick={onMenu}
          className="flex items-center justify-center rounded-lg bg-white p-2 transition-colors hover:bg-slate-50"
          aria-label="Menu"
        >
          <Menu className="size-4 text-oui-dark-shade" />
        </button>
      </div>
    </header>
  );
}
