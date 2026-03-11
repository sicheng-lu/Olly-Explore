import {
  Plus,
  X,
  Compass,
  LayoutDashboard,
  Activity,
  FileText,
  StickyNote,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { PAGE_TYPES as REGISTERED_PAGE_TYPES } from '@/components/pages/page-types';
import type { CanvasPage } from '@/types';

interface ViewListProps {
  pages: CanvasPage[];
  activePageId: string;
  onPageClick: (pageId: string) => void;
  onPageClose: (pageId: string) => void;
  onAddPage: (pageType: string) => void;
  isCollapsed?: boolean;
}

const VIEW_PAGE_TYPES = [
  { type: 'logs', label: 'Logs', icon: Compass },
  { type: 'traces', label: 'Traces', icon: Compass },
  { type: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'summary', label: 'Summary', icon: FileText, separator: true },
  { type: 'hypothesis', label: 'Hypothesis', icon: Activity },
  { type: 'note', label: 'Note', icon: StickyNote, separator: true },
] as const;

function pageIcon(type: string) {
  const found = VIEW_PAGE_TYPES.find((p) => p.type === type);
  return found?.icon ?? FileText;
}

export function ViewList({
  pages,
  activePageId,
  onPageClick,
  onPageClose,
  onAddPage,
  isCollapsed = false,
}: ViewListProps) {
  const sorted = [...pages].sort((a, b) => a.order - b.order);

  return (
    <div
      className="shrink-0 flex-col gap-3 overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: isCollapsed ? 0 : 120, display: 'flex' }}
      data-testid="view-list"
    >
      {/* Add page button */}
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-[36px] w-full flex-row items-center justify-center gap-2 rounded-lg transition-colors cursor-pointer bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),inset_0_-1px_0_0_rgba(255,255,255,0.2)] hover:bg-white/60"
            aria-label="Add page"
            data-testid="view-list-add-btn"
          >
            <Plus className="size-4 text-oui-dark-shade" />
            <span className="text-xs text-oui-dark-shade">Add new</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="start" sideOffset={8} className="min-w-[200px]">
            <DropdownMenuGroup>
              {VIEW_PAGE_TYPES.map(({ type, label, icon: Icon, ...rest }) => (
                <span key={type}>
                  {'separator' in rest && rest.separator && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => onAddPage(type)}
                    data-testid={`view-list-add-${type}`}
                  >
                    <Icon className="size-4" style={{ color: '#005EB8' }} />
                    <span>{label}</span>
                  </DropdownMenuItem>
                </span>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scrollable page entries */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 px-[2px] pt-3 pb-[2px]">
          {sorted.map((page) => {
            const isActive = page.id === activePageId;
            const Icon = pageIcon(page.type);

            return (
              <div
                key={page.id}
                role="button"
                tabIndex={0}
                className={`group relative flex h-[80px] flex-col items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),inset_0_-1px_0_0_rgba(255,255,255,0.2)] hover:bg-white/60 ${
                  isActive ? 'ring-2 ring-oui-link' : ''
                }`}
                onClick={() => onPageClick(page.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPageClick(page.id);
                  }
                }}
                data-testid={`view-list-entry-${page.id}`}
                data-active={isActive}
              >
                {/* Close button — visible on hover, hidden for summary */}
                {page.type !== 'paragraph' && (
                <button
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 z-10 hidden items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-1 shadow-sm group-hover:flex ${
                    page.type === 'hypothesis'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageClose(page.id);
                  }}
                  aria-label={`${page.type === 'hypothesis' ? 'Rule out' : 'Remove'} ${page.title}`}
                  data-testid={`view-list-close-${page.id}`}
                >
                  <X className="size-3.5" />
                  <span className="text-xs font-medium leading-none">
                    {page.type === 'hypothesis' ? 'Rule out' : 'Remove'}
                  </span>
                </button>
                )}

                <Icon
                  className="size-5 text-oui-dark-shade"
                />
                <span
                  className={`w-full truncate text-center text-xs leading-tight px-1 ${
                    isActive ? 'text-oui-darkest-shade font-medium' : 'text-oui-dark-shade'
                  }`}
                >
                  {page.title}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
