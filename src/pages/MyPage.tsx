import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './MyPage.css';

// ---------- 타입 ----------
type Privacy = '전체공개' | '친구공개' | '비공개';

interface BookMeta {
  year: string;
  title: string;
  priv: Privacy;
}

interface Friend {
  initial: string;
  name: string;
  id: string;
}

// ---------- 임시 데이터 (원본 와이어프레임과 동일) ----------
const initialBooks: BookMeta[] = [
  { year: '2025', title: '스물다섯', priv: '친구공개' },
  { year: '2024', title: '도전의 해', priv: '전체공개' },
  { year: '2023', title: '시작', priv: '비공개' },
  { year: '2022', title: '첫 발', priv: '전체공개' },
  { year: '2021', title: '기록의 시작', priv: '비공개' },
];

const initialFriends: Friend[] = [
  { initial: '지', name: '지우', id: '@jiwoo' },
  { initial: '현', name: '현서', id: '@hyunseo' },
  { initial: '민', name: '민지', id: '@minji' },
  { initial: '준', name: '준영', id: '@junyoung' },
];

const PRIV_OPTIONS: Privacy[] = ['전체공개', '친구공개', '비공개'];

export default function MyPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('다인');
  const [bio, setBio] = useState('사소한 것에도 성취감을 느끼는 사람');

  const [books, setBooks] = useState<BookMeta[]>(initialBooks);
  const [friends] = useState<Friend[]>(initialFriends);

  const [privOpenIdx, setPrivOpenIdx] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [friendAddOpen, setFriendAddOpen] = useState(false);

  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);

  const stats = [
    { label: '총 기록', value: 62 },
    { label: '완료한 버킷', value: 128 },
    { label: '콜랙트북(권)', value: books.length },
    { label: '친구', value: friends.length },
  ];

  const openEdit = () => {
    setDraftName(name);
    setDraftBio(bio);
    setEditOpen(true);
  };

  const saveProfile = () => {
    setName(draftName.trim() || '다인');
    setBio(draftBio.trim());
    setEditOpen(false);
  };

  const setPriv = (idx: number, value: Privacy) => {
    setBooks((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, priv: value } : b))
    );
    setPrivOpenIdx(null);
  };

  return (
    <div className="bm-page">
      <Header />

      <main className="bm-main">
        <div className="page-head">
          <div className="page-title">마이페이지</div>
        </div>

        {/* 프로필 헤더 */}
        <div className="mp-head">
          <div className="mp-avatar">{name.slice(0, 1)}</div>
          <div>
            <div className="mp-name">{name}</div>
            <div className="mp-bio">{bio} · @dain_book</div>
          </div>
          <button className="btn-ghost mp-edit" onClick={openEdit}>
            프로필 편집
          </button>
        </div>

        {/* 통계 */}
        <div className="mp-stats">
          {stats.map((s) => (
            <div className="mp-stat" key={s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* 2단 컬럼 */}
        <div className="mp-cols">
          {/* 콜랙트북 공개 설정 */}
          <div className="mp-box">
            <div className="bh">
              <h4>콜랙트북 공개 설정</h4>
            </div>
            <div>
              {books.map((b, i) => (
                <div className="priv-row" key={b.year + b.title}>
                  <span className="priv-book-label">
                    {b.year} · {b.title}
                  </span>
                  <div className="priv-select">
                    <button
                      className="priv-btn"
                      onClick={() =>
                        setPrivOpenIdx(privOpenIdx === i ? null : i)
                      }
                    >
                      {b.priv} <span>▾</span>
                    </button>
                    {privOpenIdx === i && (
                      <div className="priv-menu">
                        {PRIV_OPTIONS.map((opt) => (
                          <div key={opt} onClick={() => setPriv(i, opt)}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 친구 */}
          <div className="mp-box">
            <div className="bh">
              <h4>친구 · 서로의 인생 전시회</h4>
              <button
                className="btn-ghost"
                onClick={() => setFriendAddOpen(true)}
              >
                + 친구 추가
              </button>
            </div>
            <div className="friends">
              {friends.map((f) => (
                <div
                  className="friend"
                  key={f.id}
                  onClick={() => navigate(`/friend/${f.id.replace('@', '')}`)}
                >
                  <div className="fa">{f.initial}</div>
                  {f.name}
                </div>
              ))}
              <div className="friend add" onClick={() => setFriendAddOpen(true)}>
                <div className="fa">+</div>
                추가
              </div>
            </div>
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

            <div className="edit-avatar">
              <div className="ea">{draftName.slice(0, 1)}</div>
              <button
                className="btn-ghost"
                onClick={() => alert('사진 업로드 (추후 연동)')}
              >
                사진 변경
              </button>
            </div>

            <div className="field">
              <label>이름</label>
              <input
                className="box"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>한줄소개</label>
              <input
                className="box"
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
              />
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
            <button
              className="close-x"
              onClick={() => setFriendAddOpen(false)}
            >
              ×
            </button>
            <h3>친구 추가</h3>
            <div className="msub">아이디로 친구를 검색해 추가하세요.</div>
            <div className="search-box">
              <input placeholder="친구 아이디 검색 (예: @jiwoo)" />
            </div>
            <div className="modal-foot">
              <button
                className="btn-ghost"
                onClick={() => setFriendAddOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}