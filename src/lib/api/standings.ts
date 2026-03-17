import apiClient from './client';

export async function getTournamentStandings(tournamentId: string) {
  return apiClient.get(`/standings/tournament/${tournamentId}`);
}

export async function recalculateStandings(tournamentId: string) {
  return apiClient.post(`/standings/tournament/${tournamentId}/recalculate`);
}
