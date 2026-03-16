import apiClient from './client';

export async function submitEvent(matchId: string, data: Record<string, unknown>) {
  return apiClient.post(`/matches/${matchId}/events`, data);
}

export async function getMatchEvents(matchId: string) {
  return apiClient.get(`/matches/${matchId}/events`);
}

export async function getMatchStats(matchId: string) {
  return apiClient.get(`/matches/${matchId}/stats`);
}

export async function undoEvent(matchId: string, eventId: string, reason?: string) {
  return apiClient.post(`/matches/${matchId}/events/${eventId}/undo`, { reason });
}
