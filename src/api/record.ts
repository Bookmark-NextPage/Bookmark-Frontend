import client from './client';
import type {
  ApiResponse,
  EmotionKeyword,
  CreateRecordRequest,
  RecordCreated,
  ScrapImageRequest,
  ScrapImageResult,
} from '../types/record';

/** 내 감성 키워드(태그) 목록 */
export const getKeywords = async () => {
  const { data } = await client.get<ApiResponse<EmotionKeyword[]>>('/tags');
  return data.result;
};

/**
 * 기록용 이미지 업로드 (최대 5장)
 *
 * Content-Type 을 undefined 로 넘겨 axios 가 boundary 를 직접 붙이게 합니다.
 * client.ts 의 기본값(application/json)을 그대로 두면 Spring 이 파싱을 못 해요.
 */
export const uploadImages = async (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const { data } = await client.post<ApiResponse<string[]>>('/images/upload', form, {
    headers: { 'Content-Type': undefined },
  });
  return data.result;
};

/**
 * 메모지 기반 기록 생성.
 * 버킷보드에서 '이뤘어요'로 넘어온 경우. 작성일 기준 월별 챕터로 자동 분류됩니다.
 */
export const createRecordFromMemo = async (
  bucketBoardMemoId: number,
  body: CreateRecordRequest,
) => {
  const { data } = await client.post<ApiResponse<RecordCreated>>(
    `/collect-books/memos/${bucketBoardMemoId}/records`,
    body,
  );
  return data.result;
};

/** 챕터 지정 기록 생성. 버킷과 무관하게 새로 쓸 때. */
export const createRecordInChapter = async (
  chapterId: number,
  body: CreateRecordRequest,
) => {
  const { data } = await client.post<ApiResponse<RecordCreated>>(
    `/collect-books/chapters/${chapterId}/records`,
    body,
  );
  return data.result;
};

/** AI 감성 스크랩북 이미지 생성 / 재생성 (aiUse = true 전용) */
export const generateScrapImage = async (body: ScrapImageRequest) => {
  const { data } = await client.post<ApiResponse<ScrapImageResult>>('/ai/scrap-image', body);
  return data.result.tempImageUrl;
};

/**
 * 생성한 AI 이미지를 기록에 최종 저장 (aiUse = true 전용)
 * ⚠️ 요청 바디 스키마를 Swagger에서 확인하지 못했습니다.
 *    지금은 { aiImageUrl } 로 보내고 있으니, 백엔드가 { tempImageUrl } 을 받는다면
 *    아래 키 이름만 바꿔주세요.
 */
export const saveAiImage = async (recordId: number, aiImageUrl: string) => {
  const { data } = await client.patch<ApiResponse<RecordCreated>>(
    `/records/${recordId}/ai-image/save`,
    { aiImageUrl },
  );
  return data.result;
};

export const createKeyword = async (name: string) => {
  const { data } = await client.post<ApiResponse<EmotionKeyword>>('/tags', { name });
  return data.result;
};