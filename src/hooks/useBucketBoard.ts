import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBucketBoard,
  getCategories,
  createCategory,
  getBoardThemes,
  selectBoardTheme,
  createMemo,
  updateMemo,
  moveMemo,
  completeMemo,
  deleteMemo,
} from '../api/bucket';
import type { BucketBoardResponse, UpdateMemoRequest } from '../types/bucket';

export const BUCKET_BOARD_KEY = ['bucketBoard'] as const;
export const CATEGORY_KEY = ['bucketCategories'] as const;
export const THEME_KEY = ['boardThemes'] as const;

/**
 * 버킷보드 전체 조회.
 * 태그 필터는 화면에서 클라이언트 필터링으로 처리합니다.
 * (메모지가 많아져 서버 필터가 필요해지면 queryKey에 categoryId를 넣고
 *  getBucketBoard(categoryId)로 바꾸면 돼요.)
 */
export const useBucketBoard = () =>
  useQuery({
    queryKey: BUCKET_BOARD_KEY,
    queryFn: () => getBucketBoard(),
  });

/** 태그 목록 */
export const useCategories = () =>
  useQuery({
    queryKey: CATEGORY_KEY,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

/** 태그 추가 */
export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORY_KEY }),
  });
};

/** 테마 목록. 이미지 URL은 잘 안 바뀌니 오래 들고 있습니다. */
export const useBoardThemes = () =>
  useQuery({
    queryKey: THEME_KEY,
    queryFn: getBoardThemes,
    staleTime: 1000 * 60 * 30,
  });

/** 보드 테마 선택 */
export const useSelectBoardTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: selectBoardTheme,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUCKET_BOARD_KEY });
      qc.invalidateQueries({ queryKey: THEME_KEY });
    },
  });
};

/** 메모지 추가 */
export const useCreateMemo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMemo,
    onSuccess: () => qc.invalidateQueries({ queryKey: BUCKET_BOARD_KEY }),
  });
};

/** 메모지 수정 */
export const useUpdateMemo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memoId, body }: { memoId: number; body: UpdateMemoRequest }) =>
      updateMemo(memoId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUCKET_BOARD_KEY }),
  });
};

/** 메모지 이동 — 화면은 즉시 반영하고, 실패하면 원래 자리로 되돌립니다. */
export const useMoveMemo = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: moveMemo,
    onMutate: async ({ memoId, xPos, yPos }) => {
      await qc.cancelQueries({ queryKey: BUCKET_BOARD_KEY });
      const prev = qc.getQueryData<BucketBoardResponse>(BUCKET_BOARD_KEY);

      // 조회 응답은 posX/posY, 이동 요청은 xPos/yPos 라서 여기서 맞춰줍니다.
      qc.setQueryData<BucketBoardResponse>(BUCKET_BOARD_KEY, (old) =>
        old
          ? {
              ...old,
              memos: old.memos.map((m) =>
                m.memoId === memoId ? { ...m, posX: xPos, posY: yPos } : m,
              ),
            }
          : old,
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(BUCKET_BOARD_KEY, ctx.prev);
    },
    // 드래그 직후 refetch로 메모지가 튀는 걸 막으려고 invalidate는 하지 않습니다.
  });
};

/** 버킷 완료 */
export const useCompleteMemo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeMemo,
    onSuccess: () => qc.invalidateQueries({ queryKey: BUCKET_BOARD_KEY }),
  });
};

/** 메모지 삭제 */
export const useDeleteMemo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMemo,
    onSuccess: () => qc.invalidateQueries({ queryKey: BUCKET_BOARD_KEY }),
  });
};