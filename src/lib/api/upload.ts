import apiClient from './client';

export async function uploadAvatar(data: FormData) {
  return apiClient.post('/upload/avatar', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadLogo(data: FormData) {
  return apiClient.post('/upload/logo', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadMedia(data: FormData) {
  return apiClient.post('/upload/media', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function getPresignedUrl(params: { filename: string; contentType: string; folder?: string }) {
  return apiClient.get('/upload/presigned-url', { params });
}

export async function deleteFile(fileUrl: string) {
  return apiClient.delete('/upload', { data: { fileUrl } });
}
