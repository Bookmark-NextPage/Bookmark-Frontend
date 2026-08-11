import { create } from 'zustand';

const TOKEN_KEY = 'accessToken';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  /** 로그인 성공 시 토큰 저장 */
  setToken: (token: string) => void;
  /** 로그아웃: 토큰 삭제 (서버 호출 없이 프론트에서만 처리) */
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 새로고침해도 유지되도록 localStorage에서 초기값 로드
  token: localStorage.getItem(TOKEN_KEY),
  isLoggedIn: !!localStorage.getItem(TOKEN_KEY),

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, isLoggedIn: false });
  },
}));