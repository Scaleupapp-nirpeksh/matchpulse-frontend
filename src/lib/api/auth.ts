import apiClient from './client';

export interface RegisterEmailData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginEmailData {
  email: string;
  password: string;
}

export interface LoginPhoneData {
  phone: string;
  code: string;
}

export interface SendOtpData {
  phone: string;
  purpose: string;
}

export interface VerifyOtpData {
  phone: string;
  code: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function registerEmail(data: RegisterEmailData) {
  return apiClient.post('/auth/register/email', data);
}

export async function loginEmail(data: LoginEmailData) {
  return apiClient.post('/auth/login/email', data);
}

export async function loginPhone(data: LoginPhoneData) {
  return apiClient.post('/auth/login/phone', data);
}

export async function sendOtp(data: SendOtpData) {
  return apiClient.post('/auth/otp/send', data);
}

export async function verifyOtp(data: VerifyOtpData) {
  return apiClient.post('/auth/otp/verify', data);
}

export async function refreshToken() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  return apiClient.post('/auth/refresh', { refreshToken: token });
}

export async function logout() {
  return apiClient.post('/auth/logout');
}

export async function logoutAll() {
  return apiClient.post('/auth/logout-all');
}

export async function getProfile() {
  return apiClient.get('/auth/profile');
}

export async function updateProfile(data: UpdateProfileData) {
  return apiClient.put('/auth/profile', data);
}

export async function changePassword(data: ChangePasswordData) {
  return apiClient.put('/auth/change-password', data);
}

export async function forgotPassword(email: string) {
  return apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string) {
  return apiClient.post(`/auth/reset-password/${token}`, { password });
}
