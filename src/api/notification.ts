import client from './client';
import type {
  NotificationCategory,
  NotificationItem,
  PageResponse,
  UnreadCountResponse,
} from '../types/notification';

// client.ts 인터셉터가 ApiResponse({isSuccess, result})를 벗겨서 result만 돌려줍니다.
// 알림 목록은 result가 다시 PageResponse(content[]) 구조입니다.

/** 알림 목록 조회 (카테고리별, 페이징) */
export const getNotifications = async (
  category: NotificationCategory = 'ALL',
  page = 0,
  size = 20,
) => {
  const { data } = await client.get<PageResponse<NotificationItem>>('/notifications', {
    params: { category, page, size },
  });
  return data;
};

/** 안 읽은 알림 개수 (종 뱃지용) */
export const getUnreadCount = async () => {
  const { data } = await client.get<UnreadCountResponse>('/notifications/unread-count');
  return data;
};

/** 단건 알림 읽음 처리 */
export const readNotification = async (notificationId: number) => {
  await client.patch(`/notifications/${notificationId}/read`);
};

/** 전체 알림 읽음 처리 */
export const readAllNotifications = async () => {
  await client.patch('/notifications/read-all');
};

/** 인앱 알림 ON/OFF 설정 변경 */
export const updateNotificationSetting = async (enabled: boolean) => {
  const { data } = await client.patch<boolean>('/notifications/settings', { enabled });
  return data;
};