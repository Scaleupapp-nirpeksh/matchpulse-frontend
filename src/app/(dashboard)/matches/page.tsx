'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { SportIcon } from '@/components/matches/sport-icon';
import { LiveIndicator } from '@/components/matches/live-indicator';
import { LiveMatchCard } from '@/components/matches/live-match-card';
import { getLiveMatches, getMyMatches } from '@/lib/api/matches';
import { SPORT_LIST } from '@/lib/constants';
import { SPORT_CONFIGS } from '@/lib/sports-config';
import { formatDate, cn } from '@/lib/utils';
import type { Match } from '@/types/match';
import { Calendar, Filter } from 'lucide-react';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
] as const;

export default function MatchesPage() {
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: liveMatches = [], isLoading: loadingLive } = useQuery({
    queryKey: ['liveMatches'],
    queryFn: () => getLiveMatches() as unknown as Promise<Match[]>,
  });

  const { data: myMatches = [], isLoading: loadingMy } = useQuery({
    queryKey: ['myMatches'],
    queryFn: () => getMyMatches() as unknown as Promise<Match[]>,
  });

  const isLoading = loadingLive || loadingMy;

  // Merge and deduplicate
  const allMatchesMap = new Map<string, Match>();
  for (const m of [...(liveMatches as Match[]), ...(myMatches as Match[])]) {
    allMatchesMap.set(m._id, m);
  }
  const allMatches = Array.from(allMatchesMap.values());

  // Apply filters
  const filtered = allMatches.filter((m) => {
    if (sportFilter !== 'all' && m.sportType !== sportFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  // Sort: live first, then scheduled by date, then completed
  const sorted = [...filtered].sort((a, b) => {
    const statusOrder: Record<string, number> = { live: 0, paused: 1, scheduled: 2, completed: 3, cancelled: 4, postponed: 5 };
    const diff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    if (diff !== 0) return diff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Matches</h1>

      {/* Sport Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSportFilter('all')}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
            sportFilter === 'all'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-surface border border-border text-text-secondary hover:border-accent/40'
          )}
        >
          All Sports
        </button>
        {SPORT_LIST.map((sport) => {
          const config = SPORT_CONFIGS[sport];
          return (
            <button
              key={sport}
              onClick={() => setSportFilter(sport)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                sportFilter === sport
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:border-accent/40'
              )}
            >
              <SportIcon sport={sport} size={12} />
              {config?.name ?? sport}
            </button>
          );
        })}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
              statusFilter === s.value
                ? 'bg-text-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:border-border-active'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Match Grid */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No matches found"
          description={
            sportFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more matches.'
              : 'Matches will appear here once tournaments have fixtures.'
          }
          action={
            sportFilter !== 'all' || statusFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSportFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((match) => (
            <LiveMatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
