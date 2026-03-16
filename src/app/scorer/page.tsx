'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SportIcon } from '@/components/matches/sport-icon';
import { LiveIndicator } from '@/components/matches/live-indicator';
import { getMyMatches } from '@/lib/api/matches';
import { getSportConfig } from '@/lib/sports-config';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { Match } from '@/types/match';
import { Clipboard, Play, Clock, CheckCircle } from 'lucide-react';

function getTeamName(team: Match['teamA']): string {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId.name;
  }
  return team.name || 'TBD';
}

export default function ScorerMyMatchesPage() {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['myMatches'],
    queryFn: () => getMyMatches() as unknown as Promise<Match[]>,
  });

  const liveMatches = (matches as Match[]).filter((m) => m.status === 'live' || m.status === 'paused');
  const upcomingMatches = (matches as Match[]).filter((m) => m.status === 'scheduled');
  const completedMatches = (matches as Match[]).filter((m) => m.status === 'completed');

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if ((matches as Match[]).length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={Clipboard}
          title="No matches assigned"
          description="You do not have any matches assigned to you for scoring. Contact your tournament admin to get assigned."
        />
      </div>
    );
  }

  const renderMatchCard = (match: Match) => {
    const sportConfig = getSportConfig(match.sportType);
    const isLive = match.status === 'live' || match.status === 'paused';
    const isScheduled = match.status === 'scheduled';

    return (
      <Card key={match._id} className={isLive ? 'border-danger/20' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Sport + Status */}
              <div className="mb-2 flex items-center gap-2">
                <SportIcon sport={match.sportType} size={14} />
                <span className="text-xs font-medium text-text-secondary">
                  {sportConfig.name}
                </span>
                {isLive && <LiveIndicator size="sm" />}
                {match.status === 'paused' && (
                  <Badge variant="warning" size="sm">Paused</Badge>
                )}
              </div>

              {/* Teams */}
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-text-primary">
                  {getTeamName(match.teamA)}
                </p>
                <p className="text-xs text-text-tertiary">vs</p>
                <p className="text-sm font-semibold text-text-primary">
                  {getTeamName(match.teamB)}
                </p>
              </div>

              {/* Time / Venue */}
              <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
                {match.scheduledAt && (
                  <span>
                    <Clock className="mr-1 inline h-3 w-3" />
                    {isScheduled
                      ? formatRelativeTime(match.scheduledAt)
                      : formatDate(match.scheduledAt)}
                  </span>
                )}
                {match.venue && <span>{match.venue}</span>}
              </div>
            </div>

            {/* Score Now button */}
            {(isLive || isScheduled) && (
              <Button asChild size="sm" className="min-h-[44px] min-w-[90px]">
                <Link href={`/scorer/match/${match._id}`}>
                  <Play className="mr-1 h-3.5 w-3.5" />
                  {isLive ? 'Continue' : 'Score Now'}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-text-primary">My Matches</h1>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <LiveIndicator size="sm" />
            <h2 className="text-sm font-semibold text-text-primary">
              Live ({liveMatches.length})
            </h2>
          </div>
          <div className="space-y-3">
            {liveMatches.map(renderMatchCard)}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcomingMatches.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-text-primary">
              Upcoming ({upcomingMatches.length})
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingMatches.map(renderMatchCard)}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedMatches.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-text-primary">
              Completed ({completedMatches.length})
            </h2>
          </div>
          <div className="space-y-3">
            {completedMatches.map(renderMatchCard)}
          </div>
        </div>
      )}
    </div>
  );
}
