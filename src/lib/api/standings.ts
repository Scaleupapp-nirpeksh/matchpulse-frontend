import apiClient from './client';

export async function getTournamentStandings(tournamentId: string) {
  return apiClient.get(`/tournaments/${tournamentId}/standings`);
}

export async function recalculateStandings(tournamentId: string) {
  return apiClient.post(`/tournaments/${tournamentId}/standings/recalculate`);
}
