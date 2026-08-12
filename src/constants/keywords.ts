/**
 * ⚠️ 감성 키워드 목록 API가 아직 없어서 상수로 둡니다.
 *    keywordId 는 반드시 백엔드 DB 값과 맞춰야 해요. (지금은 임시값)
 *    `GET /keywords` 같은 API가 생기면 이 배열을 그 응답으로 갈아끼우세요.
 */
export interface EmotionKeyword {
  keywordId: number;
  name: string;
}

export const EMOTION_KEYWORDS: EmotionKeyword[] = [
  { keywordId: 10, name: '도전' },
  { keywordId: 11, name: '성취' },
  { keywordId: 12, name: '관계' },
  { keywordId: 13, name: '일상' },
  { keywordId: 14, name: '여행' },
];