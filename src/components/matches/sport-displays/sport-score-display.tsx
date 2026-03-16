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
  if (!state) {
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
      const vs = state as VolleyballState;
      const currentSet = vs.sets[vs.currentSet - 1] || { scoreA: 0, scoreB: 0 };
      return (
        <SetBasedScore
          setsWonA={vs.setsWonA}
          setsWonB={vs.setsWonB}
          currentPointsA={currentSet.scoreA}
          currentPointsB={currentSet.scoreB}
          currentSetNumber={vs.setNumber}
          sets={vs.sets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB, isComplete: s.isComplete }))}
          serving={vs.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Set"
          compact={compact}
        />
      );
    }

    case 'tennis': {
      const ts = state as TennisState;
      return (
        <SetBasedScore
          setsWonA={ts.setsWonA}
          setsWonB={ts.setsWonB}
          currentPointsA={ts.currentGame.pointsA}
          currentPointsB={ts.currentGame.pointsB}
          currentSetNumber={ts.sets.length + 1}
          sets={ts.sets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.gamesA, scoreB: s.gamesB, isComplete: s.isComplete }))}
          serving={ts.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Set"
          compact={compact}
          tiebreak={ts.tiebreak}
          tiebreakScore={ts.tiebreakScore}
          gamesA={ts.gamesA}
          gamesB={ts.gamesB}
        />
      );
    }

    case 'table_tennis': {
      const tt = state as TableTennisState;
      const currentSet = tt.sets[tt.currentSet - 1] || { scoreA: 0, scoreB: 0 };
      return (
        <SetBasedScore
          setsWonA={tt.setsWonA}
          setsWonB={tt.setsWonB}
          currentPointsA={currentSet.scoreA}
          currentPointsB={currentSet.scoreB}
          currentSetNumber={tt.setNumber}
          sets={tt.sets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB, isComplete: s.isComplete }))}
          serving={tt.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Game"
          compact={compact}
        />
      );
    }

    case 'badminton': {
      const bd = state as BadmintonState;
      const currentSet = bd.sets[bd.currentSet - 1] || { scoreA: 0, scoreB: 0 };
      return (
        <SetBasedScore
          setsWonA={bd.setsWonA}
          setsWonB={bd.setsWonB}
          currentPointsA={currentSet.scoreA}
          currentPointsB={currentSet.scoreB}
          currentSetNumber={bd.setNumber}
          sets={bd.sets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB, isComplete: s.isComplete }))}
          serving={bd.serving}
          teamAName={teamAName}
          teamBName={teamBName}
          unitLabel="Game"
          compact={compact}
        />
      );
    }

    case 'squash': {
      const sq = state as SquashState;
      const currentSet = sq.sets[sq.currentSet - 1] || { scoreA: 0, scoreB: 0 };
      return (
        <SetBasedScore
          setsWonA={sq.setsWonA}
          setsWonB={sq.setsWonB}
          currentPointsA={currentSet.scoreA}
          currentPointsB={currentSet.scoreB}
          currentSetNumber={sq.setNumber}
          sets={sq.sets.filter((s) => s.isComplete).map((s) => ({ scoreA: s.scoreA, scoreB: s.scoreB, isComplete: s.isComplete }))}
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
