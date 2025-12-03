import api from './api';

export interface Group {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    facebookPosts: number;
    instagramPosts: number;
    tiktokPosts: number;
  };
}

export interface GroupWithPosts extends Group {
  facebookPosts: any[];
  instagramPosts: any[];
  tiktokPosts: any[];
}

export interface CreateGroupPayload {
  name: string;
}

export const getGroups = () => api.get<Group[]>('/groups');

export const getGroup = (id: string) => api.get<GroupWithPosts>(`/groups/${id}`);

export const createGroup = (payload: CreateGroupPayload) =>
  api.post<Group>('/groups', payload);

export const updateGroup = (id: string, payload: Partial<CreateGroupPayload>) =>
  api.patch<Group>(`/groups/${id}`, payload);

export const deleteGroup = (id: string) => api.delete(`/groups/${id}`);

