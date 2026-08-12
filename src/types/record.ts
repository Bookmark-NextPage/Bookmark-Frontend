/** 이 그룹의 API들은 공통 래퍼로 감싸서 응답합니다. (bucketBoard 쪽은 raw 라 다릅니다) */
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
  timestamp: string;
}

/** GET /tags — 사용자가 만든 감성 키워드 */
export interface EmotionKeyword {
  keywordId: number;
  name: string;
}

/** 기록 생성 요청 바디 */
export interface CreateRecordRequest {
  /** 챕터 지정 저장일 때만 */
  chapterId?: number;
  /** 버킷보드에서 넘어온 경우의 메모지 id */
  bucketBoardMemoId?: number;
  title: string;
  content: string;
  /** aiUse=false 는 안 씁니다. true 는 생성 후 별도 PATCH 로 붙여요. */
  aiImageUrl?: string;
  keywordIds: number[];
  imageUrls: string[];
}

export interface RecordCreated {
  recordId: number;
  chapterId: number;
  memoId: number | null;
  title: string;
  content: string;
  imageUrls: string[];
  keywordIds: number[];
  /** AI 이미지를 붙이기 전에는 초안 상태입니다 */
  isDraft: boolean;
  createdAt: string;
}

/** POST /ai/scrap-image 요청 바디 */
export interface ScrapImageRequest {
  title: string;
  content: string;
  imageUrls: string[];
  keywordIds: number[];
  /** '색감을 더 화사하게' 같은 재생성 요청. 첫 생성 때는 비워둡니다. */
  feedback?: string;
}

export interface ScrapImageResult {
  tempImageUrl: string;
}