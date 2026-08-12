import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';import { getFriendPage, deleteFriend } from '../api/friend';
import type { FriendPageResponse, PublicCollectBook, BookColor } from '../types/collectBook';
import './FriendProfile.css';

// ⚠️ 팀원이 만든 src/utils/bookColor.ts 에 같은 역할의 함수가 있으면 그걸로 교체해주세요!
const BOOK_COLOR_MAP: Record<BookColor, string> = {
  PINK: 'linear-gradient(180deg,#E39AA6,#C1637C)',
  GREEN: 'linear-gradient(180deg,#B3C79E,#8FA37E)',
  BLUE: 'linear-gradient(180deg,#AFD0DA,#8FB6C6)',
  YELLOW: 'linear-gradient(180deg,#F5E6C8,#E3C79A)',
  PURPLE: 'linear-gradient(180deg,#C79AB3,#9E6C87)',
};

export default function FriendProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const friendUserId = id ? Number(id) : null;

  const [data, setData] = useState<FriendPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openBook, setOpenBook] = useState<PublicCollectBook | null>(null);

  useEffect(() => {
    if (!friendUserId) {
      setError('잘못된 접근이에요.');
      setLoading(false);
      return;
    }
    getFriendPage(friendUserId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('친구 프로필 불러오기 실패:', err);
        setError('친구 프로필을 불러오지 못했어요. 친구가 아니거나 서버 문제일 수 있어요.');
        setLoading(false);
      });
  }, [friendUserId]);

  const handleDeleteFriend = async () => {
    if (!friendUserId || !data) return;
    const ok = window.confirm(`${data.name}님을 친구에서 삭제할까요?`);
    if (!ok) return;
    try {
      await deleteFriend(friendUserId);
      navigate('/mypage');
    } catch (err) {
      console.error('친구 삭제 실패:', err);
      alert('친구 삭제에 실패했어요. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="fr-empty">불러오는 중...</div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="fr-empty">
            <p>{error ?? '데이터가 없어요.'}</p>
            <button className="btn-ghost" onClick={() => navigate('/mypage')}>
              ← 마이페이지로
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bm-page">
      <Header />

      <main className="bm-main">
        <div className="page-head">
          <button className="btn-ghost" onClick={() => navigate('/mypage')}>
            ← 친구 목록
          </button>
        </div>

        {/* 친구 프로필 헤더 */}
        <div className="fr-head">
          <div className="mp-avatar">{data.name.slice(0, 1)}</div>
          <div>
            <div className="mp-name">{data.name}</div>
            <div className="mp-bio">
              @{data.loginId} {data.bio ? `· ${data.bio}` : ''}
            </div>
          </div>
          <button className="btn-danger fr-delete" onClick={handleDeleteFriend}>
            친구 삭제
          </button>
        </div>

        {/* 공개 콜랙트북 책장 */}
        <div className="mp-box">
          <div className="bh">
            <h4>{data.name}님의 공개 콜랙트북</h4>
          </div>

          {data.publicCollectBooks.length === 0 ? (
            <div className="fr-empty-books">아직 공개된 콜랙트북이 없어요.</div>
          ) : (
            <div className="fr-books">
              {data.publicCollectBooks.map((b) => (
                <div
                  key={b.collectBookId}
                  className="fr-book"
                  style={{ background: BOOK_COLOR_MAP[b.bookColor] }}
                  onClick={() => setOpenBook(b)}
                >
                  <span className="yr">{b.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 책 표지 정보 모달 (TODO: 콜랙트북 상세/기록 조회 API 연결되면 챕터별 목차+리더로 교체) */}
      {openBook && (
        <div className="overlay show" onClick={() => setOpenBook(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setOpenBook(null)}>
              ×
            </button>
            <h3>
              {openBook.year} · {openBook.title}
            </h3>
            <div className="msub">이 책 안의 기록을 펼쳐보는 기능은 곧 연결될 예정이에요.</div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setOpenBook(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}