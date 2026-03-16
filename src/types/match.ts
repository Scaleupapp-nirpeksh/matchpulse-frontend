import type { SportState } from './sport-states';

export interface MatchTeam {
  teamId: string | { _id: string; name: string; shortName?: string; color?: string; logoUrl?: string; players?: any[] };
  name?: string;
}

export interface Match {
  _id: string;
  tournamentId: string | { _id: string; name: string; sportType: string; format: string };
  sportType: string;
  teamA: MatchTeam;
  teamB: MatchTeam;
  scheduledAt?: string;
  venue?: string;
  stage?: string;
  groupName?: string;
  matchNumber?: number;
  scorerUserId?: string;
  currentState?: SportState;
  resultSummary?: {
    winnerId?: string;
    scoreA?: number;
    scoreB?: number;
    margin?: string;
    resultType?: string;
    motm?: string;
  };
  aiSummary?: string;
  matchInsights?: Record<string, unknown>;
  winProbability?: { a: number; b: number };
  toss?: { winnerId: string; decision: string };
  status: 'scheduled' | 'live' | 'paused' | 'completed' | 'cancelled' | 'postponed';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
