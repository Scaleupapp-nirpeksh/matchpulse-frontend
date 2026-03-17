import apiClient from './client';

export async function getNotifications(params?: Record<string, unknown>) {
  return apiClient.get('/notifications', { params });
}

export async function getUnreadCount() {
  return apiClient.get('/notifications/unread-count');
}

export async function markAllRead() {
  return apiClient.put('/notifications/read-all');
}

export async function markRead(id: string) {
  return apiClient.put(`/notifications/${id}/read`);
}

export async function registerPushSubscription(subscription: Record<string, unknown>) {
  return apiClient.post('/notifications/push-subscription', subscription);
}

export async function unregisterPushSubscription(token: string) {
  return apiClient.delete(`/notifications/push-subscription/${token}`);
}

export async function getNotificationPreferences() {
  return apiClient.get('/notifications/preferences');
}

export async function updateNotificationPreferences(preferences: Record<string, unknown>) {
  return apiClient.put('/notifications/preferences', preferences);
}
