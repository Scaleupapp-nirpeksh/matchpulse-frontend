'use client';

import type { Basketball5v5State, Basketball3x3State } from '@/types/sport-states';
import { useGameClock } from '@/hooks/use-game-clock';

interface BasketballScoreProps {
  state: Basketball5v5State | Basketball3x3State;
  teamAName: string;
  teamBName: string;
  is3x3?: boolean;
  compact?: boolean;
}

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function BasketballScore({ state, teamAName, teamBName, is3x3 = false, compact = false }: BasketballScoreProps) {
  const is5v5 = !is3x3 && 'quarter' in state;
  const liveClock = useGameClock(state.clockSeconds, state.clockRunning, state.clockStartedAt);

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{teamAName}</span>
          <span className="score-display text-2xl font-bold">{state.scoreA}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{teamBName}</span>
          <span className="score-display text-2xl font-bold">{state.scoreB}</span>
        </div>
        <div className="text-xs text-text-tertiary text-center">
          {is5v5 ? `Q${(state as Basketball5v5State).quarter}` : 'Game'} | {formatClock(liveClock)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main score */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-6">
          <div className="text-right flex-1">
            <p className="text-sm font-medium text-text-secondary">{teamAName}</p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="score-display text-4xl font-bold">{state.scoreA}</span>
            <span className="text-xl text-text-tertiary">-</span>
            <span className="score-display text-4xl font-bold">{state.scoreB}</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-text-secondary">{teamBName}</p>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-center gap-2">
          {is5v5 && (
            <span className="text-xs font-medium text-text-secondary">
              {(state as Basketball5v5State).isOvertime ? 'OT' : `Q${(state as Basketball5v5State).quarter}`}
            </span>
          )}
          {!is3x3 && <span className="text-xs font-mono text-accent">{formatClock(liveClock)}</span>}
          {is3x3 && (
            <span className="text-xs text-text-secondary">
              Target: {(state as Basketball3x3State).targetScore} | {formatClock(liveClock)}
            </span>
          )}
        </div>
      </div>

      {/* Team fouls */}
      <div className="flex justify-between text-xs text-text-secondary px-2">
        <span>Team Fouls: {state.teamFoulsA}</span>
        <span>Team Fouls: {state.teamFoulsB}</span>
      </div>

      {/* Quarter breakdown (5v5 only) */}
      {is5v5 && 'timeoutsA' in state && (
        <div className="flex justify-between text-xs text-text-secondary px-2">
          <span>Timeouts: {(state as Basketball5v5State).timeoutsA}</span>
          <span>Timeouts: {(state as Basketball5v5State).timeoutsB}</span>
        </div>
      )}
    </div>
  );
}
