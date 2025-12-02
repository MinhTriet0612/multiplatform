import api from './api';

export interface CreateInstagramPostPayload {
  content: string;
  mediaUrls: string[];
  mediaType?: 'IMAGE' | 'VIDEO' | 'REELS' | 'STORIES' | 'CAROUSEL';
}

export interface InstagramPost {
  id: string;
  content: string;
  mediaUrls: string[];
  mediaType: string;
  status: string;
  externalId?: string;
  containerId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const uploadInstagramPost = (payload: CreateInstagramPostPayload) =>
  api.post<InstagramPost>('/posts/instagram/upload', payload);

export const getInstagramPosts = () =>
  api.get<InstagramPost[]>('/posts/instagram');

export const getInstagramPostById = (id: string) =>
  api.get<InstagramPost>(`/posts/instagram/${id}`);

