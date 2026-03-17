import apiClient from './client';

export async function getPlayer(id: string) {
  return apiClient.get(`/players/${id}`);
}

export async function getPlayerStats(id: string) {
  return apiClient.get(`/players/${id}/stats`);
}

export async function getPlayerMatches(id: string) {
  return apiClient.get(`/players/${id}/matches`);
}

export async function getOrgPlayers(orgId: string) {
  return apiClient.get(`/players/org/${orgId}`);
}

export async function updatePlayer(id: string, data: Record<string, unknown>) {
  return apiClient.put(`/players/${id}`, data);
}
