import client from './client';
import type {
  BucketBoardResponse,
  BoardThemesResponse,
  MemoCategory,
  CreateMemoRequest,
  UpdateMemoRequest,
  MoveMemoRequest,
  MoveMemoResponse,
  BucketMemo,
} from '../types/bucket';

// VITE_API_BASE_URL 이 이미 `/api` 로 끝나므로 여기서는 `/api` 를 붙이지 않습니다.
//
// ⚠️ 공통 주의: bucketBoard의 상세 API들은 Swagger에서 경로가 `/xxx/{bucketId}` 인데
//    파라미터 위치는 query로 표시돼 있습니다. (백엔드가 @PathVariable 대신 @RequestParam 사용)
//    어느 쪽이든 통하도록 경로와 쿼리에 모두 실어 보냅니다.
//    백엔드에서 확정되면 아래 헬퍼 한 곳만 고치면 됩니다.
const bucketParams = (bucketId: number) => ({ params: { bucketId } });

/** 버킷보드 조회 (테마 + 메모지 전체) */
export const getBucketBoard = async (categoryId?: number) => {
  const { data } = await client.get<BucketBoardResponse>('/bucketBoard', {
    params: categoryId ? { categoryId } : undefined,
  });
  return data;
};

/** 태그(카테고리) 목록 */
export const getCategories = async () => {
  const { data } = await client.get<MemoCategory[]>('/bucketBoard/getCategory');
  return data;
};

/** 태그 추가 */
export const createCategory = async (categoryName: string) => {
  const { data } = await client.post<MemoCategory>('/bucketBoard/createCategory', {
    categoryName,
  });
  return data;
};

/** 보드 테마 목록 + 현재 선택된 테마 id */
export const getBoardThemes = async () => {
  const { data } = await client.get<BoardThemesResponse>('/bucketBoard/getBoardThemes');
  return data;
};

/** 보드 테마 선택 */
export const selectBoardTheme = async (boardThemeId: number) => {
  await client.patch(`/bucketBoard/selectBoardThemes/${boardThemeId}`, null, {
    params: { boardThemeId },
  });
};

/** 메모지 작성. 보드 위 위치는 백엔드가 정해서 내려줍니다. */
export const createMemo = async (body: CreateMemoRequest) => {
  const { data } = await client.post<BucketMemo>('/bucketBoard/createBucket', body);
  return data;
};

/** 메모지 수정 (내용 / 태그 / 디자인) */
export const updateMemo = async (memoId: number, body: UpdateMemoRequest) => {
  const { data } = await client.put<BucketMemo>(
    `/bucketBoard/updateBucket/${memoId}`,
    body,
    bucketParams(memoId),
  );
  return data;
};

/** 메모지 위치 이동 */
export const moveMemo = async ({ memoId, xPos, yPos }: MoveMemoRequest) => {
  const { data } = await client.patch<MoveMemoResponse>(
    `/bucketBoard/moveBucket/${memoId}`,
    { xPos, yPos },
    bucketParams(memoId),
  );
  return data;
};

/** 버킷 완료 처리 */
export const completeMemo = async (memoId: number) => {
  await client.patch(`/bucketBoard/completeBucket/${memoId}`, null, bucketParams(memoId));
};

/** 메모지 삭제 */
export const deleteMemo = async (memoId: number) => {
  await client.delete(`/bucketBoard/deleteBucket/${memoId}`, bucketParams(memoId));
};