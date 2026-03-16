'use client';

import Link from 'next/link';
import type { Match } from '@/types/match';
import type { SportState } from '@/types/sport-states';
import { SportIcon } from './sport-icon';
import { LiveIndicator } from './live-indicator';
import { SportScoreDisplay } from './sport-displays/sport-score-display';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { getSportConfig } from '@/lib/sports-config';
import { Clock, MapPin } from 'lucide-react';

interface LiveMatchCardProps {
  match: Match;
  className?: string;
}

function getTeamName(team: Match['teamA']): string {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId.shortName || team.teamId.name;
  }
  return team.name || 'TBD';
}

function getTeamFullName(team: Match['teamA']): string {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId.name;
  }
  return team.name || 'TBD';
}

function getTeamColor(team: Match['teamA']): string {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId.color || '#6B7280';
  }
  return '#6B7280';
}

export function LiveMatchCard({ match, className }: LiveMatchCardProps) {
  const sportConfig = getSportConfig(match.sportType);
  const isLive = match.status === 'live' || match.status === 'paused';
  const isCompleted = match.status === 'completed';
  const teamAName = getTeamName(match.teamA);
  const teamBName = getTeamName(match.teamB);

  return (
    <Link href={`/match/${match._id}`}>
      <div
        className={cn(
          'bg-white border border-border rounded-xl p-4 hover:border-border-active hover:shadow-sm transition-all',
          isLive && 'border-danger/20 shadow-sm',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SportIcon sport={match.sportType} size={14} />
            <span className="text-xs text-text-secondary font-medium">{sportConfig.name}</span>
            {match.stage && (
              <span className="text-xs text-text-tertiary capitalize">{match.stage.replace(/_/g, ' ')}</span>
            )}
          </div>
          {isLive && <LiveIndicator size="sm" />}
          {isCompleted && (
            <span className="text-xs font-medium text-text-tertiary bg-surface px-2 py-0.5 rounded-full">
              Completed
            </span>
          )}
          {match.status === 'scheduled' && (
            <span className="text-xs text-text-tertiary">
              <Clock size={12} className="inline mr-1" />
              {match.scheduledAt ? formatRelativeTime(match.scheduledAt) : 'TBD'}
            </span>
          )}
        </div>

        {/* Score display */}
        {match.currentState ? (
          <SportScoreDisplay
            sportType={match.sportType}
            state={match.currentState as SportState}
            teamAName={teamAName}
            teamBName={teamBName}
            compact
          />
        ) : (
          /* Scheduled match — show teams */
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: getTeamColor(match.teamA) }} />
              <span className="text-sm font-medium">{getTeamFullName(match.teamA)}</span>
            </div>
            <span className="text-xs text-text-tertiary font-medium">vs</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{getTeamFullName(match.teamB)}</span>
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: getTeamColor(match.teamB) }} />
            </div>
          </div>
        )}

        {/* Completed result */}
        {isCompleted && match.resultSummary && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-text-secondary">
              {match.resultSummary.margin || 'Match completed'}
            </p>
          </div>
        )}

        {/* Venue */}
        {match.venue && (
          <div className="mt-2 flex items-center gap-1 text-xs text-text-tertiary">
            <MapPin size={10} />
            {match.venue}
          </div>
        )}
      </div>
    </Link>
  );
}
