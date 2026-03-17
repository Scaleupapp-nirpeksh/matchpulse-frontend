import apiClient from './client';

export interface CreateMatchData {
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  scheduledAt: string;
  round?: number;
  group?: string;
  venue?: string;
  [key: string]: unknown;
}

export interface Match {
  _id: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamName?: string;
  awayTeamName?: string;
  status: string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  score: Record<string, unknown>;
  round?: number;
  group?: string;
  venue?: string;
  scorer?: string;
  events: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface MatchLifecycleData {
  action: 'start' | 'pause' | 'resume' | 'end' | 'cancel' | 'postpone';
  reason?: string;
  [key: string]: unknown;
}

export async function createMatch(data: CreateMatchData) {
  return apiClient.post('/matches', data);
}

export async function getLiveMatches() {
  return apiClient.get('/matches/live');
}

export async function getMatch(id: string) {
  return apiClient.get(`/matches/${id}`);
}

export async function getTournamentMatches(tournamentId: string) {
  return apiClient.get(`/matches/tournament/${tournamentId}`);
}

export async function updateMatch(id: string, data: Partial<CreateMatchData>) {
  return apiClient.put(`/matches/${id}`, data);
}

export async function assignScorer(matchId: string, scorerId: string) {
  return apiClient.put(`/matches/${matchId}/scorer`, { scorerUserId: scorerId });
}

export async function matchLifecycle(matchId: string, data: MatchLifecycleData) {
  return apiClient.post(`/matches/${matchId}/lifecycle`, data);
}

export async function getMyMatches() {
  return apiClient.get('/matches/scorer/my-matches');
}
