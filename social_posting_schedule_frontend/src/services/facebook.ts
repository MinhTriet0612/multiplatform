import api from './api';

export interface CreateFacebookPostPayload {
  content: string;
  mediaUrl?: string;
  mediaType?: 'TEXT' | 'PHOTO' | 'VIDEO';
  scheduledAt?: string;
  groupId?: string;
}

export interface FacebookPost {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType: string;
  status: string;
  groupId?: string;
  externalId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacebookInsightValue {
  value: number | Record<string, number>;
  end_time?: string;
}

export interface FacebookInsightMetric {
  name: string;
  period: string;
  values: FacebookInsightValue[];
  title: string;
  description: string;
  id: string;
}

export interface FacebookInsightsResponse {
  data: FacebookInsightMetric[];
}

export const uploadFacebookPost = (payload: CreateFacebookPostPayload) =>
  api.post<FacebookPost>('/posts/facebook/upload', payload);

export const getFacebookPosts = () =>
  api.get<FacebookPost[]>('/posts/facebook');

export const getFacebookPostById = (id: string) =>
  api.get<FacebookPost>(`/posts/facebook/${id}`);

export const repostFacebookPost = (id: string, payload: CreateFacebookPostPayload) =>
  api.post<FacebookPost>(`/posts/facebook/${id}/repost`, payload);

export const getFacebookPostInsights = (id: string) =>
  api.get<FacebookInsightsResponse>(`/posts/facebook/${id}/insights`);

