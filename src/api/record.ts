import client from './client';
import type {
  EmotionKeyword,
  CreateRecordRequest,
  RecordCreated,
  ScrapImageRequest,
  ScrapImageResult,
} from '../types/record';

/**
 * ⚠️ client.ts 의 응답 인터셉터가 ApiResponse 래퍼({ isSuccess, result, ... })를
 *    이미 벗겨서 result 만 돌려줍니다. 그래서 여기서는 .data.result 를 쓰지 않고,
 *    호출 결과를 곧바로 결과 타입으로 단언합니다.
 *    인터셉터가 원래대로(response 그대로 반환) 바뀌면 이 파일 전체를
 *    `const { data } = await ...; return data.result;` 형태로 되돌리세요.
 */
const unwrap = async <T>(promise: Promise<unknown>): Promise<T> => {
  let v = (await promise) as Record<string, unknown>;
  // axios 응답 전체가 온 경우
  if (v && typeof v === 'object' && 'data' in v && 'status' in v) {
    v = v.data as Record<string, unknown>;
  }
  // ApiResponse 래퍼가 온 경우
  if (v && typeof v === 'object' && 'isSuccess' in v && 'result' in v) {
    return v.result as T;
  }
  return v as unknown as T;
};

/** 내 감성 키워드(태그) 목록 */
export const getKeywords = () => unwrap<EmotionKeyword[]>(client.get('/tags'));

/** 감성 키워드(태그) 생성. 사용자당 최대 10개까지 만들 수 있습니다. */
export const createKeyword = (name: string) =>
  unwrap<EmotionKeyword>(client.post('/tags', { name }));

/**
 * 기록용 이미지 업로드 (최대 5장)
 *
 * Content-Type 을 undefined 로 넘겨 axios 가 boundary 를 직접 붙이게 합니다.
 * client.ts 의 기본값(application/json)을 그대로 두면 Spring 이 파싱을 못 해요.
 */
export const uploadImages = (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  return unwrap<string[]>(
    client.post('/images/upload', form, { headers: { 'Content-Type': undefined } }),
  );
};

/**
 * 메모지 기반 기록 생성.
 * 버킷보드에서 '이뤘어요'로 넘어온 경우. 작성일 기준 월별 챕터로 자동 분류됩니다.
 */
export const createRecordFromMemo = (
  bucketBoardMemoId: number,
  body: CreateRecordRequest,
) =>
  unwrap<RecordCreated>(
    client.post(`/collect-books/memos/${bucketBoardMemoId}/records`, body),
  );

/** 챕터 지정 기록 생성. 버킷과 무관하게 새로 쓸 때. */
export const createRecordInChapter = (chapterId: number, body: CreateRecordRequest) =>
  unwrap<RecordCreated>(client.post(`/collect-books/chapters/${chapterId}/records`, body));

/** AI 감성 스크랩북 이미지 생성 / 재생성 (aiUse = true 전용) */
export const generateScrapImage = async (body: ScrapImageRequest) => {
  const result = await unwrap<ScrapImageResult>(client.post('/ai/scrap-image', body));
  return result.tempImageUrl;
};

/**
 * 생성한 AI 이미지를 기록에 최종 저장 (aiUse = true 전용)
 * ⚠️ 요청 바디 스키마를 Swagger에서 확인하지 못했습니다.
 *    백엔드가 { tempImageUrl } 을 받는다면 아래 키 이름만 바꿔주세요.
 */
export const saveAiImage = (recordId: number, aiImageUrl: string) =>
  unwrap<RecordCreated>(client.patch(`/records/${recordId}/ai-image/save`, { aiImageUrl }));

/** 저장 위치 선택용 콜렉트북 목록 (조회 파트와 별개로 기록 생성에서만 씁니다) */
export const getCollectBookOptions = () =>
  unwrap<{ collectBookId: number; title: string; year: number }[]>(
    client.get('/collect-books'),
  );

/** 저장 위치 선택용 챕터 목록 */
export const getChapterOptions = async (collectBookId: number) => {
  const book = await unwrap<{ chapters?: { chapterId: number; name: string }[] }>(
    client.get(`/collect-books/${collectBookId}`),
  );
  return book.chapters ?? [];
};