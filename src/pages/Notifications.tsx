import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import { useNotifications } from '../hooks/useNotifications';
import { readNotification, readAllNotifications } from '../api/notification';
import type { NotificationCategory, NotificationItem } from '../types/notification';
import './Notifications.css';

const TABS: { key: NotificationCategory; label: string }[] = [
  { key: 'ALL', label: '전체 알림' },
  { key: 'FRIEND', label: '친구 활동' },
  { key: 'COMMENT', label: '댓글' },
  { key: 'LIKE', label: '좋아요' },
];

/** ISO datetime → 상대시간 */
function relTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day === 1) return '어제';
  return `${day}일 전`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<NotificationCategory>('ALL');

  const { data, isLoading, isError } = useNotifications(tab);
  const items: NotificationItem[] = data?.content ?? [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
  };

  const handleReadAll = async () => {
    try {
      await readAllNotifications();
      refresh();
    } catch (err) {
      console.error('전체 읽음 처리 실패:', err);
    }
  };

  const handleClickItem = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await readNotification(n.id);
        refresh();
      } catch (err) {
        console.error('읽음 처리 실패:', err);
      }
    }
    if (n.redirectUrl) {
      navigate(n.redirectUrl);
    }
  };

  return (
    <div className="bm-page">
      <Header />
      <main className="bm-main">
        <div className="page-head">
          <div>
            <div className="page-title">알림</div>
            <div className="page-sub">중요한 소식과 친구들의 활동을 확인해보세요.</div>
          </div>
        </div>

        <div className="noti-layout">
          <div className="noti-tabs">
            {TABS.map((t) => (
              <div
                key={t.key}
                className={`noti-tab ${tab === t.key ? 'on' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <span>{t.label}</span>
              </div>
            ))}
          </div>

          <div className="noti-content">
            <div className="noti-actions">
              <span onClick={handleReadAll}>모두 읽음 표시</span>
              <span onClick={() => navigate('/settings')}>알림 설정</span>
            </div>

            <div className="noti-list">
              {isLoading ? (
                <div className="noti-empty">불러오는 중...</div>
              ) : isError ? (
                <div className="noti-empty">알림을 불러오지 못했어요.</div>
              ) : items.length === 0 ? (
                <div className="noti-empty">알림이 없어요.</div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={`noti-item ${n.isRead ? 'read' : ''}`}
                    onClick={() => handleClickItem(n)}
                  >
                    <div className="noti-avatar">{n.senderName?.slice(0, 1) ?? '·'}</div>
                    <div className="noti-body">
                      <div className="noti-text">
                        <b>{n.senderName}</b> {n.content}
                      </div>
                      <div className="noti-time">{relTime(n.createdAt)}</div>
                    </div>
                    {n.type === 'FRIEND_REQUEST' && (
                      <div className="noti-friend-actions">
                        <button
                          className="nf-accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (n.redirectUrl) navigate(n.redirectUrl);
                          }}
                        >
                          수락
                        </button>
                        <button
                          className="nf-reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (n.redirectUrl) navigate(n.redirectUrl);
                          }}
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="noti-foot">새로운 알림이 가장 먼저 보여져요.</div>
          </div>
        </div>
      </main>
    </div>
  );
}