import api from './api';

export interface CreateFacebookPostPayload {
  content: string;
  mediaUrl?: string;
  mediaType?: 'TEXT' | 'PHOTO' | 'VIDEO';
  scheduledAt?: string;
}

export interface FacebookPost {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType: string;
  status: string;
  externalId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const uploadFacebookPost = (payload: CreateFacebookPostPayload) =>
  api.post<FacebookPost>('/posts/facebook/upload', payload);

export const getFacebookPosts = () =>
  api.get<FacebookPost[]>('/posts/facebook');

export const getFacebookPostById = (id: string) =>
  api.get<FacebookPost>(`/posts/facebook/${id}`);

