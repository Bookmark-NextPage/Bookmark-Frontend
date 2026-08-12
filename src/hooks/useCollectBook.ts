import { useQuery } from '@tanstack/react-query';
import { getCollectBook, getRecordDetail } from '../api/collectBook';

/** 콜렉트북 상세 조회 (챕터 + 기록 요약) */
export const useCollectBook = (collectBookId: number) => {
  return useQuery({
    queryKey: ['collectBook', collectBookId],
    queryFn: () => getCollectBook(collectBookId),
    enabled: !Number.isNaN(collectBookId),
  });
};

/** 기록 상세 조회 (리더 화면용) */
export const useRecordDetail = (recordId: number) => {
  return useQuery({
    queryKey: ['recordDetail', recordId],
    queryFn: () => getRecordDetail(recordId),
    enabled: !Number.isNaN(recordId),
  });
};