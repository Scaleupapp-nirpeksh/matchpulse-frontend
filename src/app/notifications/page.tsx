'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, ChevronLeft, Loader2 } from 'lucide-react';
import { getNotifications, markAllRead, markRead } from '@/lib/api/notifications';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

const typeColors: Record<string, string> = {
  match_start: 'bg-emerald-500',
  match_end: 'bg-blue-500',
  score_update: 'bg-amber-500',
  wicket: 'bg-red-500',
  goal: 'bg-emerald-500',
  tournament_update: 'bg-purple-500',
  invite: 'bg-indigo-500',
  system: 'bg-gray-500',
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const res = await getNotifications({ page, limit: 20 });
      const d = (res as unknown as { data: { notifications: Notification[]; pagination: { total: number; pages: number } } }).data || res;
      return d as { notifications: Notification[]; pagination: { total: number; pages: number } };
    },
    enabled: isAuthenticated,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <Bell size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in to view notifications</h2>
          <Link href="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          </div>
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h2>
            <p className="text-sm text-gray-500">
              You&apos;ll see notifications here when matches start, scores update, and more.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n: Notification) => (
              <div
                key={n._id}
                className={cn(
                  'flex items-start gap-3 py-4 px-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors -mx-3',
                  !n.read && 'bg-emerald-50/20'
                )}
                onClick={() => {
                  if (!n.read) markOneMutation.mutate(n._id);
                  if (n.data?.matchId) window.location.href = `/match/${n.data.matchId}`;
                  else if (n.data?.tournamentId) window.location.href = `/tournament/${n.data.tournamentId}`;
                }}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full shrink-0 mt-2',
                  n.read ? 'bg-gray-200' : (typeColors[n.type] || 'bg-gray-400')
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm leading-snug', !n.read ? 'font-medium text-gray-900' : 'text-gray-700')}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
