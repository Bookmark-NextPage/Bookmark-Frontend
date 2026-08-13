import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from 'react';
import type { BucketMemo } from '../types/bucket';

/**
 * 메모지 기본 가로:세로 비율.
 * CSS의 퍼센트 패딩은 항상 "가로" 기준으로 계산되기 때문에,
 * 세로 여백에는 이 비율을 곱해서 보정합니다.
 * BucketBoard.tsx 의 MEMO_H / MEMO_W 와 같은 값이어야 합니다.
 */
// const MEMO_RATIO = 154 / 184;

interface ContentArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * 백엔드 값이 0이거나 비어 있어도 글씨가 사라지지 않도록 막아줍니다.
 * (memo_design 시드 데이터가 전부 0.0 으로 들어와 있는 상태 대비)
 */
const safeArea = (a: ContentArea): ContentArea => {
  const pick = (v: number, fallback: number) =>
    Number.isFinite(v) && v > 0 ? v : fallback;

  const left = pick(a.left, 22);
  const top = pick(a.top, 20);
  // 좌우/상하 합이 100%를 넘지 않도록 잘라냅니다.
  const width = Math.min(pick(a.width, 56), 100 - left);
  const height = Math.min(pick(a.height, 60), 100 - top);

  return { left, top, width, height };
};

interface Props {
  memo: BucketMemo;
  x: number;
  y: number;
  imageUrl?: string;
  color: string;
  ink: string;
  /** 메모지 전체를 100%로 봤을 때 글씨가 들어갈 안전 영역 */
  contentArea: ContentArea;
  dragging: boolean;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>, memo: BucketMemo) => void;
  onEdit: (memo: BucketMemo) => void;
  onDelete: (memo: BucketMemo) => void;
  onComplete: (memo: BucketMemo) => void;
  onNudge: (memo: BucketMemo, dx: number, dy: number) => void;
}

export default function MemoCard({
  memo,
  x,
  y,
  imageUrl,
  // color,
  ink,
  contentArea,
  dragging,
  onPointerDown,
  onEdit,
  onDelete,
  onComplete,
  onNudge,
}: Props) {
  const a = safeArea(contentArea);

  const style = {
    transform: `translate3d(${x}px, ${y}px, 0)`,
    // 이미지가 배경이므로 색은 깔지 않습니다.
    // (색을 깔면 이미지 투명 영역이나 잘린 부분에 색이 비쳐요)
    backgroundColor: 'transparent',
    backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
    color: ink,

    // 글씨 영역을 % 로 직접 지정합니다. 패딩을 안 쓰므로 box-sizing 영향이 없어요.
    '--memo-content-left': `${a.left}%`,
    '--memo-content-top': `${a.top}%`,
    '--memo-content-width': `${a.width}%`,
    '--memo-content-height': `${a.height}%`,
  } as CSSProperties;

  return (
    <div
      className={`memo${dragging ? ' is-dragging' : ''}`}
      style={style}
      onPointerDown={(e) => onPointerDown(e, memo)}
      onDoubleClick={() => onEdit(memo)}
      role="button"
      tabIndex={0}
      aria-label={`${memo.categoryName} 메모지: ${memo.content}. 방향키로 옮기고 Enter로 수정할 수 있어요.`}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 20 : 4;
        if (e.key === 'ArrowLeft') { e.preventDefault(); onNudge(memo, -step, 0); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); onNudge(memo, step, 0); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); onNudge(memo, 0, -step); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); onNudge(memo, 0, step); }
        else if (e.key === 'Enter') { e.preventDefault(); onEdit(memo); }
      }}
    >
      <div className="memo-body">
        <div className="memo-tag">#{memo.categoryName}</div>
        <p className="memo-content">{memo.content}</p>
      </div>

      <div className="memo-tools" data-no-drag>
        <button type="button" onClick={() => onEdit(memo)} aria-label="메모지 수정">
          <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden>
            <path
              d="M11.2 1.6a1.4 1.4 0 0 1 2 2L5.6 11.2 2.4 12l.8-3.2 8-7.2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button type="button" onClick={() => onDelete(memo)} aria-label="메모지 삭제">
          <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden>
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className="memo-done"
        data-no-drag
        onClick={() => onComplete(memo)}
      >
        이뤘어요 ✓
      </button>
    </div>
  );
}