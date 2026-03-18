import apiClient from './client';

export interface CreateTeamData {
  name: string;
  shortName?: string;
  tournamentId: string;
  seed?: number;
  logo?: string;
  [key: string]: unknown;
}

export interface Team {
  _id: string;
  name: string;
  shortName?: string;
  seed?: number;
  tournament: string;
  logo?: string;
  players: TeamPlayer[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface TeamPlayer {
  player: string;
  name: string;
  jerseyNumber?: number;
  position?: string;
  isCaptain?: boolean;
  [key: string]: unknown;
}

export interface AddPlayerData {
  player?: string;
  name: string;
  jerseyNumber?: number;
  position?: string;
  isCaptain?: boolean;
  [key: string]: unknown;
}

export async function createTeam(data: CreateTeamData) {
  return apiClient.post('/teams', data);
}

export async function getTournamentTeams(tournamentId: string) {
  return apiClient.get(`/teams/tournament/${tournamentId}`);
}

export async function getTeam(id: string) {
  return apiClient.get(`/teams/${id}`);
}

export async function updateTeam(id: string, data: Partial<CreateTeamData>) {
  return apiClient.put(`/teams/${id}`, data);
}

export async function deleteTeam(id: string) {
  return apiClient.delete(`/teams/${id}`);
}

export async function addPlayer(teamId: string, data: AddPlayerData) {
  return apiClient.post(`/teams/${teamId}/players`, data);
}

export interface UpdatePlayerData {
  jerseyNumber?: number;
  position?: string;
  role?: string;
  isPlaying?: boolean;
  [key: string]: unknown;
}

export async function updatePlayerInTeam(teamId: string, playerId: string, data: UpdatePlayerData) {
  return apiClient.put(`/teams/${teamId}/players/${playerId}`, data);
}

export async function removePlayer(teamId: string, playerId: string) {
  return apiClient.delete(`/teams/${teamId}/players/${playerId}`);
}

export async function bulkImportTeams(tournamentId: string, data: FormData) {
  return apiClient.post(`/teams/tournament/${tournamentId}/bulk-import`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// Public team registration
export interface PublicRegistrationData {
  teamName: string;
  shortName?: string;
  captain: { name: string; email?: string; phone?: string };
  players: Array<{ name: string; jerseyNumber?: number; position?: string }>;
}

export async function publicRegisterTeam(tournamentId: string, data: PublicRegistrationData) {
  return apiClient.post(`/teams/tournament/${tournamentId}/register`, data);
}

export async function getRegistrations(tournamentId: string, status?: string) {
  return apiClient.get(`/teams/tournament/${tournamentId}/registrations`, { params: { status } });
}

export async function reviewRegistration(
  tournamentId: string,
  registrationId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string
) {
  return apiClient.put(`/teams/tournament/${tournamentId}/registrations/${registrationId}`, { action, rejectionReason });
}

// AI-powered import
export interface AiImportPreview {
  originalHeaders: string[];
  totalRows: number;
  columnMapping: Record<string, string>;
  teams: Array<{
    name: string;
    shortName: string;
    players: Array<{ name: string; jerseyNumber?: number; position?: string; role?: string }>;
  }>;
  confidence: number;
  warnings: string[];
}

export async function aiImportTeams(tournamentId: string, data: FormData) {
  return apiClient.post(`/teams/tournament/${tournamentId}/ai-import`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function confirmAiImport(
  tournamentId: string,
  data: { teams: AiImportPreview['teams'] }
) {
  return apiClient.post(`/teams/tournament/${tournamentId}/ai-import/confirm`, data);
}
