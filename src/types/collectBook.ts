// 백엔드 응답 구조를 반영한 타입들 (콜렉트북 조회/리더 파트).
// 기록 "생성" 관련 타입은 types/record.ts (팀원 담당)에 있습니다.

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

export interface PublicCollectBook {
  collectBookId: number;
  year: number;
  title: string;
  bookColor: BookColor;
}

/** 콜렉트북 목록 항목 - GET /collect-books */
export interface CollectBookListItem {
  collectBookId: number;
  title: string;
  year: number;
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

/** 챕터 (안에 기록 요약 목록 포함) */
export interface Chapter {
  chapterId: number;
  sequence: number;
  name: string;
  recordCount: number;
  records: RecordSummary[];
}

/** 챕터 안 기록 요약 (상세 응답에 포함) */
export interface RecordSummary {
  recordId: number;
  title: string;
  content: string;
  imageUrl: string | null;
  keywords: string[];
}

/** 기록 상세 조회 - GET /records/{recordId} */
export interface RecordDetail {
  recordId: number;
  collectBookId: number;
  chapterId: number;
  chapterName: string;
  recordCreatedAt: string; // ISO LocalDateTime
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
  createdAt: string;
}

/** 콜렉트북 생성 요청 - POST /collect-books
 *  주의: 표지색 필드명이 coverColor (상세조회의 bookColor와 다름) */
export interface CollectBookCreateRequest {
  title: string; // 최대 10자
  coverColor: BookColor;
  year: number;
  visibility: Visibility; // 기본 PUBLIC
  chapterType: ChapterType;
  chapters: { name: string }[]; // MONTHLY: 12개, CUSTOM: 1~20개
}

/** 콜렉트북 생성 응답 */
export interface CollectBookCreateResponse {
  collectBookId: number;
  title: string;
  year: number;
  bookColor: BookColor;
}