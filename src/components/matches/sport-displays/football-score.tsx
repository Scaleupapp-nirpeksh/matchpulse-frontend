'use client';

import type { FootballState } from '@/types/sport-states';
import { useGameClock } from '@/hooks/use-game-clock';
import { cn } from '@/lib/utils';

interface FootballScoreProps {
  state: FootballState;
  teamAName: string;
  teamBName: string;
  compact?: boolean;
}

const halfLabels: Record<number, string> = {
  0: 'Not Started',
  1: '1st Half',
  2: '2nd Half',
  3: 'Extra Time 1',
  4: 'Extra Time 2',
  5: 'Penalties',
};

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function FootballScore({ state, teamAName, teamBName, compact = false }: FootballScoreProps) {
  // Football counts UP (elapsed time, e.g. 0:00 → 45:00)
  const liveClock = useGameClock(state.clockSeconds, state.clockRunning, state.clockStartedAt, 'up');
  const goals = (state?.events || []).filter((e) => e.type === 'goal');
  const goalsA = goals.filter((g) => g.teamId === state.teamAId);
  const goalsB = goals.filter((g) => g.teamId === state.teamBId);

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{teamAName}</span>
        <div className="flex items-baseline gap-2">
          <span className="score-display text-2xl font-bold">{state.scoreA}</span>
          <span className="text-text-tertiary">-</span>
          <span className="score-display text-2xl font-bold">{state.scoreB}</span>
        </div>
        <span className="text-sm font-medium">{teamBName}</span>
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
          <span className="text-xs font-medium text-text-secondary">{halfLabels[state.half] || ''}</span>
          {state.clockRunning && (
            <span className="text-xs font-mono text-accent">{formatClock(liveClock)}</span>
          )}
        </div>
      </div>

      {/* Goal scorers */}
      {(goalsA.length > 0 || goalsB.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            {goalsA.map((g, i) => (
              <p key={i} className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">{g.minute}&apos;</span> Goal
              </p>
            ))}
          </div>
          <div className="space-y-1 text-right">
            {goalsB.map((g, i) => (
              <p key={i} className="text-xs text-text-secondary">
                Goal <span className="font-medium text-text-primary">{g.minute}&apos;</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {state.cards && state.cards.length > 0 && (
        <div>
          <p className="text-xs text-text-tertiary mb-1 font-medium uppercase tracking-wide">Cards</p>
          <div className="flex flex-wrap gap-1.5">
            {state.cards.map((card, i) => (
              <span
                key={i}
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                  card.type === 'yellow' ? 'bg-warning-light text-warning' : 'bg-danger-light text-danger'
                )}
              >
                <span className={cn('w-2.5 h-3 rounded-sm', card.type === 'yellow' ? 'bg-warning' : 'bg-danger')} />
                {card.minute}&apos;
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Penalties */}
      {state.penalties && (
        <div className="text-center">
          <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide mb-1">Penalty Shootout</p>
          <p className="score-display text-lg font-bold">
            {state.penalties.teamAGoals} - {state.penalties.teamBGoals}
          </p>
        </div>
      )}
    </div>
  );
}
