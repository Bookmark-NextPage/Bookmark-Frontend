import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout(); // 토큰 삭제 (서버 호출 없음)
    navigate('/login');
  };

  return (
    <header className="bm-header">
      <div className="bm-logo" onClick={() => navigate('/')}>
        Book<span>Mark</span>
        <small>2026</small>
      </div>
      <nav className="bm-tabs">
        <button onClick={() => navigate('/board')}>버킷보드</button>
        <button onClick={() => navigate('/collect')}>콜랙트북</button>
      </nav>
      <div className="bm-top-right">
        <div className="bm-search">
          <input placeholder="검색" />
        </div>
        <div className="bm-bell" onClick={() => navigate('/noti')}>
          🔔
          <span className="bm-badge">3</span>
        </div>
        <div className="bm-avatar-wrap">
          <div className="bm-avatar" onClick={() => setMenuOpen((v) => !v)}>
            나
          </div>
          {menuOpen && (
            <>
              <div className="bm-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="bm-menu">
                <div onClick={() => { setMenuOpen(false); navigate('/mypage'); }}>
                  마이페이지
                </div>
                <div onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                  설정
                </div>
                <div onClick={handleLogout}>로그아웃</div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}