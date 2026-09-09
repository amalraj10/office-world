import { UserStatus } from '@/types';

export const STATUS_META: Record<
  UserStatus,
  { label: string; dot: string; text: string; ring: string; solidBg: string }
> = {
  Working: {
    label: 'Working',
    dot: 'bg-emerald-500',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/40',
    solidBg: 'bg-emerald-600',
  },
  Available: {
    label: 'Available',
    dot: 'bg-emerald-500',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/40',
    solidBg: 'bg-slate-200',
  },
  Break: {
    label: 'Break',
    dot: 'bg-blue-500',
    text: 'text-blue-400',
    ring: 'ring-blue-500/40',
    solidBg: 'bg-blue-600',
  },
  Away: {
    label: 'Away',
    dot: 'bg-amber-500',
    text: 'text-amber-400',
    ring: 'ring-amber-500/40',
    solidBg: 'bg-amber-500',
  },
  Offline: {
    label: 'Offline',
    dot: 'bg-slate-500',
    text: 'text-slate-400',
    ring: 'ring-slate-500/40',
    solidBg: 'bg-slate-600',
  },
  'In a meeting': {
    label: 'In a meeting',
    dot: 'bg-red-500',
    text: 'text-red-400',
    ring: 'ring-red-500/40',
    solidBg: 'bg-red-600',
  },
};

// The four selectable statuses shown in "My Status"
export const MY_STATUS_OPTIONS: UserStatus[] = ['Working', 'Available', 'Break', 'Away'];

export function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
