'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markAllRead, markRead } from '@/lib/api/notifications';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  match_start: 'bg-emerald-100 text-emerald-600',
  match_end: 'bg-blue-100 text-blue-600',
  score_update: 'bg-amber-100 text-amber-600',
  wicket: 'bg-red-100 text-red-600',
  goal: 'bg-emerald-100 text-emerald-600',
  tournament_update: 'bg-purple-100 text-purple-600',
  invite: 'bg-indigo-100 text-indigo-600',
  system: 'bg-gray-100 text-gray-600',
};

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch unread count
  const { data: countData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: async () => {
      const res = await getUnreadCount();
      const d = (res as unknown as { data: { count: number } }).data || res;
      return (d as { count: number }).count ?? 0;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30s
  });

  // Fetch recent notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: async () => {
      const res = await getNotifications({ limit: 8, page: 1 });
      const d = (res as unknown as { data: { notifications: Notification[] } }).data || res;
      return ((d as { notifications: Notification[] }).notifications || d) as Notification[];
    },
    enabled: isAuthenticated && open,
  });

  // Mark all as read
  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.setQueryData(['notification-count'], 0);
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  // Mark single as read
  const markOneMutation = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const count = typeof countData === 'number' ? countData : 0;
  const notifications = notificationsData || [];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-white border border-border shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
            {count > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                disabled={markAllMutation.isPending}
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n: Notification) => (
                <button
                  key={n._id}
                  onClick={() => {
                    if (!n.read) markOneMutation.mutate(n._id);
                    // Navigate based on notification type
                    if (n.data?.matchId) {
                      window.location.href = `/match/${n.data.matchId}`;
                    } else if (n.data?.tournamentId) {
                      window.location.href = `/tournament/${n.data.tournamentId}`;
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-border/50 last:border-0',
                    !n.read && 'bg-emerald-50/30'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    typeIcons[n.type] || 'bg-gray-100 text-gray-600'
                  )}>
                    <Bell size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm leading-snug', !n.read ? 'font-medium text-gray-900' : 'text-gray-700')}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
