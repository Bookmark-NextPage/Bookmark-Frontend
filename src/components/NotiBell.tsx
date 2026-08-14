import { useNavigate } from 'react-router-dom';
import { useUnreadCount } from '../hooks/useNotifications';
import './NotiBell.css';

/** 헤더의 종 아이콘 + 안 읽은 알림 개수 뱃지 */
export default function NotiBell() {
  const navigate = useNavigate();
  const { data } = useUnreadCount();
  const count = data?.unreadCount ?? 0;

  return (
    <div className="noti-bell" onClick={() => navigate('/noti')} title="알림">
      🔔
      {count > 0 && <span className="noti-badge">{count > 99 ? '99+' : count}</span>}
    </div>
  );
}