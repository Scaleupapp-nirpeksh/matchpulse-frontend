import apiClient from './client';

export interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  [key: string]: unknown;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  owner: string;
  members: OrgMember[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface CreateInviteData {
  email?: string;
  phone?: string;
  role: string;
  expiresInDays?: number;
  [key: string]: unknown;
}

export interface OrgMember {
  user: string;
  role: string;
  joinedAt: string;
  [key: string]: unknown;
}

export async function createOrganization(data: CreateOrganizationData) {
  return apiClient.post('/organizations', data);
}

export async function getOrganizations() {
  return apiClient.get('/organizations');
}

export async function getOrganizationBySlug(slug: string) {
  return apiClient.get(`/organizations/slug/${slug}`);
}

export async function getOrganization(id: string) {
  return apiClient.get(`/organizations/${id}`);
}

export async function updateOrganization(id: string, data: Partial<CreateOrganizationData>) {
  return apiClient.patch(`/organizations/${id}`, data);
}

export async function createInvite(orgId: string, data: CreateInviteData) {
  return apiClient.post(`/organizations/${orgId}/invites`, data);
}

export async function joinOrganization(inviteCode: string) {
  return apiClient.post(`/organizations/join/${inviteCode}`);
}

export async function getMembers(orgId: string) {
  return apiClient.get(`/organizations/${orgId}/members`);
}
