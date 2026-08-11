import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * 로그인이 필요한 페이지를 감싸는 가드.
 * 토큰이 없으면 /login으로 보냅니다.
 */
export default function RequireAuth() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}