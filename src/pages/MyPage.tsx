import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getMyPage, updateProfile } from '../api/user';
import { addFriend, searchUsers, type FriendSearchResult } from '../api/friend'; // friend.ts에 함수 추가하신 다음!
import type { MyPageResponse } from '../types/user';
import './MyPage.css';

/** 콜랙트북 공개 범위 라벨 */
const VISIBILITY_LABEL: Record<string, string> = {
  PUBLIC: '전체공개',
  FRIENDS: '친구공개',
  PRIVATE: '비공개',
};

export default function MyPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<MyPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftBio, setDraftBio] = useState('');

  const [friendAddOpen, setFriendAddOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    setLoading(true);
    getMyPage()
      .then((res) => {
        console.log('=== 서버 응답 확인 ===', res);
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('마이페이지 불러오기 실패:', err);
        setError('마이페이지 정보를 불러오지 못했어요. 로그인이 필요하거나 서버가 꺼져있을 수 있어요.');
        setLoading(false);
      });
  };

  const openEdit = () => {
    if (!data) return;
    setDraftName(data.profile.name);
    setDraftBio(data.profile.bio ?? '');
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (!data) return;
    try {
      await updateProfile({ name: draftName, bio: draftBio });
      setData({ ...data, profile: { ...data.profile, name: draftName, bio: draftBio } });
      setEditOpen(false);
    } catch (err) {
      console.error('프로필 저장 실패:', err);
      alert('프로필 저장에 실패했어요. 다시 시도해주세요.');
    }
  };

  const openFriendAdd = () => {
    setSearchName('');
    setSearchResults([]);
    setAddedIds([]);
    setFriendAddOpen(true);
  };

  const runSearch = async (name: string) => {
    setSearchName(name);
    if (!name.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUsers(name);
      setSearchResults(results);
    } catch (err) {
      console.error('유저 검색 실패:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendUserId: number) => {
    try {
      await addFriend(friendUserId);
      setAddedIds((prev) => [...prev, friendUserId]);
    } catch (err) {
      console.error('친구 신청 실패:', err);
      alert('친구 신청에 실패했어요. 다시 시도해주세요.');
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
          <div className="fr-empty">{error ?? '데이터가 없어요.'}</div>
        </main>
      </div>
    );
  }

  const { profile, stats, recentBooks, friends } = data;

  return (
    <div className="bm-page">
      <Header />

      <main className="bm-main">
        <div className="page-head">
          <div className="page-title">마이페이지</div>
        </div>

        {/* 프로필 헤더 */}
        <div className="mp-head">
          <div className="mp-avatar">{profile.name.slice(0, 1)}</div>
          <div>
            <div className="mp-name">{profile.name}</div>
            <div className="mp-bio">
              {profile.bio ?? '한줄소개를 입력해보세요'} · @{profile.loginId}
            </div>
          </div>
          <button className="btn-ghost mp-edit" onClick={openEdit}>
            프로필 편집
          </button>
        </div>

        {/* 통계 */}
        <div className="mp-stats">
          <div className="mp-stat">
            <b>{stats.totalRecords}</b>
            <span>총 기록</span>
          </div>
          <div className="mp-stat">
            <b>{stats.completedBuckets}</b>
            <span>완료한 버킷</span>
          </div>
          <div className="mp-stat">
            <b>{stats.collectBookCount}</b>
            <span>콜랙트북(권)</span>
          </div>
          <div className="mp-stat">
            <b>{stats.friendCount}</b>
            <span>친구</span>
          </div>
        </div>

        {/* 2단 컬럼 */}
        <div className="mp-cols">
          {/* 콜랙트북 공개 설정 */}
          <div className="mp-box">
            <div className="bh">
              <h4>콜랙트북 공개 설정</h4>
            </div>
            {recentBooks.length === 0 ? (
              <div className="fr-empty-books">아직 만든 콜랙트북이 없어요.</div>
            ) : (
              <div>
                {recentBooks.map((b) => (
                  <div className="priv-row" key={b.collectBookId}>
                    <span className="priv-book-label">
                      {b.year} · {b.title}
                    </span>
                    <span className="priv-book-label">
                      {VISIBILITY_LABEL[b.visibility] ?? b.visibility}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 친구 */}
          <div className="mp-box">
            <div className="bh">
              <h4>친구 · 서로의 인생 전시회</h4>
              <button className="btn-ghost" onClick={openFriendAdd}>
                + 친구 추가
              </button>
            </div>
            {friends.length === 0 ? (
              <div className="fr-empty-books">아직 친구가 없어요.</div>
            ) : (
              <div className="friends">
                {friends.map((f) => (
                  <div className="friend" key={f.userId} onClick={() => navigate(`/friend/${f.userId}`)}>
                    <div className="fa">{f.name.slice(0, 1)}</div>
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 프로필 편집 모달 */}
      {editOpen && (
        <div className="overlay show" onClick={() => setEditOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setEditOpen(false)}>
              ×
            </button>
            <h3>프로필 편집</h3>
            <div className="msub">프로필 사진과 한줄소개를 바꿀 수 있어요.</div>

            <div className="field">
              <label>이름</label>
              <input className="box" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            </div>
            <div className="field">
              <label>한줄소개</label>
              <input className="box" value={draftBio} onChange={(e) => setDraftBio(e.target.value)} />
            </div>

            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setEditOpen(false)}>
                취소
              </button>
              <button className="btn-fill" onClick={saveProfile}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 친구 추가 모달 */}
      {friendAddOpen && (
        <div className="overlay show" onClick={() => setFriendAddOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setFriendAddOpen(false)}>
              ×
            </button>
            <h3>친구 추가</h3>
            <div className="msub">이름으로 친구를 검색해 추가하세요.</div>

            <div className="search-box">
              <input
                placeholder="이름 검색 (예: 지우)"
                value={searchName}
                onChange={(e) => runSearch(e.target.value)}
              />
            </div>

            <div>
              {searching && <div className="fr-empty-books">검색 중...</div>}
              {!searching && searchName.trim() && searchResults.length === 0 && (
                <div className="fr-empty-books">일치하는 유저가 없어요.</div>
              )}
              {searchResults.map((u) => (
                <div className="search-result" key={u.userId}>
                  <div className="sr-a">{u.name.slice(0, 1)}</div>
                  <div>
                    <div>{u.name}</div>
                    <div className="sr-id">@{u.loginId}</div>
                  </div>
                  <button
                    className="btn-fill"
                    style={{ marginLeft: 'auto' }}
                    disabled={addedIds.includes(u.userId)}
                    onClick={() => handleAddFriend(u.userId)}
                  >
                    {addedIds.includes(u.userId) ? '신청됨' : '추가'}
                  </button>
                </div>
              ))}
            </div>

            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setFriendAddOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}