import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import { getFriendById, type FriendBook, type FriendRecord } from '../data/socialData';
import './FriendProfile.css';

type Screen = 'shelf' | 'toc' | 'reader';

interface FlipState {
  dir: 1 | -1;
  cur: FriendRecord;
  nxt: FriendRecord;
  go: boolean;
}

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function FriendProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const friend = id ? getFriendById(id) : undefined;

  const [screen, setScreen] = useState<Screen>('shelf');
  const [activeBook, setActiveBook] = useState<FriendBook | null>(null);
  const [activeMonth, setActiveMonth] = useState<number>(1);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [flip, setFlip] = useState<FlipState | null>(null);

  const [likeState, setLikeState] = useState<Record<string, { liked: boolean; likes: number }>>({});
  const [commentState, setCommentState] = useState<Record<string, { who: string; text: string }[]>>({});
  const [commentDraft, setCommentDraft] = useState('');

  // 플립 애니메이션 트리거 (마운트 다음 프레임에 go 클래스 붙여서 transition 발동)
  useEffect(() => {
    if (flip && !flip.go) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setFlip((f) => (f ? { ...f, go: true } : f));
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [flip]);

  if (!friend) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="fr-empty">
            <p>친구를 찾을 수 없어요.</p>
            <button className="btn-ghost" onClick={() => navigate('/mypage')}>
              ← 마이페이지로
            </button>
          </div>
        </main>
      </div>
    );
  }

  const publicBooks = friend.books.filter((b) => b.priv !== '비공개');

  const monthGroups = useMemo(() => {
    if (!activeBook) return [];
    return MONTH_NAMES.map((m) => {
      const records = activeBook.records.filter((r) => parseInt(r.date.split('.')[1], 10) === m);
      const alias = activeBook.chapterTitles?.[m];
      return { month: m, records, label: alias ? `${m}월 · ${alias}` : `${m}월` };
    });
  }, [activeBook]);

  const currentMonthGroup = monthGroups.find((g) => g.month === activeMonth);
  const currentRecords = currentMonthGroup?.records ?? [];
  const currentRecord: FriendRecord | undefined = currentRecords[displayIdx];

  const recordKey = (r: FriendRecord) => r.title + r.date;

  const handleDeleteFriend = () => {
    const ok = window.confirm(`${friend.name}님을 친구에서 삭제할까요?`);
    if (!ok) return;
    navigate('/mypage');
  };

  const openBook = (b: FriendBook) => {
    setActiveBook(b);
    const monthsWithRecords = b.records.map((r) => parseInt(r.date.split('.')[1], 10));
    setActiveMonth(monthsWithRecords.length ? Math.max(...monthsWithRecords) : 1);
    setScreen('toc');
  };

  const openReader = (idx: number) => {
    setDisplayIdx(idx);
    setFlip(null);
    setScreen('reader');
  };

  const getLike = (r: FriendRecord) => {
    const key = recordKey(r);
    return likeState[key] ?? { liked: false, likes: r.likes };
  };
  const toggleLike = (r: FriendRecord) => {
    const key = recordKey(r);
    const cur = getLike(r);
    setLikeState((prev) => ({
      ...prev,
      [key]: { liked: !cur.liked, likes: cur.likes + (cur.liked ? -1 : 1) },
    }));
  };
  const getComments = (r: FriendRecord) => {
    const key = recordKey(r);
    return [...r.comments, ...(commentState[key] ?? [])];
  };
  const addComment = (r: FriendRecord) => {
    const val = commentDraft.trim();
    if (!val) return;
    const key = recordKey(r);
    setCommentState((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), { who: '나', text: val }],
    }));
    setCommentDraft('');
  };

  // 페이지 넘기기 (플립 애니메이션)
  const turnPage = (dir: 1 | -1) => {
    if (flip) return; // 애니메이션 중엔 무시
    const target = displayIdx + dir;
    if (target < 0 || target >= currentRecords.length) return;
    const cur = currentRecords[displayIdx];
    const nxt = currentRecords[target];
    setFlip({ dir, cur, nxt, go: false });
    window.setTimeout(() => {
      setDisplayIdx(target);
      setFlip(null);
    }, 760);
  };

  // 애니메이션 중 정적으로 보여줄 좌/우 내용 (넘어가는 쪽만 미리 다음 기록으로 교체)
  const leftRecord = flip && flip.dir === -1 ? flip.nxt : currentRecord;
  const rightRecord = flip && flip.dir === 1 ? flip.nxt : currentRecord;

  const renderTextSide = (r: FriendRecord | undefined, interactive: boolean) => {
    if (!r) return null;
    return (
      <>
        <div className="r-meta">
          {r.date}
          <span className="r-theme"># {r.theme}</span>
        </div>
        <div className="r-title">{r.title}</div>
        <div className="r-text">{r.full}</div>
        <div className="r-photos">
          {Array.from({ length: r.pics }).map((_, i) => (
            <div className="rp" key={i}>
              IMG {i + 1}
            </div>
          ))}
        </div>
        {interactive && (
          <>
            <div className="engage">
              <button className={`like-btn ${getLike(r).liked ? 'on' : ''}`} onClick={() => toggleLike(r)}>
                ♥ <span>{getLike(r).likes}</span>
              </button>
              <span className="cm-count">댓글 {getComments(r).length}</span>
            </div>
            <div className="comments">
              {getComments(r).map((c, i) => (
                <div className="cm-item" key={i}>
                  <b>{c.who}</b>
                  {c.text}
                </div>
              ))}
              <div className="cm-add">
                <input
                  className="cm-input"
                  placeholder="댓글을 남겨보세요"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addComment(r);
                  }}
                />
                <button className="btn-fill" onClick={() => addComment(r)}>
                  등록
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const renderArtSide = (r: FriendRecord | undefined) => {
    if (!r) return null;
    return (
      <div className="ai-art">
        <div className="art-label">{friend.name}님의 기록</div>
        <div className="a-quote"># {r.theme}</div>
      </div>
    );
  };

  return (
    <div className="bm-page">
      <Header />

      <main className="bm-main">
        {/* ===== 화면 1: 프로필 + 책장 ===== */}
        {screen === 'shelf' && (
          <>
            <div className="page-head">
              <button className="btn-ghost" onClick={() => navigate('/mypage')}>
                ← 친구 목록
              </button>
            </div>

            <div className="fr-head">
              <div className="mp-avatar">{friend.initial}</div>
              <div>
                <div className="mp-name">{friend.name}</div>
                <div className="mp-bio">
                  {friend.handle} · {friend.bio}
                </div>
              </div>
              <button className="btn-danger fr-delete" onClick={handleDeleteFriend}>
                친구 삭제
              </button>
            </div>

            <div className="mp-box">
              <div className="bh">
                <h4>{friend.name}님의 공개 콜랙트북</h4>
              </div>
              {publicBooks.length === 0 ? (
                <div className="fr-empty-books">아직 공개된 콜랙트북이 없어요.</div>
              ) : (
                <div className="fr-books">
                  {publicBooks.map((b) => (
                    <div key={b.year} className="fr-book" style={{ background: b.grad }} onClick={() => openBook(b)}>
                      <span className="yr">{b.year}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== 화면 2: 목차 ===== */}
        {screen === 'toc' && activeBook && (
          <>
            <div className="page-head">
              <button className="btn-ghost" onClick={() => setScreen('shelf')}>
                ← 책장
              </button>
              <div className="page-sub">‘자세히 보기’로 기록 페이지를 펼칩니다. (읽기 전용)</div>
            </div>
            <div className="collect-open">
              <div className="cpage-l">
                <div className="vol">{activeBook.volume}</div>
                <div className="book-title">{activeBook.year}</div>
                <div className="book-range">
                  {activeBook.year}. 01. 01 — {activeBook.year}. 12. 31
                </div>
                <div className="toc-label">CHAPTERS · 월 단위</div>
                <div>
                  {[...monthGroups].reverse().map((g) => (
                    <div
                      key={g.month}
                      className={`chapter ${g.records.length === 0 ? 'empty' : ''} ${activeMonth === g.month ? 'on' : ''}`}
                      onClick={() => setActiveMonth(g.month)}
                    >
                      <span className="num">Ch. {String(g.month).padStart(2, '0')}</span>
                      <span className="cname">{g.label}</span>
                      <span className="cnt">{g.records.length}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cpage-r">
                {currentRecords.length === 0 || !currentMonthGroup ? (
                  <div className="empty-state">
                    <div className="es-t">
                      Chapter {String(activeMonth).padStart(2, '0')} · {activeMonth}월
                    </div>
                    <div style={{ fontSize: 12 }}>이 달에는 기록이 없어요.</div>
                  </div>
                ) : (
                  <>
                    <div className="ch-head">
                      Chapter {String(activeMonth).padStart(2, '0')}. {activeBook.chapterTitles?.[activeMonth] ?? `${activeMonth}월`}
                    </div>
                    <div className="ch-date">
                      {activeBook.year}. {String(activeMonth).padStart(2, '0')}. 01 — {String(activeMonth).padStart(2, '0')}. 말일
                    </div>
                    {currentRecords.map((r, i) => (
                      <div className="prev-card" key={recordKey(r)}>
                        <div className="thumb">IMG</div>
                        <div>
                          <div className="pv-title">{r.title}</div>
                          <div className="pv-txt">{r.summary}</div>
                          <div className="pv-meta">
                            <span className="pv-theme"># {r.theme}</span>
                            <span className="pv-open" onClick={() => openReader(i)}>
                              자세히 보기 →
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ===== 화면 3: 리더 (플립 애니메이션 포함) ===== */}
        {screen === 'reader' && activeBook && currentRecord && (
          <>
            <div className="reader-top">
              <button className="btn-ghost" onClick={() => setScreen('toc')}>
                ← 목차
              </button>
              <div className="page-sub">
                {activeBook.year}년 {activeMonth}월 · Chapter {String(activeMonth).padStart(2, '0')}
              </div>
            </div>
            <div className="reader-stage">
              <div className="reader">
                <div className="reader-bookmark" onClick={() => setScreen('toc')}>
                  <div className="bm-t">목차</div>
                </div>

                <div className="r-half left">{renderTextSide(leftRecord, true)}</div>
                <div className="r-half right">{renderArtSide(rightRecord)}</div>

                {/* 넘어가는 중인 페이지 (플립 레이어) */}
                {flip && (
                  <div className={`turn ${flip.dir === 1 ? 'from-right' : 'from-left'} ${flip.go ? 'go' : ''}`}>
                    {flip.dir === 1 ? (
                      <>
                        <div className="tf front">{renderArtSide(flip.cur)}</div>
                        <div className="tf back left-face">{renderTextSide(flip.nxt, false)}</div>
                      </>
                    ) : (
                      <>
                        <div className="tf front left-face">{renderTextSide(flip.cur, false)}</div>
                        <div className="tf back">{renderArtSide(flip.nxt)}</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="page-nav">
              <button className="pg-btn" disabled={displayIdx === 0 || !!flip} onClick={() => turnPage(-1)}>
                ‹
              </button>
              <span className="pg-count">
                {displayIdx + 1} / {currentRecords.length}
              </span>
              <button
                className="pg-btn"
                disabled={displayIdx === currentRecords.length - 1 || !!flip}
                onClick={() => turnPage(1)}
              >
                ›
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}