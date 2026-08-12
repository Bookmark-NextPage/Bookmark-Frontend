import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import { useCollectBook } from '../hooks/useCollectBook';
import { deleteCollectBook, updateVisibility } from '../api/collectBook';
import { visibilityLabel } from '../utils/bookColor';
import type { Visibility } from '../types/collectBook';
import './CollectBookDetail.css';

const VISIBILITY_OPTIONS: Visibility[] = ['FRIENDS', 'PUBLIC', 'PRIVATE'];

export default function CollectBookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const collectBookId = id ? Number(id) : NaN;

  const { data: book, isLoading, isError } = useCollectBook(collectBookId);

  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [visMenuOpen, setVisMenuOpen] = useState(false);
  const [visibility, setVisibilityState] = useState<Visibility>('PRIVATE');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!book) return;
    setVisibilityState(book.visibility);
    const withRecords = book.chapters.filter((c) => c.recordCount > 0);
    const target = withRecords.length
      ? withRecords[withRecords.length - 1]
      : book.chapters[book.chapters.length - 1];
    setActiveChapterId(target?.chapterId ?? null);
  }, [book]);

  const activeChapter = book?.chapters.find((c) => c.chapterId === activeChapterId);

  const handleChangeVisibility = async (v: Visibility) => {
    if (!book) return;
    setVisMenuOpen(false);
    const prev = visibility;
    setVisibilityState(v);
    try {
      await updateVisibility(book.collectBookId, v);
    } catch (err) {
      console.error('공개범위 수정 실패:', err);
      setVisibilityState(prev);
      alert('공개범위 변경에 실패했어요.');
    }
  };

  const handleDelete = async () => {
    if (!book) return;
    try {
      await deleteCollectBook(book.collectBookId);
      queryClient.invalidateQueries({ queryKey: ['collectBooks'] });
      navigate('/collect');
    } catch (err) {
      console.error('책 삭제 실패:', err);
      alert('책 삭제에 실패했어요.');
    }
  };

  if (isLoading) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="cb-empty">불러오는 중...</div>
        </main>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="cb-empty">
            <p>콜랙트북을 불러오지 못했어요.</p>
            <button className="btn-ghost" onClick={() => navigate('/collect')}>
              ← 책장으로
            </button>
          </div>
        </main>
      </div>
    );
  }

  const records = activeChapter?.records ?? [];

  return (
    <div className="bm-page">
      <Header />
      <main className="bm-main">
        <div className="page-head">
          <button className="btn-ghost" onClick={() => navigate('/collect')}>
            ← 책장
          </button>
          <div className="ph-actions">
            <span className="page-sub">'자세히 보기'로 기록 페이지를 펼칩니다.</span>
            <button className="btn-fill" onClick={() => navigate('/collect/record/new')}>
              + 기록 추가
            </button>
          </div>
        </div>

        <div className="collect-open">
          <div className="cpage-l">
            <div className="vol">VOLUME</div>
            <div className="book-title-big">{book.year}</div>
            <div className="book-range">
              {book.year}. 01. 01 — {book.year}. 12. 31
            </div>

            <div className="vis-row">
              <span>공개 범위</span>
              <div className="vis-select">
                <button className="vis-btn" onClick={() => setVisMenuOpen((v) => !v)}>
                  {visibilityLabel(visibility)} ▾
                </button>
                {visMenuOpen && (
                  <>
                    <div className="vis-backdrop" onClick={() => setVisMenuOpen(false)} />
                    <div className="vis-menu">
                      {VISIBILITY_OPTIONS.map((v) => (
                        <div key={v} onClick={() => handleChangeVisibility(v)}>
                          {visibilityLabel(v)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {!confirmDelete ? (
              <button className="del-book-btn" onClick={() => setConfirmDelete(true)}>
                이 책 삭제
              </button>
            ) : (
              <div className="del-confirm">
                <div className="del-msg">이 책과 안의 모든 기록이 삭제돼요. 되돌릴 수 없어요.</div>
                <div className="del-actions">
                  <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>
                    취소
                  </button>
                  <button className="del-go" onClick={handleDelete}>
                    삭제하기
                  </button>
                </div>
              </div>
            )}

            <div className="toc-label">
              CHAPTERS · {book.chapterType === 'MONTHLY' ? '월 단위' : '직접 설정'}
            </div>
            <div>
              {book.chapters.map((c) => (
                <div
                  key={c.chapterId}
                  className={`chapter ${c.recordCount === 0 ? 'empty' : ''} ${
                    activeChapterId === c.chapterId ? 'on' : ''
                  }`}
                  onClick={() => setActiveChapterId(c.chapterId)}
                >
                  <span className="num">Ch. {String(c.sequence).padStart(2, '0')}</span>
                  <span className="cname">{c.name}</span>
                  <span className="cnt">{c.recordCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cpage-r">
            {!activeChapter ? (
              <div className="empty-state">
                <div className="es-t">챕터를 선택해주세요.</div>
              </div>
            ) : records.length === 0 ? (
              <div className="empty-state">
                <div className="es-t">{activeChapter.name}</div>
                <div style={{ fontSize: 12 }}>이 챕터에는 기록이 없어요.</div>
              </div>
            ) : (
              <>
                <div className="ch-head">
                  Chapter {String(activeChapter.sequence).padStart(2, '0')}. {activeChapter.name}
                </div>
                <div className="ch-date">기록 {records.length}개</div>
                {records.map((r) => (
                  <div className="prev-card" key={r.recordId}>
                    <div className="thumb">
                      {r.imageUrl ? <img src={r.imageUrl} alt="" className="thumb-img" /> : 'IMG'}
                    </div>
                    <div className="prev-body">
                      <div className="pv-title">{r.title}</div>
                      <div className="pv-txt">{r.content}</div>
                      <div className="pv-meta">
                        {r.keywords[0] && <span className="pv-theme"># {r.keywords[0]}</span>}
                        <span className="pv-open" onClick={() => navigate(`/record/${r.recordId}`)}>
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
      </main>
    </div>
  );
}