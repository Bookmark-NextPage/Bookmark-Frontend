// 백엔드 Swagger 응답 구조를 그대로 반영한 타입들입니다.
// API 응답이 바뀌면 이 파일을 먼저 수정하세요.

/** 메모지 디자인 (테마마다 쓸 수 있는 메모지 종류가 다름) */
export interface MemoDesign {
  designId: number;
  memoImageUrl: string;

  contentLeft: number;
  contentTop: number;
  contentWidth: number;
  contentHeight: number;
}

/** 보드 테마 */
export interface BoardTheme {
  themeId: number;
  themeName: string;
  themeImageUrl: string; // S3 URL
  font: string;
  designs: MemoDesign[];
}

/**
 * 메모지 한 장.
 * ⚠️ 조회 응답은 posX / posY 인데 이동 요청 바디는 xPos / yPos 입니다.
 *    프론트는 posX / posY 로 통일하고 api/bucket.ts 에서 변환합니다.
 */
export interface BucketMemo {
  memoId: number;
  content: string;
  categoryId: number;
  categoryName: string;
  designId: number;
  posX: number;
  posY: number;
  updatedAt: string; // ISO 8601
}

/** GET /bucketBoard */
export interface BucketBoardResponse {
  theme: BoardTheme;
  memos: BucketMemo[];
}

/** GET /bucketBoard/getBoardThemes */
export interface BoardThemesResponse {
  selectedBoardThemeId: number;
  boardThemes: BoardTheme[];
}

/** GET /bucketBoard/getCategory */
export interface MemoCategory {
  categoryId: number;
  categoryName: string;
}

/* ---------- 요청 바디 ---------- */

/** POST /bucketBoard/createBucket — 위치는 백엔드가 정해줍니다 */
export interface CreateMemoRequest {
  content: string;
  categoryId: number;
  memoDesignId: number;
}

/** PATCH /bucketBoard/moveBucket/{bucketId} */
export interface MoveMemoRequest {
  memoId: number;
  xPos: number;
  yPos: number;
}

export interface MoveMemoResponse {
  bucketId: number;
  xPos: number;
  yPos: number;
}

/** PUT /bucketBoard/updateBucket/{bucketId} — 세 값 모두 필수입니다 */
export interface UpdateMemoRequest {
  content: string;
  categoryId: number;
  memoDesignId: number;
}