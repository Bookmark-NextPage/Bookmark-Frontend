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