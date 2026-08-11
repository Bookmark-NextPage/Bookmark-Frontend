import client from './client';
import type {
  CollectBookDetail,
  ChapterRecordSummary,
  RecordDetail,
  RecordComment,
} from '../types/collectBook';

/** 콜렉트북 상세 조회 (챕터 목록 포함) */
export const getCollectBook = async (collectBookId: number) => {
  const { data } = await client.get<CollectBookDetail>(`/collect-books/${collectBookId}`);
  return data;
};

/**
 * 챕터 안 기록 목록 조회
 * ⚠️ 백엔드 추가 예정 API입니다. 경로/응답이 확정되면 여기만 수정하면 돼요.
 * (현재 가정: GET /collect-books/{collectBookId}/chapters/{chapterId}/records)
 */
export const getChapterRecords = async (collectBookId: number, chapterId: number) => {
  const { data } = await client.get<ChapterRecordSummary[]>(
    `/collect-books/${collectBookId}/chapters/${chapterId}/records`,
  );
  return data;
};

/** 기록 상세 조회 */
export const getRecord = async (collectBookId: number, recordId: number) => {
  const { data } = await client.get<RecordDetail>(
    `/collect-books/${collectBookId}/records/${recordId}`,
  );
  return data;
};

/** 좋아요 등록 */
export const likeRecord = async (collectBookId: number, recordId: number) => {
  await client.post(`/collect-books/${collectBookId}/records/${recordId}/likes`);
};

/** 좋아요 삭제 */
export const unlikeRecord = async (collectBookId: number, recordId: number) => {
  await client.delete(`/collect-books/${collectBookId}/records/${recordId}/likes`);
};

/** 댓글 작성 */
export const addComment = async (
  collectBookId: number,
  recordId: number,
  content: string,
) => {
  const { data } = await client.post<RecordComment>(
    `/collect-books/${collectBookId}/records/${recordId}/comments`,
    { content },
  );
  return data;
};