import client from './client';
import type {
  CollectBookCreateRequest,
  CollectBookCreateResponse,
  CollectBookDetail,
  CollectBookListItem,
  RecordDetail,
  Visibility,
} from '../types/collectBook';

// client.ts 의 응답 인터셉터가 ApiResponse({isSuccess, result})를 이미 벗겨서
// result 만 res.data 로 돌려줍니다. (팀원 record.ts 의 unwrap 과 동일한 전제)

/** 콜렉트북 목록 조회 (내 책장) */
export const getCollectBooks = async () => {
  const { data } = await client.get<CollectBookListItem[]>('/collect-books');
  return data;
};

/** 콜렉트북 생성 */
export const createCollectBook = async (body: CollectBookCreateRequest) => {
  const { data } = await client.post<CollectBookCreateResponse>('/collect-books', body);
  return data;
};

/** 콜렉트북 상세 조회 (챕터 + 각 챕터의 기록 요약 포함) */
export const getCollectBook = async (collectBookId: number) => {
  const { data } = await client.get<CollectBookDetail>(`/collect-books/${collectBookId}`);
  return data;
};

/** 콜렉트북 삭제 */
export const deleteCollectBook = async (collectBookId: number) => {
  await client.delete(`/collect-books/${collectBookId}`);
};

/** 콜렉트북 공개 범위 수정 */
export const updateVisibility = async (collectBookId: number, visibility: Visibility) => {
  await client.patch(`/collect-books/${collectBookId}/visibility`, { visibility });
};

// ---- 기록 조회/리더 (팀원 record.ts는 "생성" 담당이라 여기 조회 함수를 둡니다) ----

/** 기록 상세 조회 - GET /records/{recordId} */
export const getRecordDetail = async (recordId: number) => {
  const { data } = await client.get<RecordDetail>(`/records/${recordId}`);
  return data;
};

/** 좋아요 등록 */
export const likeRecord = async (recordId: number) => {
  await client.post(`/records/${recordId}/likes`);
};

/** 좋아요 삭제 */
export const unlikeRecord = async (recordId: number) => {
  await client.delete(`/records/${recordId}/likes`);
};

/** 댓글 작성 */
export const addRecordComment = async (recordId: number, content: string) => {
  await client.post(`/records/${recordId}/comments`, { content });
};