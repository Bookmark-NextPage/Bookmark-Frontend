import type { BookColor, Visibility } from '../types/collectBook';

// 백엔드 bookColor enum → 책등 그라디언트.
// 기존 목업(socialData)의 grad 값들을 색상별로 옮겨왔어요.
const BOOK_GRADIENTS: Record<BookColor, string> = {
  PINK: 'linear-gradient(180deg,#E39AA6,#C1637C)',
  GREEN: 'linear-gradient(180deg,#B3C79E,#8FA37E)',
  BLUE: 'linear-gradient(180deg,#AFD0DA,#8FB6C6)',
  YELLOW: 'linear-gradient(180deg,#F5E6C8,#E3C79A)',
  PURPLE: 'linear-gradient(180deg,#C79AB3,#9E6C87)',
};

/** bookColor enum을 책등 배경 그라디언트로 변환 */
export function bookGradient(color: BookColor): string {
  return BOOK_GRADIENTS[color] ?? BOOK_GRADIENTS.GREEN;
}

// 공개 범위 enum → 한글 라벨
const VISIBILITY_LABELS: Record<Visibility, string> = {
  PUBLIC: '전체공개',
  FRIENDS: '친구공개',
  PRIVATE: '비공개',
};

/** visibility enum을 한글 라벨로 변환 */
export function visibilityLabel(v: Visibility): string {
  return VISIBILITY_LABELS[v] ?? v;
}