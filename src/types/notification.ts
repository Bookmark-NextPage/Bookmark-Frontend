// 알림 관련 타입 (백엔드 notification 도메인)

/** 알림 종류 */
export type NotificationType = 'FRIEND_REQUEST' | 'LIKE' | 'COMMENT';

/** 알림 카테고리 (목록 필터) */
export type NotificationCategory = 'ALL' | 'FRIEND' | 'LIKE' | 'COMMENT';

/** 알림 한 건 - NotificationResponse */
export interface NotificationItem {
  id: number;
  type: NotificationType;
  senderName: string;
  content: string;
  redirectUrl: string | null;
  isRead: boolean;
  createdAt: string; // ISO LocalDateTime
}

/** 페이징 응답 (PageResponse)
 *  ⚠️ 실제 필드명은 백엔드 PageResponse 구조에 맞춰 조정 필요 */
export interface PageResponse<T> {
  content: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
}

/** 안 읽은 알림 개수 */
export interface UnreadCountResponse {
  unreadCount: number;
}