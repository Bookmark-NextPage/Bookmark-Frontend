import { useQuery } from '@tanstack/react-query';
import { getHome } from '../api/home';

/** 홈 데이터 조회 */
export const useHome = () => {
  return useQuery({
    queryKey: ['home'],
    queryFn: getHome,
  });
};