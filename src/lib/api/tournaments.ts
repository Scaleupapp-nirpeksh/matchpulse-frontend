import apiClient from './client';

export interface CreateTournamentData {
  name: string;
  sportType: string;
  format: string;
  organization: string;
  startDate: string;
  endDate?: string;
  rules?: Record<string, unknown>;
  maxTeams?: number;
  description?: string;
  [key: string]: unknown;
}

export interface Tournament {
  _id: string;
  name: string;
  sportType: string;
  format: string;
  organization: string;
  status: string;
  startDate: string;
  endDate?: string;
  rules: Record<string, unknown>;
  maxTeams?: number;
  description?: string;
  teams: string[];
  matches: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface TournamentQueryParams {
  organization?: string;
  sportType?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

export async function createTournament(data: CreateTournamentData) {
  return apiClient.post('/tournaments', data);
}

export async function getTournaments(params?: TournamentQueryParams) {
  return apiClient.get('/tournaments', { params });
}

export async function getTournament(id: string) {
  return apiClient.get(`/tournaments/${id}`);
}

export async function getOrgTournaments(orgId: string, params?: TournamentQueryParams) {
  return apiClient.get(`/organizations/${orgId}/tournaments`, { params });
}

export async function updateTournament(id: string, data: Partial<CreateTournamentData>) {
  return apiClient.patch(`/tournaments/${id}`, data);
}

export async function updateTournamentStatus(id: string, status: string) {
  return apiClient.patch(`/tournaments/${id}/status`, { status });
}

export async function generateFixtures(id: string) {
  return apiClient.post(`/tournaments/${id}/fixtures`);
}
