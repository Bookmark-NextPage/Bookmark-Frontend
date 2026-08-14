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

/** 로그아웃 (서버 알림 후 클라이언트가 토큰 삭제) */
export const logoutApi = async () => {
  await client.post('/user/logout');
};

/** 회원 탈퇴 (비밀번호 재확인 필요) */
export const withdrawUser = async (password: string) => {
  await client.delete('/user/me', { data: { password } });
};

/** AI 기능 ON/OFF 변경
 *  ⚠️ 백엔드 엔드포인트 경로 확인 필요 (예: PATCH /user/me/ai-use) */
export const updateAiUse = async (aiUse: boolean) => {
  const { data } = await client.patch('/user/me/ai-use', { aiUse });
  return data;
};