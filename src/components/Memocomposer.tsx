import { useEffect, useState } from 'react';
import { safeImageUrl } from '../utils/image';
import type { MemoCategory, MemoDesign } from '../types/bucket';

interface Props {
  categories: MemoCategory[];
  designs: MemoDesign[];
  /** 메모지 이미지가 아직 안 왔을 때 깔아둘 색 */
  fallbackColors: string[];
  ink: string;
  themeName?: string;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (content: string, categoryId: number, memoDesignId: number) => void;
  onAddCategory: (name: string) => void;
}

export default function MemoComposer({
  categories,
  designs,
  fallbackColors,
  ink,
  themeName,
  pending,
  onClose,
  onSubmit,
  onAddCategory,
}: Props) {
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.categoryId ?? 0);
  const [designId, setDesignId] = useState<number>(designs[0]?.designId ?? 0);
  const [tagInputOpen, setTagInputOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* 새 태그가 목록에 들어오면 자동으로 선택해줍니다 */
  useEffect(() => {
    if (!categories.some((c) => c.categoryId === categoryId) && categories.length) {
      setCategoryId(categories[categories.length - 1].categoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const submitTag = () => {
    const name = newTag.trim();
    if (!name) return;
    onAddCategory(name);
    setNewTag('');
    setTagInputOpen(false);
  };

  const colorAt = (i: number) => fallbackColors[i % fallbackColors.length];
  const selectedIdx = Math.max(0, designs.findIndex((d) => d.designId === designId));
  const previewImage = safeImageUrl(designs[selectedIdx]?.memoImageUrl);
  const previewTag =
    categories.find((c) => c.categoryId === categoryId)?.categoryName ?? '태그';

  const canSubmit = content.trim().length > 0 && categoryId !== 0 && !pending;

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <div
        className="composer"
        role="dialog"
        aria-modal="true"
        aria-label="새 메모지 붙이기"
      >
        <div className="composer-head">
          <div>
            <h2>새 메모지 붙이기</h2>
            <p>하고 싶은 일을 적고, 메모지 디자인을 골라 보드에 붙여보세요.</p>
          </div>
          <button type="button" className="composer-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* 하고 싶은 일 */}
        <div className="composer-field">
          <label htmlFor="memo-content">하고 싶은 일</label>
          <input
            id="memo-content"
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="예: 제주도에서 일출 보기"
            maxLength={60}
          />
        </div>

        {/* 태그 */}
        <div className="composer-field">
          <label>태그 선택 / 추가</label>
          <div className="chip-row">
            {categories.map((c) => (
              <button
                type="button"
                key={c.categoryId}
                className={`chip${categoryId === c.categoryId ? ' on' : ''}`}
                onClick={() => setCategoryId(c.categoryId)}
              >
                {c.categoryName}
              </button>
            ))}

            {tagInputOpen ? (
              <span className="chip chip-input">
                <input
                  autoFocus
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitTag();
                    if (e.key === 'Escape') setTagInputOpen(false);
                  }}
                  placeholder="태그 이름"
                  maxLength={10}
                />
                <button type="button" onClick={submitTag}>추가</button>
              </span>
            ) : (
              <button type="button" className="chip chip-ghost" onClick={() => setTagInputOpen(true)}>
                + 새 태그
              </button>
            )}
          </div>
        </div>

        {/* 메모지 디자인 — 테마는 보드 상단에서 고르므로 여기서는 현재 테마의 메모지만 보여줍니다 */}
        <div className="composer-field">
          <label>메모지 디자인</label>
          <p className="field-hint">
            {themeName ? `'${themeName}' 테마의 메모지예요. ` : ''}
            마음에 드는 종이를 골라보세요.
          </p>

          <div className="design-row">
            {(designs.length ? designs : fallbackColors).map((d, i) => {
              const isDesign = typeof d !== 'string';
              const id = isDesign ? d.designId : i;
              const url = isDesign ? safeImageUrl(d.memoImageUrl) : undefined;
              return (
                <button
                  type="button"
                  key={id}
                  className={`design-tile${designId === id ? ' on' : ''}`}
                  style={{
                    backgroundColor: colorAt(i),
                    backgroundImage: url ? `url("${url}")` : undefined,
                  }}
                  onClick={() => setDesignId(id)}
                  aria-label={`${i + 1}번 메모지`}
                  aria-pressed={designId === id}
                />
              );
            })}

            {/* ⚠️ 메모지 이미지 업로드 API가 붙으면 여기서 presigned URL → S3 PUT 순서로 연결하세요. */}
            <button type="button" className="design-tile design-upload" disabled title="곧 열려요">
              <span>+</span>
              내 사진
            </button>
          </div>
        </div>

        {/* 미리보기 */}
        <div className="composer-preview">
          <div
            className="memo memo-preview"
            style={{
              backgroundColor: colorAt(selectedIdx),
              backgroundImage: previewImage ? `url("${previewImage}")` : undefined,
              color: ink,
            }}
          >
            <div className="memo-body">
              <div className="memo-tag">#{previewTag}</div>
              <p className="memo-content">{content || '미리보기'}</p>
            </div>
          </div>
          <span className="preview-caption">미리보기</span>
        </div>

        <div className="composer-actions">
          <button type="button" className="ghost" onClick={onClose}>취소</button>
          <button
            type="button"
            className="primary"
            disabled={!canSubmit}
            onClick={() => onSubmit(content.trim(), categoryId, designId)}
          >
            {pending ? '붙이는 중…' : '보드에 붙이기'}
          </button>
        </div>
      </div>
    </>
  );
}