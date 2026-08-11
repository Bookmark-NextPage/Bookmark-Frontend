// MyPage.tsx / FriendProfile.tsx가 함께 쓰는 임시 소셜 데이터입니다.
// 나중에 API 연동 시 이 파일을 fetch 결과로 교체하면 됩니다.

export type Privacy = '전체공개' | '친구공개' | '비공개';

export interface FriendComment {
  who: string;
  text: string;
}

export interface FriendRecord {
  title: string;
  date: string; // 'YYYY.MM.DD'
  theme: string;
  summary: string; // 목차 미리보기용 한 줄
  full: string; // 펼쳐봤을 때 전체 본문
  pics: number;
  likes: number;
  comments: FriendComment[];
}

export interface FriendBook {
  year: string;
  title: string;
  grad: string;
  priv: Privacy;
  volume: string; // 'VOLUME 3.'
  chapterTitles?: Record<number, string>; // 월별 챕터 별칭
  records: FriendRecord[];
}

export interface Friend {
  id: string;
  name: string;
  handle: string;
  bio: string;
  initial: string;
  books: FriendBook[];
}

export const friends: Friend[] = [
  {
    id: 'jiwoo',
    name: '지우',
    handle: '@jiwoo',
    bio: '매일 한 컷을 남기는 사람',
    initial: '지',
    books: [
      {
        year: '2025',
        title: '스물다섯',
        grad: 'linear-gradient(180deg,#B3C79E,#8FA37E)',
        priv: '전체공개',
        volume: 'VOLUME 3.',
        chapterTitles: { 11: '행운을 빌어줘', 10: '가을의 기록' },
        records: [
          {
            title: '교토 단풍 시즌에 혼자 여행 가기',
            date: '2025.11.14',
            theme: '도전',
            summary: '3박 4일 내내 걸었다. 처음으로 여행이 안 무서웠다.',
            full: '혼자 떠난 첫 해외여행. 3박 4일 내내 걸었다. 아라시야마 대나무숲에서는 아무 계획 없이 한 시간을 앉아 있었고, 니시키 시장에서 산 두부 도넛을 걸으며 먹었다. 길을 잘못 들어도 초조하지 않았던 게 스스로 제일 낯설었다.',
            pics: 3,
            likes: 12,
            comments: [
              { who: '지우', text: '혼자 여행 진짜 용기 있다!!' },
              { who: '현서', text: '다음엔 나도 데려가줘 ㅋㅋ' },
            ],
          },
          {
            title: '토이 프로젝트 앱스토어 출시하기',
            date: '2025.11.09',
            theme: '성취',
            summary: '심사 두 번 반려 끝에 통과. 첫 다운로드를 캡처해뒀다.',
            full: '6개월 붙잡고 있던 앱을 드디어 올렸다. 심사 두 번 반려당하고 세 번째에 통과. 첫 다운로드가 1로 찍히던 순간을 캡처해뒀다.',
            pics: 2,
            likes: 20,
            comments: [{ who: '현서', text: '축하해!! 링크 공유해줘' }],
          },
          {
            title: '할머니께 손편지 쓰기',
            date: '2025.11.03',
            theme: '관계',
            summary: '우체통에 넣고 돌아오는 길이 뿌듯했다.',
            full: '전화 대신 편지를 써봤다. 손글씨가 오랜만이라 세 번을 고쳐 썼다. 우체통에 넣고 돌아오는 길이 이상하게 뿌듯했다.',
            pics: 1,
            likes: 8,
            comments: [],
          },
          {
            title: '단풍 사진 100장 찍기',
            date: '2025.10.21',
            theme: '일상',
            summary: '성북천 산책길에서 다 채웠다.',
            full: '가을이 짧을 것 같아 목표를 세웠다. 성북천 산책길에서 100장을 다 채웠다. 같은 나무도 아침저녁으로 색이 달랐다.',
            pics: 4,
            likes: 5,
            comments: [],
          },
          {
            title: '북클럽 첫 참여',
            date: '2025.10.08',
            theme: '관계',
            summary: '낯선 사람들과 책 얘기.',
            full: '처음 보는 사람들과 두 시간 동안 책 얘기만 했다. 어색할 줄 알았는데 시간이 훅 갔다.',
            pics: 1,
            likes: 3,
            comments: [],
          },
        ],
      },
      {
        year: '2024',
        title: '도전의 해',
        grad: 'linear-gradient(180deg,#E39AA6,#C1637C)',
        priv: '전체공개',
        volume: 'VOLUME 2.',
        records: [
          {
            title: '풀코스 수영 배우기',
            date: '2024.06.12',
            theme: '도전',
            summary: '물이 무서웠는데 이젠 아니다.',
            full: '어릴 때 물에 빠진 기억 때문에 늘 피했던 수영을 배웠다. 3개월 만에 25m를 완주했다.',
            pics: 2,
            likes: 15,
            comments: [{ who: '민지', text: '나도 배우고 싶다!!' }],
          },
        ],
      },
      {
        year: '2023',
        title: '시작',
        grad: 'linear-gradient(180deg,#AFD0DA,#8FB6C6)',
        priv: '친구공개',
        volume: 'VOLUME 1.',
        records: [
          {
            title: '첫 독립',
            date: '2023.03.02',
            theme: '일상',
            summary: '작은 방이었지만 온전히 내 공간이 생겼다.',
            full: '작은 방이었지만 온전히 내 공간이 생겼다. 첫날 밤엔 이상하게 잠이 안 왔다.',
            pics: 1,
            likes: 6,
            comments: [],
          },
        ],
      },
    ],
  },
  {
    id: 'hyunseo',
    name: '현서',
    handle: '@hyunseo',
    bio: '러닝하는 개발자',
    initial: '현',
    books: [
      {
        year: '2025',
        title: '달리는 해',
        grad: 'linear-gradient(180deg,#F5E6C8,#E3C79A)',
        priv: '전체공개',
        volume: 'VOLUME 1.',
        records: [
          {
            title: '첫 하프마라톤 완주',
            date: '2025.09.14',
            theme: '도전',
            summary: '21km를 완주했다.',
            full: '21km를 완주했다. 다리는 후들거렸지만 기분은 최고였다. 완주 메달을 받는 순간 눈물이 났다.',
            pics: 3,
            likes: 18,
            comments: [{ who: '지우', text: '완전 대단해!!' }],
          },
        ],
      },
    ],
  },
  {
    id: 'minji',
    name: '민지',
    handle: '@minji',
    bio: '책과 커피',
    initial: '민',
    books: [
      {
        year: '2024',
        title: '책과 함께',
        grad: 'linear-gradient(180deg,#C79AB3,#9E6C87)',
        priv: '전체공개',
        volume: 'VOLUME 1.',
        records: [
          {
            title: '연간 50권 완독',
            date: '2024.12.30',
            theme: '성취',
            summary: '올해 목표였던 50권을 마지막 날에 채웠다.',
            full: '올해 목표였던 50권을 마지막 날에 채웠다. 마지막 책은 가장 좋아하는 작가의 신작이었다.',
            pics: 1,
            likes: 9,
            comments: [],
          },
        ],
      },
    ],
  },
  {
    id: 'junyoung',
    name: '준영',
    handle: '@junyoung',
    bio: '여행 수집가',
    initial: '준',
    books: [
      {
        year: '2025',
        title: '떠남의 기록',
        grad: 'linear-gradient(180deg,#B3C79E,#8FA37E)',
        priv: '친구공개',
        volume: 'VOLUME 1.',
        records: [
          {
            title: '제주 한 달 살기',
            date: '2025.06.01',
            theme: '도전',
            summary: '처음으로 한 달을 낯선 곳에서 살아봤다.',
            full: '처음으로 한 달을 낯선 곳에서 살아봤다. 매일 다른 해변으로 산책을 나갔다.',
            pics: 5,
            likes: 22,
            comments: [{ who: '다인', text: '나도 데려가지!!' }],
          },
        ],
      },
    ],
  },
];

export function getFriendById(id: string): Friend | undefined {
  return friends.find((f) => f.id === id);
}