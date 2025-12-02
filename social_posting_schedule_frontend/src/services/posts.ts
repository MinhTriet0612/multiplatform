import api from './api';

export type Platform = 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK';

export interface UploadPostPayload {
  content: string;
  mediaUrl?: string;
  scheduledAt?: string;
  platforms?: Platform[];
}

export const uploadUnifiedPost = (payload: UploadPostPayload) =>
  api.post('/posts/upload', payload);


