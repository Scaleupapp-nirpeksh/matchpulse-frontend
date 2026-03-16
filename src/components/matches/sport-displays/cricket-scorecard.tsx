'use client';

import type { CricketState, CricketBatter, CricketBowler } from '@/types/sport-states';
import { cn } from '@/lib/utils';

interface CricketScorecardProps {
  state: CricketState;
  teamAName: string;
  teamBName: string;
  compact?: boolean;
}

function BallDisplay({ ball }: { ball: string }) {
  const isWicket = ball === 'W';
  const isFour = ball === '4';
  const isSix = ball === '6';
  const isDot = ball === '0' || ball === '.';
  const isExtra = ball.includes('Wd') || ball.includes('Nb') || ball.includes('B') || ball.includes('Lb');

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold',
        isWicket && 'bg-danger text-white',
        isFour && 'bg-blue-100 text-blue-700',
        isSix && 'bg-purple-100 text-purple-700',
        isDot && 'bg-gray-100 text-gray-500',
        isExtra && 'bg-amber-100 text-amber-700',
        !isWicket && !isFour && !isSix && !isDot && !isExtra && 'bg-gray-50 text-gray-700'
      )}
    >
      {ball}
    </span>
  );
}

export function CricketScorecard({ state, teamAName, teamBName, compact = false }: CricketScorecardProps) {
  const currentInnings = state.innings[state.currentInnings];
  const battingTeamName = state.battingTeam === state.innings[0]?.battingTeamId ? teamAName : teamBName;

  if (compact) {
    return (
      <div className="space-y-2">
        {state.innings.map((inn, i) => {
          const teamName = inn.battingTeamId === state.innings[0]?.battingTeamId ? teamAName : teamBName;
          return (
            <div key={i} className="flex items-baseline justify-between">
              <span className={cn('text-sm', i === state.currentInnings ? 'font-semibold text-text-primary' : 'text-text-secondary')}>
                {teamName}
              </span>
              <div className="flex items-baseline gap-1">
                <span className={cn('score-display text-lg font-bold', i === state.currentInnings && 'text-text-primary')}>
                  {inn.score}/{inn.wickets}
                </span>
                <span className="text-xs text-text-tertiary">({inn.overs}.{inn.ballsInCurrentOver})</span>
              </div>
            </div>
          );
        })}
        {state.target && (
          <p className="text-xs text-text-secondary">
            Target: {state.target} | RR: {state.runRate?.toFixed(1)} | RRR: {state.requiredRate?.toFixed(1) || '-'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Innings scores */}
      <div className="space-y-3">
        {state.innings.map((inn, i) => {
          const teamName = inn.battingTeamId === state.innings[0]?.battingTeamId ? teamAName : teamBName;
          const isCurrent = i === state.currentInnings && !state.isComplete;
          return (
            <div key={i} className={cn('p-3 rounded-lg', isCurrent ? 'bg-accent-light/50 border border-accent/20' : 'bg-surface')}>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm font-medium', isCurrent && 'text-accent')}>
                  {teamName} {isCurrent && '(batting)'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="score-display text-2xl font-bold">{inn.score}/{inn.wickets}</span>
                  <span className="text-sm text-text-secondary">({inn.overs}.{inn.ballsInCurrentOver} ov)</span>
                </div>
              </div>
              {isCurrent && (
                <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
                  <span>CRR: <b className="text-text-primary">{inn.runRate?.toFixed(1)}</b></span>
                  {state.requiredRate && <span>RRR: <b className="text-text-primary">{state.requiredRate.toFixed(1)}</b></span>}
                  {state.target && <span>Need: <b className="text-text-primary">{state.target - inn.score}</b> off <b>{(state.oversPerInnings * 6) - (inn.overs * 6 + inn.ballsInCurrentOver)}</b> balls</span>}
                  {state.freeHitNext && <span className="text-orange font-semibold">FREE HIT</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Last 6 balls */}
      {currentInnings?.lastSixBalls && currentInnings.lastSixBalls.length > 0 && (
        <div>
          <p className="text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wide">This Over</p>
          <div className="flex gap-1.5">
            {currentInnings.lastSixBalls.map((ball, i) => (
              <BallDisplay key={i} ball={ball} />
            ))}
          </div>
        </div>
      )}

      {/* Current batters */}
      {currentInnings?.batters && currentInnings.batters.filter((b) => !b.isOut).length > 0 && (
        <div>
          <p className="text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wide">Batting</p>
          <div className="space-y-1">
            {currentInnings.batters
              .filter((b: CricketBatter) => !b.isOut)
              .map((batter: CricketBatter) => (
                <div key={batter.playerId} className="flex items-center justify-between text-sm">
                  <span className={cn('font-medium', batter.playerId === state.currentBatter && 'text-accent')}>
                    {batter.name || 'Batter'} {batter.playerId === state.currentBatter ? '*' : ''}
                  </span>
                  <span className="score-display text-text-secondary">
                    {batter.runs} ({batter.balls}) {batter.fours > 0 && <span className="text-blue-600">{batter.fours}x4</span>} {batter.sixes > 0 && <span className="text-purple-600">{batter.sixes}x6</span>}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Current bowler */}
      {currentInnings?.bowlers && currentInnings.bowlers.length > 0 && (
        <div>
          <p className="text-xs text-text-tertiary mb-1.5 font-medium uppercase tracking-wide">Bowling</p>
          {currentInnings.bowlers
            .filter((b: CricketBowler) => b.playerId === state.currentBowler)
            .map((bowler: CricketBowler) => (
              <div key={bowler.playerId} className="flex items-center justify-between text-sm">
                <span className="font-medium">{bowler.name || 'Bowler'}</span>
                <span className="score-display text-text-secondary">
                  {bowler.overs}.{bowler.balls}-{bowler.maidens}-{bowler.runs}-{bowler.wickets} (Econ: {bowler.economy?.toFixed(1)})
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Extras */}
      {currentInnings?.extras && (currentInnings.extras.total > 0) && (
        <p className="text-xs text-text-secondary">
          Extras: {currentInnings.extras.total} (Wd {currentInnings.extras.wides}, Nb {currentInnings.extras.noBalls}, B {currentInnings.extras.byes}, Lb {currentInnings.extras.legByes})
        </p>
      )}
    </div>
  );
}
