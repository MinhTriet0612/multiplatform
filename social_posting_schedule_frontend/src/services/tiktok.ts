import api from './api';

export interface CreateTikTokPostPayload {
  content: string;
  videoUrl: string;
  title?: string;
  scheduledAt?: string;
}

export interface TikTokPost {
  id: string;
  content: string;
  videoUrl?: string;
  title?: string;
  status: string;
  externalId?: string;
  uploadId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const uploadTikTokPost = (payload: CreateTikTokPostPayload) =>
  api.post<TikTokPost>('/posts/tiktok/upload', payload);

export const getTikTokPosts = () =>
  api.get<TikTokPost[]>('/posts/tiktok');

export const getTikTokPostById = (id: string) =>
  api.get<TikTokPost>(`/posts/tiktok/${id}`);

