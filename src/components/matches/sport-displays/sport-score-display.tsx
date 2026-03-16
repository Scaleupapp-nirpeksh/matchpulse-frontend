'use client';

import type { SportState, CricketState, FootballState, Basketball5v5State, Basketball3x3State, VolleyballState, TennisState, TableTennisState, BadmintonState, SquashState } from '@/types/sport-states';
import { CricketScorecard } from './cricket-scorecard';
import { FootballScore } from './football-score';
import { BasketballScore } from './basketball-score';
import { SetBasedScore } from './set-based-score';

interface SportScoreDisplayProps {
  sportType: string;
  state: SportState;
  teamAName: string;
  teamBName: string;
  compact?: boolean;
}

export function SportScoreDisplay({ sportType, state, teamAName, teamBName, compact = false }: SportScoreDisplayProps) {
  if (!state || typeof state !== 'object') {
    return (
      <div className="text-center py-4 text-sm text-text-tertiary">
        Match not started yet
      </div>
    );
  }

  switch (sportType) {
    case 'cricket':
      return <CricketScorecard state={state as CricketState} teamAName={teamAName} teamBName={teamBName} compact={compact} />;

    case 'football':
      return <FootballScore state={state as FootballState} teamAName={teamAName} teamBName={teamBName} compact={compact} />;

    case 'basketball_5v5':
      return <BasketballScore state={state as Basketball5v5State} teamAName={teamAName} teamBName={teamBName} compact={compact} />;

    case 'basketball_3x3':
      return <BasketballScore state={state as Basketball3x3State} teamAName={teamAName} teamBName={teamBName} is3x3 compact={compact} />;

    case 'volleyball': {
      const vs = state as Partial<VolleyballState>;
      const sets = vs.sets ?? [];
      const currentSet = sets[(vs.currentSet ?? 1) - 1] ?? { scoreA: 0, scoreB: 0 };
      return (
        <SetBasedScore
          setsWonA={vs.setsWonA ?? 0}
          setsWonB={vs.setsWonB ?? 0}
          currentPointsA={currentSet.scoreA ?? 0}
          currentPointsB={currentSet.scoreB ?? 0}
          currentSetNumber={vs.setNumber ?? 1}
          sets={sets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB, isComplete: s.isComplete }))}
          serving={vs.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Set"
          compact={compact}
        />
      );
    }

    case 'tennis': {
      const ts = state as Partial<TennisState>;
      const tsSets = ts.sets ?? [];
      const currentGame = ts.currentGame ?? { pointsA: 0, pointsB: 0 };
      return (
        <SetBasedScore
          setsWonA={ts.setsWonA ?? 0}
          setsWonB={ts.setsWonB ?? 0}
          currentPointsA={currentGame.pointsA ?? 0}
          currentPointsB={currentGame.pointsB ?? 0}
          currentSetNumber={tsSets.length + 1}
          sets={tsSets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.gamesA, scoreB: s.gamesB, isComplete: s.isComplete }))}
          serving={ts.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Set"
          compact={compact}
          tiebreak={ts.tiebreak}
          tiebreakScore={ts.tiebreakScore}
          gamesA={ts.gamesA ?? 0}
          gamesB={ts.gamesB ?? 0}
        />
      );
    }

    case 'table_tennis': {
      const tt = state as Partial<TableTennisState>;
      const ttSets = tt.sets ?? [];
      const ttCurrentSet = ttSets[(tt.currentSet ?? 1) - 1] ?? { scoreA: 0, scoreB: 0 };
      return (
        <SetBasedScore
          setsWonA={tt.setsWonA ?? 0}
          setsWonB={tt.setsWonB ?? 0}
          currentPointsA={ttCurrentSet.scoreA ?? 0}
          currentPointsB={ttCurrentSet.scoreB ?? 0}
          currentSetNumber={tt.setNumber ?? 1}
          sets={ttSets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB, isComplete: s.isComplete }))}
          serving={tt.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Game"
          compact={compact}
        />
      );
    }

    case 'badminton': {
      const bd = state as Partial<BadmintonState>;
      const bdSets = bd.sets ?? [];
      const bdCurrentSet = bdSets[(bd.currentSet ?? 1) - 1] ?? { scoreA: 0, scoreB: 0 };
      return (
        <SetBasedScore
          setsWonA={bd.setsWonA ?? 0}
          setsWonB={bd.setsWonB ?? 0}
          currentPointsA={bdCurrentSet.scoreA ?? 0}
          currentPointsB={bdCurrentSet.scoreB ?? 0}
          currentSetNumber={bd.setNumber ?? 1}
          sets={bdSets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB, isComplete: s.isComplete }))}
          serving={bd.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Game"
          compact={compact}
        />
      );
    }

    case 'squash': {
      const sq = state as Partial<SquashState>;
      const sqSets = sq.sets ?? [];
      const sqCurrentSet = sqSets[(sq.currentSet ?? 1) - 1] ?? { scoreA: 0, scoreB: 0 };
      return (
        <SetBasedScore
          setsWonA={sq.setsWonA ?? 0}
          setsWonB={sq.setsWonB ?? 0}
          currentPointsA={sqCurrentSet.scoreA ?? 0}
          currentPointsB={sqCurrentSet.scoreB ?? 0}
          currentSetNumber={sq.setNumber ?? 1}
          sets={sqSets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB, isComplete: s.isComplete }))}
          serving={sq.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Game"
          compact={compact}
        />
      );
    }

    default:
      return (
        <div className="text-center py-4 text-sm text-text-tertiary">
          Unsupported sport: {sportType}
        </div>
      );
  }
}
