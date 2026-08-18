// 마이페이지 관련 서버 응답 타입

import type { Visibility } from './collectBook';

/** 마이페이지 조회 - GET /user/me/mypage */
export interface MyPageResponse {
  profile: MyProfile;
  stats: MyStats;
  recentBooks: RecentBook[];
  friends: FriendSummary[];
}

export interface MyProfile {
  userId: number;
  name: string;
  loginId: string;
  bio: string | null;
  profileImageUrl: string | null;
}

export interface MyStats {
  totalRecords: number;
  completedBuckets: number;
  collectBookCount: number;
  friendCount: number;
}

export interface RecentBook {
  collectBookId: number;
  year: number | string;
  title: string;
  visibility: Visibility;
}

export interface FriendSummary {
  userId: number;
  name: string;
  loginId: string;
}