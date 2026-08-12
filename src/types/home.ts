export interface HomeResponse {
  userName: string;
  weeklyCompletedMemoCount: number; // 이번 주 완료한 메모(버킷) 수
  planMemoCount: number; // 계획(하고 싶은 일) 메모 수
  collectBookCount: number; // 콜렉트북 권 수
  recordCount: number; // 총 기록 수
  recentRecords: RecentRecord[]; // 최신 생성 기록 3개
}

export interface RecentRecord {
  recordId: number;
  title: string;
  createdAt: string; // 'YYYY-MM-DD'
}