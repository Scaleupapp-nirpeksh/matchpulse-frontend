'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Match } from '@/types/match';

interface BracketViewProps {
  matches: Match[];
}

interface BracketMatch {
  match: Match;
  teamAName: string;
  teamBName: string;
  teamAScore: string;
  teamBScore: string;
  winnerId?: string;
  isLive: boolean;
  isCompleted: boolean;
}

const ROUND_ORDER = [
  'final',
  'semi_final', 'semifinal', 'semi-final',
  'quarter_final', 'quarterfinal', 'quarter-final',
  'round_of_16', 'round-of-16',
  'round_of_32', 'round-of-32',
];

function getTeamName(team: Match['teamA']): string {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId.shortName || team.teamId.name;
  }
  return team.shortName || team.name || 'TBD';
}

function getTeamScore(match: Match, side: 'A' | 'B'): string {
  const team = side === 'A' ? match.teamA : match.teamB;
  const rs = match.resultSummary;
  if (rs) {
    return side === 'A' ? String(rs.scoreA ?? '-') : String(rs.scoreB ?? '-');
  }
  if (match.currentState) {
    const state = match.currentState as unknown as Record<string, unknown>;
    // Try generic score fields
    if (state.scoreA !== undefined && side === 'A') return String(state.scoreA);
    if (state.scoreB !== undefined && side === 'B') return String(state.scoreB);
  }
  if (match.status === 'completed' || match.status === 'live') {
    return '-';
  }
  return '';
}

function getTeamId(team: Match['teamA']): string | undefined {
  if (typeof team.teamId === 'object' && team.teamId !== null) {
    return team.teamId._id;
  }
  return typeof team.teamId === 'string' ? team.teamId : undefined;
}

function parseBracketMatches(matches: Match[]): BracketMatch[] {
  return matches.map((match) => ({
    match,
    teamAName: getTeamName(match.teamA),
    teamBName: getTeamName(match.teamB),
    teamAScore: getTeamScore(match, 'A'),
    teamBScore: getTeamScore(match, 'B'),
    winnerId: match.resultSummary?.winnerId,
    isLive: match.status === 'live' || match.status === 'paused',
    isCompleted: match.status === 'completed',
  }));
}

function getRoundName(stage: string): string {
  const names: Record<string, string> = {
    final: 'Final',
    semi_final: 'Semi-Finals',
    semifinal: 'Semi-Finals',
    'semi-final': 'Semi-Finals',
    quarter_final: 'Quarter-Finals',
    quarterfinal: 'Quarter-Finals',
    'quarter-final': 'Quarter-Finals',
    round_of_16: 'Round of 16',
    'round-of-16': 'Round of 16',
    round_of_32: 'Round of 32',
    'round-of-32': 'Round of 32',
  };
  return names[stage.toLowerCase()] || stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRoundOrder(stage: string): number {
  const lower = stage.toLowerCase();
  const idx = ROUND_ORDER.indexOf(lower);
  return idx >= 0 ? idx : 100;
}

function MatchCard({ bm }: { bm: BracketMatch }) {
  const teamAId = getTeamId(bm.match.teamA);
  const isTeamAWinner = bm.winnerId && teamAId && bm.winnerId === teamAId;
  const isTeamBWinner = bm.winnerId && !isTeamAWinner;

  return (
    <Link href={`/match/${bm.match._id}`}>
      <div
        className={cn(
          'border rounded-lg overflow-hidden hover:shadow-md transition-all bg-white min-w-[200px]',
          bm.isLive ? 'border-red-300 shadow-sm' : 'border-gray-200'
        )}
      >
        {/* Team A */}
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2 border-b border-gray-100',
            bm.isCompleted && isTeamAWinner && 'bg-emerald-50/50'
          )}
        >
          <span
            className={cn(
              'text-sm truncate max-w-[140px]',
              bm.isCompleted && isTeamAWinner ? 'font-semibold text-gray-900' : 'text-gray-600'
            )}
          >
            {bm.teamAName}
          </span>
          <span
            className={cn(
              'text-sm font-mono ml-3',
              bm.isCompleted && isTeamAWinner ? 'font-bold text-gray-900' : 'text-gray-500'
            )}
          >
            {bm.teamAScore}
          </span>
        </div>

        {/* Team B */}
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2',
            bm.isCompleted && isTeamBWinner && 'bg-emerald-50/50'
          )}
        >
          <span
            className={cn(
              'text-sm truncate max-w-[140px]',
              bm.isCompleted && isTeamBWinner ? 'font-semibold text-gray-900' : 'text-gray-600'
            )}
          >
            {bm.teamBName}
          </span>
          <span
            className={cn(
              'text-sm font-mono ml-3',
              bm.isCompleted && isTeamBWinner ? 'font-bold text-gray-900' : 'text-gray-500'
            )}
          >
            {bm.teamBScore}
          </span>
        </div>

        {/* Status Bar */}
        {(bm.isLive || bm.isCompleted) && (
          <div
            className={cn(
              'px-3 py-1 text-center text-xs font-medium',
              bm.isLive ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
            )}
          >
            {bm.isLive ? 'LIVE' : 'FT'}
          </div>
        )}
      </div>
    </Link>
  );
}

export function BracketView({ matches }: BracketViewProps) {
  const bracketMatches = parseBracketMatches(matches);

  // Group by stage/round
  const grouped = bracketMatches.reduce<Record<string, BracketMatch[]>>((acc, bm) => {
    const stage = bm.match.stage || 'match';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(bm);
    return acc;
  }, {});

  // Sort rounds: later rounds first (Final > Semi > Quarter...)
  const sortedRounds = Object.entries(grouped).sort(
    ([a], [b]) => getRoundOrder(a) - getRoundOrder(b)
  );

  if (sortedRounds.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        No bracket matches available
      </div>
    );
  }

  // Check if we have a champion
  const finalRound = sortedRounds.find(([stage]) => stage.toLowerCase().includes('final') && !stage.toLowerCase().includes('semi'));
  const finalMatch = finalRound?.[1]?.[0];
  const champion = finalMatch?.isCompleted
    ? (finalMatch.winnerId === getTeamId(finalMatch.match.teamA)
      ? finalMatch.teamAName
      : finalMatch.teamBName)
    : null;

  return (
    <div className="space-y-8">
      {/* Champion Banner */}
      {champion && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
            <Trophy size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-amber-600 font-medium">Champion</p>
            <p className="text-lg font-bold text-gray-900">{champion}</p>
          </div>
        </div>
      )}

      {/* Bracket Rounds — Horizontal Scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max">
          {sortedRounds.reverse().map(([stage, roundMatches]) => (
            <div key={stage} className="flex flex-col items-center">
              <div className="mb-4">
                <Badge variant="default" size="sm" className="capitalize">
                  {getRoundName(stage)}
                </Badge>
              </div>
              <div className="flex flex-col gap-4 justify-center" style={{ minHeight: roundMatches.length > 1 ? `${roundMatches.length * 90}px` : 'auto' }}>
                {roundMatches.map((bm) => (
                  <MatchCard key={bm.match._id} bm={bm} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
