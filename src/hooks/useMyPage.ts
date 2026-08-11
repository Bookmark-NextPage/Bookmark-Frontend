import { useQuery } from '@tanstack/react-query';
import { getMyPage } from '../api/user';

/** 마이페이지 데이터 조회 (홈 화면에서도 재사용) */
export const useMyPage = () => {
  return useQuery({
    queryKey: ['myPage'],
    queryFn: getMyPage,
  });
};