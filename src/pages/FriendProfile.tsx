import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getFriendPage, deleteFriend } from '../api/friend';
import {
  getCollectBook,
  getChapterRecords,
  getRecord,
  likeRecord,
  unlikeRecord,
  addComment,
} from '../api/collectBook';
import { bookGradient } from '../utils/bookColor';
import type {
  FriendPageResponse,
  PublicCollectBook,
  CollectBookDetail,
  Chapter,
  ChapterRecordSummary,
  RecordDetail,
} from '../types/collectBook';
import './FriendProfile.css';

type Screen = 'shelf' | 'toc' | 'reader';

export default function FriendProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const friendUserId = id ? Number(id) : NaN;

  const [screen, setScreen] = useState<Screen>('shelf');

  // 화면 1: 친구 프로필 + 공개 책장
  const [friend, setFriend] = useState<FriendPageResponse | null>(null);
  const [loadingFriend, setLoadingFriend] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 화면 2: 콜렉트북 상세 + 챕터
  const [book, setBook] = useState<CollectBookDetail | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [chapterRecords, setChapterRecords] = useState<ChapterRecordSummary[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // 화면 3: 기록 상세 (리더)
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [readerIdx, setReaderIdx] = useState(0);
  const [commentDraft, setCommentDraft] = useState('');

  // ---------- 화면 1: 친구 페이지 로드 ----------
  useEffect(() => {
    if (Number.isNaN(friendUserId)) {
      setError('잘못된 접근이에요.');
      setLoadingFriend(false);
      return;
    }
    getFriendPage(friendUserId)
      .then((res) => {
        setFriend(res);
        setLoadingFriend(false);
      })
      .catch((err) => {
        console.error('친구 페이지 불러오기 실패:', err);
        setError('친구 정보를 불러오지 못했어요.');
        setLoadingFriend(false);
      });
  }, [friendUserId]);

  // ---------- 화면 2: 책 열기 ----------
  const openBook = async (b: PublicCollectBook) => {
    try {
      const detail = await getCollectBook(b.collectBookId);
      setBook(detail);
      // 기록이 있는 마지막 챕터를 기본 선택
      const withRecords = detail.chapters.filter((c) => c.recordCount > 0);
      const firstChapter = withRecords.length
        ? withRecords[withRecords.length - 1]
        : detail.chapters[detail.chapters.length - 1];
      setScreen('toc');
      if (firstChapter) {
        await selectChapter(detail.collectBookId, firstChapter.chapterId);
      } else {
        setActiveChapterId(null);
        setChapterRecords([]);
      }
    } catch (err) {
      console.error('콜렉트북 불러오기 실패:', err);
      alert('콜렉트북을 불러오지 못했어요.');
    }
  };

  // ---------- 챕터 선택 → 기록 목록 로드 ----------
  const selectChapter = async (collectBookId: number, chapterId: number) => {
    setActiveChapterId(chapterId);
    setLoadingRecords(true);
    try {
      const records = await getChapterRecords(collectBookId, chapterId);
      setChapterRecords(records);
    } catch (err) {
      console.error('챕터 기록 목록 불러오기 실패:', err);
      setChapterRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // ---------- 화면 3: 리더 열기 ----------
  const openReader = async (idx: number) => {
    if (!book) return;
    const target = chapterRecords[idx];
    if (!target) return;
    try {
      const detail = await getRecord(book.collectBookId, target.recordId);
      setRecord(detail);
      setReaderIdx(idx);
      setScreen('reader');
    } catch (err) {
      console.error('기록 상세 불러오기 실패:', err);
      alert('기록을 불러오지 못했어요.');
    }
  };

  // ---------- 리더 페이지 이동 ----------
  const moveReader = async (dir: 1 | -1) => {
    if (!book) return;
    const target = readerIdx + dir;
    if (target < 0 || target >= chapterRecords.length) return;
    const next = chapterRecords[target];
    try {
      const detail = await getRecord(book.collectBookId, next.recordId);
      setRecord(detail);
      setReaderIdx(target);
    } catch (err) {
      console.error('기록 이동 실패:', err);
    }
  };

  // ---------- 좋아요 토글 ----------
  const toggleLike = async () => {
    if (!record || !book) return;
    const prev = record;
    // 낙관적 업데이트
    setRecord({
      ...record,
      isLiked: !record.isLiked,
      likeCount: record.likeCount + (record.isLiked ? -1 : 1),
    });
    try {
      if (prev.isLiked) {
        await unlikeRecord(book.collectBookId, prev.recordId);
      } else {
        await likeRecord(book.collectBookId, prev.recordId);
      }
    } catch (err) {
      console.error('좋아요 실패:', err);
      setRecord(prev); // 실패 시 롤백
    }
  };

  // ---------- 댓글 작성 ----------
  const submitComment = async () => {
    if (!record || !book) return;
    const val = commentDraft.trim();
    if (!val) return;
    try {
      const created = await addComment(book.collectBookId, record.recordId, val);
      setRecord({
        ...record,
        comments: [...record.comments, created],
        commentCount: record.commentCount + 1,
      });
      setCommentDraft('');
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했어요.');
    }
  };

  // ---------- 친구 삭제 ----------
  const handleDeleteFriend = async () => {
    if (!friend) return;
    const ok = window.confirm(`${friend.name}님을 친구에서 삭제할까요?`);
    if (!ok) return;
    try {
      await deleteFriend(friend.userId);
      navigate('/mypage');
    } catch (err) {
      console.error('친구 삭제 실패:', err);
      alert('친구 삭제에 실패했어요.');
    }
  };

  const activeChapter: Chapter | undefined = useMemo(
    () => book?.chapters.find((c) => c.chapterId === activeChapterId),
    [book, activeChapterId],
  );

  // ---------- 렌더링 ----------
  if (loadingFriend) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="fr-empty">불러오는 중...</div>
        </main>
      </div>
    );
  }

  if (error || !friend) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="fr-empty">
            <p>{error ?? '친구를 찾을 수 없어요.'}</p>
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
        {/* ===== 화면 1: 프로필 + 책장 ===== */}
        {screen === 'shelf' && (
          <>
            <div className="page-head">
              <button className="btn-ghost" onClick={() => navigate('/mypage')}>
                ← 친구 목록
              </button>
            </div>

            <div className="fr-head">
              <div className="mp-avatar">{friend.name.slice(0, 1)}</div>
              <div>
                <div className="mp-name">{friend.name}</div>
                <div className="mp-bio">
                  @{friend.loginId}
                  {friend.bio ? ` · ${friend.bio}` : ''}
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
              {friend.publicCollectBooks.length === 0 ? (
                <div className="fr-empty-books">아직 공개된 콜랙트북이 없어요.</div>
              ) : (
                <div className="fr-books">
                  {friend.publicCollectBooks.map((b) => (
                    <div
                      key={b.collectBookId}
                      className="fr-book"
                      style={{ background: bookGradient(b.bookColor) }}
                      onClick={() => openBook(b)}
                    >
                      <span className="yr">{b.year}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== 화면 2: 목차 ===== */}
        {screen === 'toc' && book && (
          <>
            <div className="page-head">
              <button className="btn-ghost" onClick={() => setScreen('shelf')}>
                ← 책장
              </button>
              <div className="page-sub">'자세히 보기'로 기록 페이지를 펼칩니다. (읽기 전용)</div>
            </div>
            <div className="collect-open">
              <div className="cpage-l">
                <div className="vol">{book.chapterType === 'MONTHLY' ? '월 단위' : '커스텀'}</div>
                <div className="book-title">{book.title}</div>
                <div className="book-range">
                  {book.year}. 01. 01 — {book.year}. 12. 31
                </div>
                <div className="toc-label">CHAPTERS</div>
                <div>
                  {book.chapters.map((c) => (
                    <div
                      key={c.chapterId}
                      className={`chapter ${c.recordCount === 0 ? 'empty' : ''} ${
                        activeChapterId === c.chapterId ? 'on' : ''
                      }`}
                      onClick={() => selectChapter(book.collectBookId, c.chapterId)}
                    >
                      <span className="num">Ch. {String(c.sequence).padStart(2, '0')}</span>
                      <span className="cname">{c.name}</span>
                      <span className="cnt">{c.recordCount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cpage-r">
                {loadingRecords ? (
                  <div className="empty-state">
                    <div className="es-t">불러오는 중...</div>
                  </div>
                ) : chapterRecords.length === 0 ? (
                  <div className="empty-state">
                    <div className="es-t">{activeChapter?.name ?? '챕터'}</div>
                    <div style={{ fontSize: 12 }}>이 챕터에는 기록이 없어요.</div>
                  </div>
                ) : (
                  <>
                    <div className="ch-head">{activeChapter?.name ?? '챕터'}</div>
                    <div className="ch-date">기록 {chapterRecords.length}개</div>
                    {chapterRecords.map((r, i) => (
                      <div className="prev-card" key={r.recordId}>
                        <div className="thumb">IMG</div>
                        <div>
                          <div className="pv-title">{r.title}</div>
                          {r.summary && <div className="pv-txt">{r.summary}</div>}
                          <div className="pv-meta">
                            {r.keywords?.[0] && <span className="pv-theme"># {r.keywords[0]}</span>}
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

        {/* ===== 화면 3: 리더 ===== */}
        {screen === 'reader' && book && record && (
          <>
            <div className="reader-top">
              <button className="btn-ghost" onClick={() => setScreen('toc')}>
                ← 목차
              </button>
              <div className="page-sub">
                {book.title} · {record.chapterName}
              </div>
            </div>
            <div className="reader-stage">
              <div className="reader">
                <div className="reader-bookmark" onClick={() => setScreen('toc')}>
                  <div className="bm-t">목차</div>
                </div>

                {/* 왼쪽: 본문 + 좋아요/댓글 */}
                <div className="r-half left">
                  <div className="r-meta">
                    {record.recordCreatedAt}
                    {record.keywords[0] && <span className="r-theme"># {record.keywords[0]}</span>}
                  </div>
                  <div className="r-title">{record.title}</div>
                  <div className="r-text">{record.content}</div>
                  <div className="r-photos">
                    {record.imageUrls.map((url, i) => (
                      <div className="rp" key={i}>
                        {url ? (
                          <img
                            src={url}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                          />
                        ) : (
                          `IMG ${i + 1}`
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="engage">
                    <button className={`like-btn ${record.isLiked ? 'on' : ''}`} onClick={toggleLike}>
                      ♥ <span>{record.likeCount}</span>
                    </button>
                    <span className="cm-count">댓글 {record.commentCount}</span>
                  </div>
                  <div className="comments">
                    {record.comments.map((c) => (
                      <div className="cm-item" key={c.commentId}>
                        <b>{c.nickname}</b>
                        {c.content}
                      </div>
                    ))}
                    <div className="cm-add">
                      <input
                        className="cm-input"
                        placeholder="댓글을 남겨보세요"
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitComment();
                        }}
                      />
                      <button className="btn-fill" onClick={submitComment}>
                        등록
                      </button>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: AI 아트 */}
                <div className="r-half right">
                  <div className="ai-art">
                    <div className="art-label">{friend.name}님의 기록</div>
                    {record.aiImageUrl ? (
                      <img
                        src={record.aiImageUrl}
                        alt=""
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="a-quote"># {record.keywords[0] ?? ''}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="page-nav">
              <button className="pg-btn" disabled={readerIdx === 0} onClick={() => moveReader(-1)}>
                ‹
              </button>
              <span className="pg-count">
                {readerIdx + 1} / {chapterRecords.length}
              </span>
              <button
                className="pg-btn"
                disabled={readerIdx === chapterRecords.length - 1}
                onClick={() => moveReader(1)}
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