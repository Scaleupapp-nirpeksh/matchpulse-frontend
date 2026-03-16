'use client';

import { cn } from '@/lib/utils';

interface Standing {
  rank: number;
  teamId: {
    _id: string;
    name: string;
    shortName?: string;
    color?: string;
    logoUrl?: string;
  } | string;
  played: number;
  won: number;
  lost: number;
  drawn?: number;
  tied?: number;
  points: number;
  forValue?: number;
  againstValue?: number;
  netValue?: number;
  additionalData?: Record<string, unknown>;
  groupName?: string;
}

interface StandingsTableProps {
  standings: Standing[];
  sportType: string;
  highlightTeamId?: string;
  compact?: boolean;
}

function getTeamName(team: Standing['teamId']): string {
  if (typeof team === 'object' && team !== null) {
    return team.shortName || team.name;
  }
  return 'Unknown';
}

function getTeamColor(team: Standing['teamId']): string {
  if (typeof team === 'object' && team !== null) {
    return team.color || '#6B7280';
  }
  return '#6B7280';
}

function getTeamId(team: Standing['teamId']): string {
  if (typeof team === 'object' && team !== null) {
    return team._id;
  }
  return team;
}

export function StandingsTable({ standings, sportType, highlightTeamId, compact = false }: StandingsTableProps) {
  const isCricket = sportType === 'cricket';
  const isFootball = sportType === 'football';
  const sortedStandings = [...standings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-text-tertiary border-b border-border">
            <th className="text-left py-2 pr-2 font-medium w-8">#</th>
            <th className="text-left py-2 font-medium">Team</th>
            <th className="text-center py-2 font-medium w-8">P</th>
            <th className="text-center py-2 font-medium w-8">W</th>
            {!compact && <th className="text-center py-2 font-medium w-8">L</th>}
            {!compact && (isFootball || isCricket) && <th className="text-center py-2 font-medium w-8">D</th>}
            {!compact && isCricket && <th className="text-center py-2 font-medium w-12">NRR</th>}
            {!compact && isFootball && <th className="text-center py-2 font-medium w-10">GD</th>}
            <th className="text-center py-2 font-medium w-10">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sortedStandings.map((s, i) => {
            const teamId = getTeamId(s.teamId);
            const isHighlighted = teamId === highlightTeamId;
            return (
              <tr
                key={teamId || i}
                className={cn(
                  'border-b border-border/50 last:border-0',
                  isHighlighted && 'bg-accent-light/30'
                )}
              >
                <td className="py-2.5 pr-2 text-text-tertiary font-medium">{s.rank}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getTeamColor(s.teamId) }} />
                    <span className="font-medium truncate">{getTeamName(s.teamId)}</span>
                  </div>
                </td>
                <td className="text-center py-2.5 text-text-secondary">{s.played}</td>
                <td className="text-center py-2.5 font-medium text-accent">{s.won}</td>
                {!compact && <td className="text-center py-2.5 text-text-secondary">{s.lost}</td>}
                {!compact && (isFootball || isCricket) && <td className="text-center py-2.5 text-text-secondary">{s.drawn ?? s.tied ?? 0}</td>}
                {!compact && isCricket && (
                  <td className="text-center py-2.5 text-text-secondary score-display">
                    {s.netValue !== undefined ? (s.netValue >= 0 ? '+' : '') + s.netValue.toFixed(2) : '-'}
                  </td>
                )}
                {!compact && isFootball && (
                  <td className="text-center py-2.5 text-text-secondary score-display">
                    {s.netValue !== undefined ? (s.netValue >= 0 ? '+' : '') + s.netValue : '-'}
                  </td>
                )}
                <td className="text-center py-2.5 font-bold">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
