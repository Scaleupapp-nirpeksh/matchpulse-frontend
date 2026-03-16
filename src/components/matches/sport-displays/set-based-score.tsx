'use client';

import { cn } from '@/lib/utils';

interface SetScore {
  scoreA: number;
  scoreB: number;
  isComplete?: boolean;
}

interface SetBasedScoreProps {
  setsWonA: number;
  setsWonB: number;
  currentPointsA: number;
  currentPointsB: number;
  currentSetNumber: number;
  sets: SetScore[];
  serving?: 'A' | 'B';
  teamAName: string;
  teamBName: string;
  unitLabel?: string;
  compact?: boolean;
  // Tennis-specific
  tiebreak?: boolean;
  tiebreakScore?: { a: number; b: number };
  gamesA?: number;
  gamesB?: number;
}

function ServingDot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />;
}

export function SetBasedScore({
  setsWonA,
  setsWonB,
  currentPointsA,
  currentPointsB,
  currentSetNumber,
  sets,
  serving,
  teamAName,
  teamBName,
  unitLabel = 'Set',
  compact = false,
  tiebreak,
  tiebreakScore,
  gamesA,
  gamesB,
}: SetBasedScoreProps) {
  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {serving === 'A' && <ServingDot />}
            <span className="text-sm font-medium">{teamAName}</span>
          </div>
          <div className="flex items-center gap-2">
            {sets.map((set, i) => (
              <span key={i} className={cn('score-display text-xs w-5 text-center', set.scoreA > set.scoreB ? 'font-bold text-text-primary' : 'text-text-tertiary')}>
                {set.scoreA}
              </span>
            ))}
            <span className="score-display text-sm font-bold w-6 text-center text-accent">{currentPointsA}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {serving === 'B' && <ServingDot />}
            <span className="text-sm font-medium">{teamBName}</span>
          </div>
          <div className="flex items-center gap-2">
            {sets.map((set, i) => (
              <span key={i} className={cn('score-display text-xs w-5 text-center', set.scoreB > set.scoreA ? 'font-bold text-text-primary' : 'text-text-tertiary')}>
                {set.scoreB}
              </span>
            ))}
            <span className="score-display text-sm font-bold w-6 text-center text-accent">{currentPointsB}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sets won */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-6">
          <div className="text-right flex-1">
            <p className="text-sm font-medium text-text-secondary">{teamAName}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="score-display text-3xl font-bold">{setsWonA}</span>
            <span className="text-lg text-text-tertiary">-</span>
            <span className="score-display text-3xl font-bold">{setsWonB}</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-text-secondary">{teamBName}</p>
          </div>
        </div>
        <p className="text-xs text-text-tertiary mt-0.5">{unitLabel} {currentSetNumber}</p>
      </div>

      {/* Set-by-set breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-text-tertiary">
              <th className="text-left py-1 font-medium">Player/Team</th>
              {sets.map((_, i) => (
                <th key={i} className="text-center py-1 w-8 font-medium">{i + 1}</th>
              ))}
              <th className="text-center py-1 w-10 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1.5">
                <div className="flex items-center gap-1.5">
                  {serving === 'A' && <ServingDot />}
                  <span className="font-medium">{teamAName}</span>
                </div>
              </td>
              {sets.map((set, i) => (
                <td key={i} className={cn('text-center score-display', set.scoreA > set.scoreB ? 'font-bold' : 'text-text-tertiary')}>
                  {set.scoreA}
                </td>
              ))}
              <td className="text-center score-display font-bold text-accent">{currentPointsA}</td>
            </tr>
            <tr>
              <td className="py-1.5">
                <div className="flex items-center gap-1.5">
                  {serving === 'B' && <ServingDot />}
                  <span className="font-medium">{teamBName}</span>
                </div>
              </td>
              {sets.map((set, i) => (
                <td key={i} className={cn('text-center score-display', set.scoreB > set.scoreA ? 'font-bold' : 'text-text-tertiary')}>
                  {set.scoreB}
                </td>
              ))}
              <td className="text-center score-display font-bold text-accent">{currentPointsB}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tennis games in current set */}
      {gamesA !== undefined && gamesB !== undefined && (
        <div className="text-center text-xs text-text-secondary">
          Games: {gamesA} - {gamesB}
          {tiebreak && tiebreakScore && (
            <span className="ml-2 text-orange font-medium">
              Tiebreak: {tiebreakScore.a} - {tiebreakScore.b}
            </span>
          )}
        </div>
      )}

      {/* Service indicator */}
      {serving && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
          <ServingDot />
          <span>Serving: {serving === 'A' ? teamAName : teamBName}</span>
        </div>
      )}
    </div>
  );
}
