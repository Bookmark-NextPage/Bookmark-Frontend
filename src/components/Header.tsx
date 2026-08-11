import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();

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
        <div className="bm-avatar" onClick={() => navigate('/mypage')}>
          나
        </div>
      </div>
    </header>
  );
}