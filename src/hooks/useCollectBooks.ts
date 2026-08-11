import { useQuery } from '@tanstack/react-query';
import { getCollectBooks } from '../api/collectBook';

/** 콜렉트북 목록(내 책장) 조회 */
export const useCollectBooks = () => {
  return useQuery({
    queryKey: ['collectBooks'],
    queryFn: getCollectBooks,
  });
};