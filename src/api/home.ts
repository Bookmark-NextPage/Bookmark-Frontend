import client from './client';
import type { HomeResponse } from '../types/home';

/** 홈 데이터 조회 */
export const getHome = async () => {
  const { data } = await client.get<HomeResponse>('/home');
  return data;
};