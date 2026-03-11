import { Share2, Ellipsis, PanelRightClose, PanelRightOpen, Pencil, FileText, Settings, Archive, Globe, Users, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Workspace } from '@/types';

const WORKSPACE_TYPE_ICONS: Record<string, { svg: string; alt: string }> = {
  observability: { svg: './image/obv.svg', alt: 'Observability' },
  security: { svg: './image/security.svg', alt: 'Security' },
  search: { svg: './image/search.svg', alt: 'Search' },
  investigation: { svg: './image/security.svg', alt: 'Investigation' },
  default: { svg: './image/workspace.svg', alt: 'Workspace' },
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
  viewListCollapsed?: boolean;
  onShare: () => void;
  onSettings: () => void;
  onMenu: () => void;
}

export function WorkspaceHeader({ workspace, viewListCollapsed = false, onShare, onSettings, onMenu }: WorkspaceHeaderProps) {
  const [isPublic, setIsPublic] = useState(workspace.privacy === 'public');
  const [shareEmail, setShareEmail] = useState('');

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
      <div className="flex items-center min-w-0" style={{ gap: '6px' }}>
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
      <div className="flex items-center shrink-0" style={{ gap: '9px' }}>
        {/* Cluster names */}
        <div className="flex items-center gap-2 text-xs text-oui-dark-shade">
          {['otel-domain', 'os219', 'xiaosi233'].map((name, i) => (
            <span key={name} className="flex items-center gap-2">
              {i > 0 && <span className="h-3 w-px bg-oui-light-shade" />}
              <span>{name}</span>
            </span>
          ))}
        </div>

        <Dialog>
          <DialogTrigger render={
            <button
              className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/60 bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),inset_0_-1px_0_0_rgba(255,255,255,0.2)]"
              aria-label="Share workspace"
              data-testid="share-button"
            />
          }>
              <Share2 className="size-4 text-oui-dark-shade" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Share workspace</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-5 pt-2">
              {/* Make public toggle */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Globe className="size-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Make public</p>
                    <p className="text-xs text-slate-500">Anyone with the link can view</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsPublic(!isPublic); handleShare(); }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${isPublic ? 'bg-blue-600' : 'bg-slate-200'}`}
                  role="switch"
                  aria-checked={isPublic}
                >
                  <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0.5'} mt-0.5`} />
                </button>
              </div>

              {/* Copy link */}
              {isPublic && (
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Copy className="size-3.5" />
                  Copy link
                </button>
              )}

              {/* Share to individuals */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Users className="size-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-900">Share to individuals</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <button
                    onClick={() => { if (shareEmail.trim()) { toast.success(`Invited ${shareEmail}`); setShareEmail(''); } }}
                    disabled={!shareEmail.trim()}
                    className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Invite
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button
              className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/60 bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),inset_0_-1px_0_0_rgba(255,255,255,0.2)]"
              aria-label="More options"
              data-testid="settings-button"
            />
          }>
              <Ellipsis className="size-4 text-oui-dark-shade" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className="min-w-[200px] p-2 space-y-1">
            <DropdownMenuItem onClick={onSettings} className="py-2">
              <Pencil className="size-4" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSettings} className="py-2">
              <FileText className="size-4" />
              <span>Generate report</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSettings} className="py-2">
              <Settings className="size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSettings} className="py-2 text-red-600 focus:text-red-600">
              <Archive className="size-4" />
              <span>Archive</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={onMenu}
          className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/60 bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),inset_0_-1px_0_0_rgba(255,255,255,0.2)]"
          aria-label="Menu"
        >
          {viewListCollapsed ? (
            <PanelRightOpen className="size-4 text-oui-dark-shade" />
          ) : (
            <PanelRightClose className="size-4 text-oui-dark-shade" />
          )}
        </button>
      </div>
    </header>
  );
}
