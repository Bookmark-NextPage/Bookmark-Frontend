import client from './client';
import type { FriendPageResponse } from '../types/collectBook';

/** 친구 페이지 조회 (프로필 + 공개 콜렉트북) */
export const getFriendPage = async (friendUserId: number) => {
  const { data } = await client.get<FriendPageResponse>(`/friends/${friendUserId}/page`);
  return data;
};

/** 친구 삭제 */
export const deleteFriend = async (friendUserId: number) => {
  await client.delete(`/friends/${friendUserId}`);
};

export interface FriendSearchResult {
  userId: number;
  name: string;
  loginId: string;
  profileImageUrl: string | null;
}

export const searchUsers = async (name: string) => {
  const { data } = await client.get<FriendSearchResult[]>('/friends/search', {
    params: { name },
  });
  return data;
};

export const addFriend = async (friendUserId: number) => {
  const { data } = await client.post<FriendSearchResult>('/friends', { friendUserId });
  return data;
};

export const getFriends = async () => {
  const { data } = await client.get<FriendSearchResult[]>('/friends');
  return data;
};