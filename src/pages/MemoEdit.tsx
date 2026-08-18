import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import {
  useBucketBoard,
  useCategories,
  useUpdateMemo,
  useDeleteMemo,
} from '../hooks/useBucketBoard';
import './MemoEdit.css';

export default function MemoEdit() {
  const { memoId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useBucketBoard();
  const categoryQuery = useCategories();
  const update = useUpdateMemo();
  const remove = useDeleteMemo();

  const memo = data?.memos.find((m) => m.memoId === Number(memoId));

  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [confirming, setConfirming] = useState(false);

  /* 보드 데이터가 늦게 도착할 수 있어서 도착 시점에 폼을 채웁니다 */
  useEffect(() => {
    if (!memo) return;
    setContent(memo.content);
    setCategoryId(memo.categoryId);
  }, [memo]);

  const goBack = () => navigate('/board');

  const categories =
    categoryQuery.data ??
    [...new Map(data?.memos.map((m) => [m.categoryId, m.categoryName]) ?? [])].map(
      ([id, name]) => ({ categoryId: id, categoryName: name }),
    );

  const handleSave = () => {
    if (!memo || !content.trim()) return;
    update.mutate(
      {
        memoId: memo.memoId,
        // 디자인은 이 화면에서 바꾸지 않으므로 원래 값을 그대로 보냅니다.
        body: { content: content.trim(), categoryId, memoDesignId: memo.designId },
      },
      { onSuccess: goBack },
    );
  };

  const handleDelete = () => {
    if (!memo) return;
    remove.mutate(memo.memoId, { onSuccess: goBack });
  };

  return (
    <div className="bm-page">
      <Header />

      <main className="bm-main edit-main">
        <button type="button" className="back-link" onClick={goBack}>
          ← 버킷보드
        </button>

        {isLoading ? (
          <div className="edit-card edit-empty">불러오는 중이에요.</div>
        ) : !memo ? (
          <div className="edit-card edit-empty">
            메모지를 찾을 수 없어요. 이미 삭제됐거나 완료된 메모지일 수 있습니다.
          </div>
        ) : (
          <div className="edit-card">
            <h1>메모지 수정</h1>

            <div className="edit-field">
              <label htmlFor="edit-content">하고 싶은 일</label>
              <textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                maxLength={60}
              />
            </div>

            <div className="edit-field">
              <label>태그</label>
              <div className="chip-row">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.categoryId}
                    className={`chip${categoryId === c.categoryId ? ' on' : ''}`}
                    onClick={() => setCategoryId(c.categoryId)}
                  >
                    #{c.categoryName}
                  </button>
                ))}
              </div>
            </div>

            <div className="edit-actions">
              <button
                type="button"
                className="danger-ghost"
                onClick={() => setConfirming(true)}
              >
                삭제
              </button>
              <div className="edit-actions-right">
                <button type="button" className="ghost" onClick={goBack}>
                  취소
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={!content.trim() || update.isPending}
                  onClick={handleSave}
                >
                  {update.isPending ? '저장 중…' : '저장'}
                </button>
              </div>
            </div>

            {confirming && (
              <div className="confirm-inline" role="alertdialog">
                <p>이 메모지를 삭제할까요? 삭제하면 되돌릴 수 없어요.</p>
                <div className="confirm-actions">
                  <button type="button" className="ghost" onClick={() => setConfirming(false)}>
                    취소
                  </button>
                  <button
                    type="button"
                    className="danger"
                    disabled={remove.isPending}
                    onClick={handleDelete}
                  >
                    {remove.isPending ? '삭제 중…' : '삭제하기'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}