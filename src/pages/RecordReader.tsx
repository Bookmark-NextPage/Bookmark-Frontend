import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import {
  getCollectBook,
  getRecordDetail,
  likeRecord,
  unlikeRecord,
  addRecordComment,
} from '../api/collectBook';
import type { RecordDetail } from '../types/collectBook';
import './RecordReader.css';

/** ISO datetime → 'YYYY.MM.DD' */
function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10).replace(/-/g, '.');
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export default function RecordReader() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const rid = recordId ? Number(recordId) : NaN;

  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [siblingIds, setSiblingIds] = useState<number[]>([]);

  useEffect(() => {
    if (Number.isNaN(rid)) {
      setError('잘못된 접근이에요.');
      setLoading(false);
      return;
    }
    setLoading(true);
    getRecordDetail(rid)
      .then((res) => {
        setRecord(res);
        setLoading(false);
        return getCollectBook(res.collectBookId).then((book) => {
          const chapter = book.chapters.find((c) => c.chapterId === res.chapterId);
          setSiblingIds(chapter ? chapter.records.map((r) => r.recordId) : [res.recordId]);
        });
      })
      .catch((err) => {
        console.error('기록 불러오기 실패:', err);
        setError('기록을 불러오지 못했어요.');
        setLoading(false);
      });
  }, [rid]);

  const curIdx = record ? siblingIds.indexOf(record.recordId) : -1;

  const goSibling = (dir: 1 | -1) => {
    const target = curIdx + dir;
    if (target < 0 || target >= siblingIds.length) return;
    navigate(`/record/${siblingIds[target]}`);
  };

  const toggleLike = async () => {
    if (!record) return;
    const prev = record;
    setRecord({
      ...record,
      isLiked: !record.isLiked,
      likeCount: record.likeCount + (record.isLiked ? -1 : 1),
    });
    try {
      if (prev.isLiked) await unlikeRecord(prev.recordId);
      else await likeRecord(prev.recordId);
    } catch (err) {
      console.error('좋아요 실패:', err);
      setRecord(prev);
    }
  };

  const submitComment = async () => {
    if (!record) return;
    const val = commentDraft.trim();
    if (!val) return;
    try {
      await addRecordComment(record.recordId, val);
      const fresh = await getRecordDetail(record.recordId);
      setRecord(fresh);
      setCommentDraft('');
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했어요.');
    }
  };

  if (loading) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="cb-empty">불러오는 중...</div>
        </main>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="bm-page">
        <Header />
        <main className="bm-main">
          <div className="cb-empty">
            <p>{error ?? '기록을 찾을 수 없어요.'}</p>
            <button className="btn-ghost" onClick={() => navigate(-1)}>
              ← 돌아가기
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
        <div className="reader-top">
          <button className="btn-ghost" onClick={() => navigate(`/collect/${record.collectBookId}`)}>
            ← 목차
          </button>
          <div className="page-sub">
            {fmtDate(record.recordCreatedAt)} · {record.chapterName}
          </div>
        </div>

        <div className="reader-stage">
          <div className="reader">
            <div className="r-half left">
              <div className="r-meta">
                {fmtDate(record.recordCreatedAt)}
                {record.keywords[0] && <span className="r-theme"># {record.keywords[0]}</span>}
              </div>
              <div className="r-title">{record.title}</div>
              <div className="r-text">{record.content}</div>

              {record.imageUrls.length > 0 && (
                <div className="r-photos">
                  {record.imageUrls.map((url, i) => (
                    <div className="rp" key={i}>
                      <img src={url} alt="" className="rp-img" />
                    </div>
                  ))}
                </div>
              )}

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
                    placeholder="댓글을 남겨보세요"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                  />
                  <button className="btn-fill" onClick={submitComment}>
                    등록
                  </button>
                </div>
              </div>
            </div>

            <div className="r-half right">
              <div className="ai-art">
                <div className="art-label">AI 다이어리 · 기록 기반 자동 생성</div>
                {record.aiImageUrl ? (
                  <img src={record.aiImageUrl} alt="" className="ai-img" />
                ) : (
                  <div className="a-quote">
                    {record.keywords[0] ? `# ${record.keywords[0]}` : ''}
                  </div>
                )}
              </div>
              <div
                className="reader-bookmark"
                onClick={() => navigate(`/collect/${record.collectBookId}`)}
              >
                <div className="bm-t">목차</div>
              </div>
            </div>
          </div>
        </div>

        {siblingIds.length > 1 && (
          <div className="page-nav">
            <button className="pg-btn" disabled={curIdx <= 0} onClick={() => goSibling(-1)}>
              ‹
            </button>
            <span className="pg-count">
              {curIdx + 1} / {siblingIds.length}
            </span>
            <button
              className="pg-btn"
              disabled={curIdx >= siblingIds.length - 1}
              onClick={() => goSibling(1)}
            >
              ›
            </button>
          </div>
        )}
      </main>
    </div>
  );
}