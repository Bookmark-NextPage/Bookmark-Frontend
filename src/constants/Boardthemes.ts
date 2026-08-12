import type { BoardTheme } from '../types/bucket';

/**
 * 테마 이미지(보드 배경 / 메모지)는 전부 S3 URL로 내려옵니다.
 * 여기 있는 값들은 "이미지가 아직 안 떴거나 실패했을 때" 대신 깔아둘 색과,
 * 이미지 자체로는 알 수 없는 정보(글씨색, 배경을 반복할지 채울지)입니다.
 *
 * 이상적으로는 백엔드 theme 응답에 textColor / backgroundFit 이 들어오는 게 맞아요.
 * 그때는 THEME_STYLE 대신 응답값을 쓰도록 getThemeStyle만 고치면 됩니다.
 */
export interface ThemeStyle {
  /**
   * - 'tile' : 이미지를 원본 크기로 반복. 종이 질감처럼 이어지는 텍스처용.
   * - 'cover': 화면을 꽉 채우고 스크롤해도 배경은 제자리. 풍경 사진용.
   *            보드가 5000px가 돼도 사진이 늘어나거나 뭉개지지 않습니다.
   */
  bgFit: 'tile' | 'cover';
  /** 메모지 위 글씨색 */
  ink: string;
  /** 배경 이미지 로딩 전/실패 시 색 */
  fallbackBg: string;
  /** 메모지 이미지 로딩 전/실패 시 색 */
  memoFallback: string[];
}

export const DEFAULT_THEME_STYLE: ThemeStyle = {
  bgFit: 'tile',
  ink: '#5e1a09',
  fallbackBg: '#efe6d6',
  memoFallback: ['#f7f0e1', '#efe6d2', '#f1e4e4', '#e8ecdf', '#f5e9d8'],
};

export const THEME_STYLE: Record<number, ThemeStyle> = {
  1: DEFAULT_THEME_STYLE, // 종이·크림
  2: {
    bgFit: 'cover',
    ink: '#173a52',
    fallbackBg: '#dde7ee',
    memoFallback: ['#f2f7fa', '#e3eef5', '#dbe9f2', '#e9f1f0', '#f0f5f8'],
  }, // 바다
  3: {
    bgFit: 'cover',
    ink: '#26361f',
    fallbackBg: '#dfe6d6',
    memoFallback: ['#f4f7ee', '#e8efdd', '#eef3e4', '#e3ecdb', '#f1f4ea'],
  }, // 숲
  4: {
    bgFit: 'cover',
    ink: '#5a2a17',
    fallbackBg: '#eddccd',
    memoFallback: ['#fbf1e6', '#f7e7d6', '#f6ded0', '#fae9dd', '#f3e2d3'],
  }, // 노을
  5: {
    bgFit: 'cover',
    ink: '#eceaf5',
    fallbackBg: '#2b2c40',
    memoFallback: ['#3b3d55', '#454763', '#3f4a5e', '#4b4159', '#39415a'],
  }, // 밤
};

export const getThemeStyle = (themeId?: number): ThemeStyle =>
  (themeId != null && THEME_STYLE[themeId]) || DEFAULT_THEME_STYLE;

/** 테마 이름 아래 설명. 백엔드에 description이 생기면 지워도 됩니다. */
export const THEME_DESC: Record<number, string> = {
  1: '기본 · 따뜻한 종이 무드',
  2: '푸른 바다 · 시원한 무드',
  3: '깊은 숲 · 차분한 그린',
  4: '따뜻한 노을빛',
  5: '차분한 다크 무드',
};

/**
 * 테마 목록 API(GET /api/themes)가 아직 없을 때 패널에 띄울 임시 목록.
 * 이미지 URL이 없어서 색 스와치로만 보입니다.
 */
export const FALLBACK_THEMES: BoardTheme[] = [
  { themeId: 1, themeName: '종이·크림', themeImageUrl: '', font: '', designs: [] },
  { themeId: 2, themeName: '바다', themeImageUrl: '', font: '', designs: [] },
  { themeId: 3, themeName: '숲', themeImageUrl: '', font: '', designs: [] },
  { themeId: 4, themeName: '노을', themeImageUrl: '', font: '', designs: [] },
  { themeId: 5, themeName: '밤', themeImageUrl: '', font: '', designs: [] },
];