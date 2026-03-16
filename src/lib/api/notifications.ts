import apiClient from './client';

export async function getNotifications(params?: Record<string, unknown>) {
  return apiClient.get('/notifications', { params });
}

export async function getUnreadCount() {
  return apiClient.get('/notifications/unread-count');
}

export async function markAllRead() {
  return apiClient.post('/notifications/mark-all-read');
}

export async function markRead(id: string) {
  return apiClient.patch(`/notifications/${id}/read`);
}

export async function registerPushSubscription(subscription: Record<string, unknown>) {
  return apiClient.post('/notifications/push/subscribe', subscription);
}

export async function unregisterPushSubscription(endpoint: string) {
  return apiClient.post('/notifications/push/unsubscribe', { endpoint });
}

export async function updateNotificationPreferences(preferences: Record<string, unknown>) {
  return apiClient.patch('/notifications/preferences', preferences);
}
