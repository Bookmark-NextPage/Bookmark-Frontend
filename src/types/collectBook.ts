// 백엔드 Swagger 응답 구조를 그대로 반영한 타입들입니다.
// API 응답이 바뀌면 이 파일을 먼저 수정하세요.

/** 콜렉트북 표지 색상 (백엔드 enum) */
export type BookColor = 'PINK' | 'GREEN' | 'BLUE' | 'YELLOW' | 'PURPLE';

/** 공개 범위 */
export type Visibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

/** 챕터 구성 방식 */
export type ChapterType = 'MONTHLY' | 'CUSTOM';

/** 친구 페이지 조회 - GET /friends/{friendUserId}/page */
export interface FriendPageResponse {
  userId: number;
  name: string;
  loginId: string;
  bio: string | null;
  profileImageUrl: string | null;
  publicCollectBooks: PublicCollectBook[];
}

/** 친구 페이지에 노출되는 공개 콜렉트북 요약 */
export interface PublicCollectBook {
  collectBookId: number;
  year: number;
  title: string;
  bookColor: BookColor;
}

/** 콜렉트북 상세 조회 - GET /collect-books/{collectBookId} */
export interface CollectBookDetail {
  collectBookId: number;
  title: string;
  bookColor: BookColor;
  year: number;
  visibility: Visibility;
  chapterType: ChapterType;
  chapters: Chapter[];
}

/** 챕터 (기록 개수만 제공, 기록 목록은 별도 조회) */
export interface Chapter {
  chapterId: number;
  sequence: number;
  name: string;
  recordCount: number;
}

/**
 * 챕터 안 기록 목록 - GET /collect-books/{collectBookId}/chapters/{chapterId}/records
 * ⚠️ 이 API는 백엔드에서 추가 예정
 */
export interface ChapterRecordSummary {
  recordId: number;
  title: string;
  summary?: string; // 미리보기용 한 줄 (백엔드 확정 후 조정)
  recordCreatedAt?: string;
  keywords?: string[];
}

/** 기록 상세 조회 - GET /collect-books/{collectBookId}/records/{recordId} */
export interface RecordDetail {
  recordId: number;
  collectBookId: number;
  chapterId: number;
  chapterName: string;
  recordCreatedAt: string; // 'YYYY.MM.DD'
  title: string;
  content: string;
  keywords: string[];
  imageUrls: string[];
  aiImageUrl: string | null;
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  comments: RecordComment[];
}

/** 기록 댓글 */
export interface RecordComment {
  commentId: number;
  userId: number;
  nickname: string;
  content: string;
  createdAt: string; // ISO 8601
}

/** 콜렉트북 목록 항목 - GET /collect-books */
export interface CollectBookListItem {
  collectBookId: number;
  title: string;
  year: number;
  bookColor: BookColor;
}