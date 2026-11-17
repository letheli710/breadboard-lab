// The Lucide icons the always-loaded app shell needs (header, page tabs, course button, the
// "Perfect!" dialog). Kept apart from ui/Icons.tsx so the start-up bundle carries only these; the
// pages' icons load with the pages.

import { BookOpen, ChevronDown, ChevronRight, FolderOpen, Lightbulb, NotebookPen, PartyPopper, PenLine, Target, type LucideIcon } from 'lucide-react';

export const CORE_ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  target: Target,
  practice: NotebookPen,
  edit: PenLine,
  bulb: Lightbulb,
  folder: FolderOpen,
  down: ChevronDown,
  next: ChevronRight,
  party: PartyPopper,
};

/** An app-shell icon by name (see ui/Icons.tsx Icon for the full set). */
export function CoreIcon({ name, size = 18 }: { name: string; size?: number }) {
  const L = CORE_ICONS[name];
  return L ? <L size={size} strokeWidth={2} aria-hidden focusable={false} className="icon" /> : null;
}
