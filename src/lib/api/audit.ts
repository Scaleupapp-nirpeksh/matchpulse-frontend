import apiClient from './client';

export async function getOrgAuditLogs(orgId: string, params?: Record<string, unknown>) {
  return apiClient.get(`/audit/org/${orgId}`, { params });
}

export async function exportAuditLogs(orgId: string, params?: Record<string, unknown>) {
  return apiClient.get(`/audit/org/${orgId}/export`, {
    params,
    responseType: 'blob',
  });
}

export async function getEntityAuditTrail(entityType: string, entityId: string) {
  return apiClient.get(`/audit/entity/${entityType}/${entityId}`);
}
