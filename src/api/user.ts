import client from './client';
import type { MyPageResponse } from '../types/user';

/** 로그인 */
export const login = async (loginId: string, password: string) => {
  const { data } = await client.post('/user/login', { loginId, password });
  return data;
};

/** 회원가입 */
export const signup = async (payload: {
  loginId: string;
  password: string;
  name: string;
}) => {
  const { data } = await client.post('/user/signup', payload);
  return data;
};

/** 마이페이지 조회 */
export const getMyPage = async () => {
  const { data } = await client.get<MyPageResponse>('/user/me/mypage');
  return data;
};

/** 프로필 편집 */
export const updateProfile = async (payload: { name: string; bio: string }) => {
  const { data } = await client.patch('/user/me/profile', payload);
  return data;
};