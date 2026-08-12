import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getKeywords,
  uploadImages,
  generateScrapImage,
  saveAiImage,
  createRecordFromMemo,
  createRecordInChapter,
  createKeyword,
} from '../api/record';
import { getCollectBooks, getCollectBook } from '../api/collectBook';
import { useMyPage } from './useMyPage';
import type { CreateRecordRequest } from '../types/record';

/**
 * AI 기능 사용 여부.
 * ⚠️ 마이페이지 응답 어디에 aiUse 가 들어오는지 확정되지 않아 두 위치를 모두 봅니다.
 *    확인되면 한쪽만 남기세요. 값이 없으면 안전하게 false(잠금)로 봅니다.
 */
export const useAiUse = () => {
  const { data, isLoading } = useMyPage();
  const raw = data as unknown as
    | { aiUse?: boolean; profile?: { aiUse?: boolean } }
    | undefined;
  return {
    aiUse: raw?.aiUse ?? raw?.profile?.aiUse ?? false,
    isLoading,
  };
};

/** 감성 키워드 목록. 자주 안 바뀌니 오래 들고 있습니다. */
export const useKeywords = () =>
  useQuery({
    queryKey: ['keywords'],
    queryFn: getKeywords,
    staleTime: 1000 * 60 * 10,
  });

/** 기록 이미지 업로드 */
export const useUploadImages = () => useMutation({ mutationFn: uploadImages });

/** AI 스크랩북 이미지 생성 / 재생성 */
export const useGenerateScrapImage = () => useMutation({ mutationFn: generateScrapImage });

/** AI 이미지 최종 저장 */
export const useSaveAiImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, aiImageUrl }: { recordId: number; aiImageUrl: string }) =>
      saveAiImage(recordId, aiImageUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collectBooks'] });
      qc.invalidateQueries({ queryKey: ['bucketBoard'] });
    },
  });
};

/** 콜렉트북 목록 (저장 위치 선택용) */
export const useCollectBookList = () =>
  useQuery({ queryKey: ['collectBooks'], queryFn: getCollectBooks });

/** 선택한 콜렉트북의 챕터 목록 */
export const useCollectBookChapters = (collectBookId?: number) =>
  useQuery({
    queryKey: ['collectBook', collectBookId],
    queryFn: () => getCollectBook(collectBookId!),
    enabled: !!collectBookId,
  });

/** 기록 생성. 메모지 기반이면 memoId, 아니면 chapterId 로 갑니다. */
export const useCreateRecord = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (args: {
      memoId?: number;
      chapterId?: number;
      body: CreateRecordRequest;
    }) => {
      if (args.memoId) return createRecordFromMemo(args.memoId, args.body);
      if (args.chapterId) return createRecordInChapter(args.chapterId, args.body);
      return Promise.reject(new Error('저장 위치가 정해지지 않았어요.'));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collectBooks'] });
      qc.invalidateQueries({ queryKey: ['bucketBoard'] });
    },
  });
};

export const MAX_KEYWORDS = 10;

/** 감성 키워드 생성 */
export const useCreateKeyword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createKeyword,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keywords'] }),
  });
};