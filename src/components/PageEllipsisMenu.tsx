import {
  MoreHorizontal,
  Sparkles,
  PenLine,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface PageEllipsisMenuProps {
  isHypothesis?: boolean;
  onRemove?: () => void;
}

export function PageEllipsisMenu({ isHypothesis, onRemove }: PageEllipsisMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
        aria-label="More options"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={4} className="min-w-[160px]">
        <DropdownMenuItem disabled>
          <Sparkles className="size-4" />
          <span>Ask AI</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <PenLine className="size-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRemove}
          className="text-red-600 focus:text-red-600"
        >
          {isHypothesis ? <XCircle className="size-4" /> : <Trash2 className="size-4" />}
          <span>{isHypothesis ? 'Rule out' : 'Remove page'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
