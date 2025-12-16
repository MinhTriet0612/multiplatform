import api from './api';

export interface CreateInstagramPostPayload {
  content: string;
  mediaUrls: string[];
  mediaType?: 'CAROUSEL' | 'REELS' | 'STORIES';
  groupId?: string;
  coverUrl?: string;
  shareToFeed?: boolean;
  locationId?: string;
}

export interface InstagramPost {
  id: string;
  content: string;
  mediaUrls: string[];
  mediaType: string;
  status: string;
  groupId?: string;
  externalId?: string;
  containerId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramInsightValue {
  value: number;
  end_time?: string;
}

export interface InstagramInsightMetric {
  name: string;
  period: string;
  values: InstagramInsightValue[];
  title: string;
  description: string;
  id: string;
}

export interface InstagramInsightsResponse {
  data: InstagramInsightMetric[];
}

export const uploadInstagramPost = (payload: CreateInstagramPostPayload) =>
  api.post<InstagramPost>('/posts/instagram/upload', payload);

export const getInstagramPosts = () =>
  api.get<InstagramPost[]>('/posts/instagram');

export const getInstagramPostById = (id: string) =>
  api.get<InstagramPost>(`/posts/instagram/${id}`);

export const repostInstagramPost = (id: string, payload: CreateInstagramPostPayload) =>
  api.post<InstagramPost>(`/posts/instagram/${id}/repost`, payload);

export const getInstagramPostInsights = (id: string) =>
  api.get<InstagramInsightsResponse>(`/posts/instagram/${id}/insights`);

