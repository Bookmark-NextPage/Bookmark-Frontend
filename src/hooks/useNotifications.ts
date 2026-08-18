import { useQuery } from '@tanstack/react-query';
import { getNotifications, getUnreadCount } from '../api/notification';
import type { NotificationCategory } from '../types/notification';

/** 알림 목록 (카테고리별) */
export const useNotifications = (category: NotificationCategory) => {
  return useQuery({
    queryKey: ['notifications', category],
    queryFn: () => getNotifications(category),
  });
};

/** 안 읽은 알림 개수 (종 뱃지) */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // 30초마다 갱신
  });
};