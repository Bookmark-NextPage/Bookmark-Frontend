import client from './client';
import type { MyPageResponse } from '../types/user';

/** 로그인 응답 (accessToken 포함) */
export interface LoginResponse {
  accessToken: string;
}

/** 로그인 */
export const login = async (identifier: string, password: string) => {
  const { data } = await client.post<LoginResponse>('/user/login', {
    identifier,
    password,
  });
  return data;
};

/** 회원가입 */
export const signup = async (payload: {
  loginId: string;
  password: string;
  passwordConfirm: string;
  name: string;
  email: string;
}) => {
  const { data } = await client.post('/user/signup', payload);
  return data;
};

/** 마이페이지 조회 (홈에서도 재사용) */
export const getMyPage = async () => {
  const { data } = await client.get<MyPageResponse>('/user/me/mypage');
  return data;
};

/** 프로필 편집 */
export const updateProfile = async (payload: { name: string; bio: string }) => {
  const { data } = await client.patch('/user/me/profile', payload);
  return data;
};