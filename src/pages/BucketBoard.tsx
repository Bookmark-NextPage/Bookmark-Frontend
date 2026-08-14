import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import MemoCard from '../components/MemoCard';
import MemoComposer from '../components/Memocomposer';
import CompleteDialog from '../components/CompleteDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  useBucketBoard,
  useCategories,
  useBoardThemes,
  useMoveMemo,
  useCreateMemo,
  useDeleteMemo,
  useCompleteMemo,
  useSelectBoardTheme,
  useCreateCategory,
  BUCKET_BOARD_KEY,
} from '../hooks/useBucketBoard';
import { getThemeStyle, THEME_DESC, FALLBACK_THEMES } from '../constants/Boardthemes';
import { preloadImages, safeImageUrl } from '../utils/image';
import type { BoardTheme, BucketBoardResponse, BucketMemo, MemoCategory, MemoDesign } from '../types/bucket';
import './BucketBoard.css';

/* ------------------------------------------------------------------ */
/* 좌표 규칙                                                            */
/* ------------------------------------------------------------------ */

type PosMode = 'ratio' | 'px';

/**
 * 백엔드 xPos / yPos 해석 방식.
 * - 'ratio': 0~1 비율. 창 너비가 달라져도 배치가 유지돼서 기본값으로 뒀어요.
 *            yPos는 BOARD_BASE_H 기준이라 보드가 길어지면 1을 넘길 수 있습니다.
 * - 'px'   : 화면 픽셀 절대좌표.
 * 백엔드와 합의된 쪽으로 이 한 줄만 바꾸면 됩니다.
 */
const POS_MODE = 'ratio' as PosMode;

/** 메모지 크기. 이미지 비율이 찌그러지지 않게 고정합니다. CSS와 반드시 동일하게. */
const MEMO_W = 184;
// const MEMO_H = 154;
/**
 * 보드 높이 계산용 여유값.
 * 메모지 세로가 내용에 따라 늘어나므로, 가장 아래 메모지가 잘리지 않게 넉넉히 잡습니다.
 * (content는 60자 제한이라 실제로는 250px 안쪽입니다)
 */
const MEMO_H_MAX = 320;

const BOARD_PAD = 28;
const BOARD_MIN_H = 560;
const BOARD_BASE_H = 720; // ratio 모드에서 yPos = 1 이 몇 px인지

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const toPixel = (memo: BucketMemo, boardW: number) =>
  POS_MODE === 'px'
    ? { x: memo.posX, y: memo.posY }
    : { x: memo.posX * boardW, y: memo.posY * BOARD_BASE_H };

/** 화면 좌표 → 서버 저장값. 이동 API는 xPos / yPos 이름을 씁니다. */
const toStored = (x: number, y: number, boardW: number) =>
  POS_MODE === 'px'
    ? { xPos: Math.round(x), yPos: Math.round(y) }
    : {
        xPos: boardW ? Number((x / boardW).toFixed(4)) : 0,
        yPos: Number((y / BOARD_BASE_H).toFixed(4)),
      };

/* ------------------------------------------------------------------ */

interface DragState {
  memoId: number;
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
  moved: boolean;
}

type Pos = { x: number; y: number };

export default function BucketBoard() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useBucketBoard();
  const categoryQuery = useCategories();
  const themeQuery = useBoardThemes();
  const move = useMoveMemo();
  const create = useCreateMemo();
  const remove = useDeleteMemo();
  const complete = useCompleteMemo();
  const selectTheme = useSelectBoardTheme();
  const addCategory = useCreateCategory();

  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const [boardW, setBoardW] = useState(0);
  const [dragView, setDragView] = useState<(Pos & { memoId: number }) | null>(null);
  /** 드롭 직후 서버 응답 전까지 쓰는 위치. 메모지가 원래 자리로 튀는 걸 막아줍니다. */
  const [dropped, setDropped] = useState<Record<number, Pos>>({});

  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [newTagName, setNewTagName] = useState('');
  const [tagOpen, setTagOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [localTheme, setLocalTheme] = useState<BoardTheme | null>(null);
  const [applyingTheme, setApplyingTheme] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [completing, setCompleting] = useState<BucketMemo | null>(null);
  const [deleting, setDeleting] = useState<BucketMemo | null>(null);

  /* ---------------- 테마 / 이미지 ---------------- */

  const themes: BoardTheme[] = themeQuery.data?.boardThemes ?? FALLBACK_THEMES;
  const theme = localTheme ?? data?.theme;
  const style = getThemeStyle(theme?.themeId);
  const designs: MemoDesign[] = theme?.designs ?? [];
  const boardImage = safeImageUrl(theme?.themeImageUrl);
  const themeFont = theme?.font && theme.font !== 'string' ? theme.font : undefined;

  /** 보드에 들어오자마자 메모지 이미지를 전부 받아둡니다. 스크롤 중 뒤늦게 뜨는 걸 방지. */
  useEffect(() => {
    if (!data) return;
    preloadImages([
      safeImageUrl(data.theme.themeImageUrl),
      ...data.theme.designs.map((d) => safeImageUrl(d.memoImageUrl)),
    ]);
  }, [data]);

  /** designId → 이미지 URL + 대체색. 테마를 바꾸면 designId가 안 맞을 수 있어 첫 디자인으로 떨굽니다. */
  const toPercent = (v: number | undefined, fallback: number) => {
    if (typeof v !== 'number' || Number.isNaN(v) || v <= 0) return fallback;
    return v <= 1 ? v * 100 : v;
  };

  /** designId → 이미지 URL + 대체색 + 글씨 영역 */
  const resolveDesign = (designId: number) => {
    const idx = designs.findIndex((d) => d.designId === designId);
    const design = idx >= 0 ? designs[idx] : designs[0];
    const colorIdx = idx >= 0 ? idx : Math.abs(designId) % style.memoFallback.length;

    return {
      url: safeImageUrl(design?.memoImageUrl),
      color: style.memoFallback[colorIdx % style.memoFallback.length],
      contentLeft: toPercent(design?.contentLeft, 22),
      contentTop: toPercent(design?.contentTop, 22),
      contentWidth: toPercent(design?.contentWidth, 56),
      contentHeight: toPercent(design?.contentHeight, 56),
    };
  };

  /** 새 배경을 다 받은 뒤에 갈아끼웁니다. 흰 화면으로 깜빡이지 않게. */
  const applyTheme = async (t: BoardTheme) => {
    setApplyingTheme(t.themeId);
    await preloadImages([
      safeImageUrl(t.themeImageUrl),
      ...t.designs.map((d) => safeImageUrl(d.memoImageUrl)),
    ]);
    setLocalTheme(t);
    setApplyingTheme(null);
    selectTheme.mutate(t.themeId);
  };

  /* ---------------- 보드 너비 / 드래그 ---------------- */

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    setBoardW(el.clientWidth);
    const ro = new ResizeObserver((entries) => setBoardW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLoading]);

  const commitMove = (memoId: number, x: number, y: number) => {
    const w = boardRef.current?.clientWidth ?? 0;
    move.mutate(
      { memoId, ...toStored(x, y, w) },
      {
        onError: () =>
          setDropped((prev) => {
            const next = { ...prev };
            delete next[memoId];
            return next;
          }),
      },
    );
  };

  /* 드래그: 전역 pointer 이벤트로 처리 (보드 밖으로 나가도 끊기지 않게) */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      const board = boardRef.current;
      if (!d || !board) return;

      const rect = board.getBoundingClientRect();
      const x = clamp(e.clientX - rect.left - d.offsetX, 0, Math.max(0, rect.width - MEMO_W));
      const y = Math.max(0, e.clientY - rect.top - d.offsetY);

      d.x = x;
      d.y = y;
      d.moved = true;
      setDragView({ memoId: d.memoId, x, y });
    };

    const onUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;

      if (d.moved) {
        setDropped((prev) => ({ ...prev, [d.memoId]: { x: d.x, y: d.y } }));
        commitMove(d.memoId, d.x, d.y);
      }
      setDragView(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- 태그 ---------------- */

  /** 목록 API가 아직 안 붙었거나 실패하면 메모지에서 뽑아 씁니다. */
  const categories = useMemo<MemoCategory[]>(() => {
    if (categoryQuery.data?.length) return categoryQuery.data;
    const map = new Map<number, string>();
    data?.memos.forEach((m) => map.set(m.categoryId, m.categoryName));
    return [...map].map(([categoryId, categoryName]) => ({ categoryId, categoryName }));
  }, [categoryQuery.data, data]);

  const memos = useMemo(
    () =>
      (data?.memos ?? []).filter(
        (m) => activeCategory === 'all' || m.categoryId === activeCategory,
      ),
    [data, activeCategory],
  );

  /* ---------------- 좌표 / 보드 높이 ---------------- */

  const positions = useMemo(() => {
    const map = new Map<number, Pos>();
    memos.forEach((m) => map.set(m.memoId, dropped[m.memoId] ?? toPixel(m, boardW)));
    if (dragView) map.set(dragView.memoId, { x: dragView.x, y: dragView.y });
    return map;
  }, [memos, boardW, dropped, dragView]);

  /* 메모지가 아래로 내려갈수록 보드도 같이 길어집니다 */
  const boardHeight = useMemo(() => {
    let maxY = 0;
    positions.forEach((p) => {
      if (p.y > maxY) maxY = p.y;
    });
    return Math.max(BOARD_MIN_H, maxY + MEMO_H_MAX + BOARD_PAD * 2);
  }, [positions]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>, memo: BucketMemo) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

    const board = boardRef.current;
    if (!board) return;

    e.preventDefault();
    const rect = board.getBoundingClientRect();
    const cur = positions.get(memo.memoId) ?? { x: 0, y: 0 };

    dragRef.current = {
      memoId: memo.memoId,
      offsetX: e.clientX - (rect.left + cur.x),
      offsetY: e.clientY - (rect.top + cur.y),
      x: cur.x,
      y: cur.y,
      moved: false,
    };
    setDragView({ memoId: memo.memoId, ...cur });
    e.currentTarget.focus();
  };

  const handleNudge = (memo: BucketMemo, dx: number, dy: number) => {
    const cur = positions.get(memo.memoId) ?? { x: 0, y: 0 };
    const maxX = Math.max(0, (boardRef.current?.clientWidth ?? 0) - MEMO_W);
    const x = clamp(cur.x + dx, 0, maxX);
    const y = Math.max(0, cur.y + dy);
    setDropped((prev) => ({ ...prev, [memo.memoId]: { x, y } }));
    commitMove(memo.memoId, x, y);
  };

  /* ---------------- 메모지 추가 / 수정 ---------------- */

  const handleSubmitMemo = (content: string, categoryId: number, memoDesignId: number) => {
    // 보드 위 위치는 백엔드가 정해서 내려줍니다.
    create.mutate({ content, categoryId, memoDesignId });
    setComposerOpen(false);
  };

  /* ---------------- 완료 / 삭제 ---------------- */

  const finishComplete = (memo: BucketMemo, goToCollectBook: boolean) => {
    // 기록하기로 가면 기록 생성 API(useCreateRecord/useSaveAiImage)가
    // 성공 시 bucketBoard 캐시를 자동으로 무효화하므로,
    // 여기서는 그냥 이동만 하면 됩니다. (미리 지우지 않음 → 실제 저장 완료 시점에만 사라짐)
    if (goToCollectBook) {
      setCompleting(null);
      navigate(`/collect/record/new?memoId=${memo.memoId}`);
      return;
    }
    complete.mutate(memo.memoId, { onSuccess: () => setCompleting(null) });
  };

  const activeTagLabel =
    activeCategory === 'all'
      ? '전체'
      : categories.find((c) => c.categoryId === activeCategory)?.categoryName ?? '전체';

  return (
    <div className="bm-page">
      <Header />

      <main className="bm-main board-main">
        <div className="board-head">
          <div>
            <h1 className="board-title">버킷보드</h1>
            <p className="board-sub">
              하고 싶은 일을 메모지로 붙여두세요. 드래그로 옮기고, 완료하면 콜랙트북에 기록할지
              직접 고를 수 있어요.
            </p>
          </div>

          <div className="board-controls">
            <div className="ctrl-wrap">
              <button
                type="button"
                className="ctrl"
                onClick={() => { setTagOpen((v) => !v); setThemeOpen(false); }}
                aria-expanded={tagOpen}
              >
                태그: <b>{activeTagLabel}</b> <span aria-hidden>▾</span>
              </button>

              {tagOpen && (
                <>
                  <div className="popover-backdrop" onClick={() => setTagOpen(false)} />
                  <div className="popover tag-pop" role="menu">
                    <button
                      type="button"
                      className={activeCategory === 'all' ? 'on' : ''}
                      onClick={() => { setActiveCategory('all'); setTagOpen(false); }}
                    >
                      전체
                    </button>
                    {categories.map((c) => (
                      <button
                        type="button"
                        key={c.categoryId}
                        className={activeCategory === c.categoryId ? 'on' : ''}
                        onClick={() => { setActiveCategory(c.categoryId); setTagOpen(false); }}
                      >
                        #{c.categoryName}
                      </button>
                    ))}
                    <div className="tag-add">
                      <input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter' || !newTagName.trim()) return;
                          addCategory.mutate(newTagName.trim());
                          setNewTagName('');
                        }}
                        placeholder="새 태그 이름"
                        maxLength={10}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newTagName.trim()) return;
                          addCategory.mutate(newTagName.trim());
                          setNewTagName('');
                        }}
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="ctrl-wrap">
              <button
                type="button"
                className="ctrl"
                onClick={() => { setThemeOpen((v) => !v); setTagOpen(false); }}
                aria-expanded={themeOpen}
              >
                보드 테마 <span aria-hidden>▾</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="board-placeholder">보드를 불러오는 중이에요.</div>
        ) : isError ? (
          <div className="board-placeholder">
            보드를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </div>
        ) : (
          <div
            ref={boardRef}
            className="board"
            style={{
              height: boardHeight,
              backgroundColor: style.fallbackBg,
              fontFamily: themeFont,
            }}
          >
            {/* 배경 레이어.
                tile  = 원본 크기로 반복 (종이 질감)
                cover = 화면에 고정된 채 보드만 흘러감 (풍경 사진, 보드가 길어져도 안 늘어남) */}
            <div
              className={`board-bg board-bg--${style.bgFit}`}
              style={{ backgroundImage: boardImage ? `url("${boardImage}")` : undefined }}
              aria-hidden
            />

            {memos.length === 0 && (
              <div className="board-empty" style={{ color: style.ink }}>
                아직 메모지가 없어요. 오른쪽 아래에서 첫 메모지를 붙여보세요.
              </div>
            )}

            {memos.map((memo) => {
              const p = positions.get(memo.memoId) ?? { x: 0, y: 0 };
              const design = resolveDesign(memo.designId);
              return (
                <MemoCard
                    key={memo.memoId}
                    memo={memo}
                    x={p.x}
                    y={p.y}
                    imageUrl={design.url}
                    color={design.color}
                    ink={style.ink}
                    contentArea={{
                        left: design.contentLeft,
                        top: design.contentTop,
                        width: design.contentWidth,
                        height: design.contentHeight,
                    }}
                    dragging={dragView?.memoId === memo.memoId}
                    onPointerDown={handlePointerDown}
                    onEdit={(m: any) => navigate(`/board/edit/${m.memoId}`)}
                    onDelete={(m: any) => setDeleting(m)}
                    onComplete={(m: any) => setCompleting(m)}
                    onNudge={handleNudge}
                />
              );
            })}
          </div>
        )}

        <button type="button" className="fab" onClick={() => setComposerOpen(true)}>
          + 새 메모지
        </button>
      </main>

      {/* 보드 테마 패널 */}
      {themeOpen && (
        <>
          <div className="panel-backdrop" onClick={() => setThemeOpen(false)} />
          <aside className="theme-panel" aria-label="보드 테마 선택">
            <div className="theme-head">
              <div>
                <h2>보드 테마</h2>
                <p>서재 감성에 맞춘 보드 배경을 골라보세요.</p>
              </div>
              <button type="button" onClick={() => setThemeOpen(false)} aria-label="닫기">✕</button>
            </div>

            {themes.map((t) => {
              const s = getThemeStyle(t.themeId);
              const thumb = safeImageUrl(t.themeImageUrl);
              const busy = applyingTheme === t.themeId;
              return (
                <button
                  type="button"
                  key={t.themeId}
                  className={`theme-item${t.themeId === theme?.themeId ? ' on' : ''}`}
                  onClick={() => applyTheme(t)}
                  disabled={busy}
                >
                  <span
                    className="theme-swatch"
                    style={{
                      backgroundColor: s.fallbackBg,
                      backgroundImage: thumb ? `url("${thumb}")` : undefined,
                    }}
                  />
                  <span className="theme-meta">
                    <b>{t.themeName}</b>
                    <em>{busy ? '배경 준비 중…' : THEME_DESC[t.themeId] ?? ''}</em>
                    <span className="theme-dots">
                      {t.designs.map((d, i) => (
                        <i
                          key={d.designId}
                          style={{
                            backgroundColor: s.memoFallback[i % s.memoFallback.length],
                            backgroundImage: safeImageUrl(d.memoImageUrl)
                              ? `url("${safeImageUrl(d.memoImageUrl)}")`
                              : undefined,
                          }}
                        />
                      ))}
                    </span>
                  </span>
                </button>
              );
            })}

            <label className="theme-upload">
              <span className="plus">+</span>
              <span className="theme-meta">
                <b>내 사진 추가</b>
                <em>보드 배경으로 쓸 이미지를 올려보세요</em>
              </span>
              {/* ⚠️ presigned URL 발급 → S3 PUT → 테마 저장 순서로 연결하세요. */}
              <input type="file" accept="image/*" hidden />
            </label>
          </aside>
        </>
      )}

      {composerOpen && (
        <MemoComposer
          categories={categories}
          designs={designs}
          fallbackColors={style.memoFallback}
          ink={style.ink}
          themeName={theme?.themeName}
          pending={create.isPending}
          onClose={() => setComposerOpen(false)}
          onSubmit={handleSubmitMemo}
          onAddCategory={(name) => addCategory.mutate(name)}
        />
      )}

      {completing && (
        <CompleteDialog
          content={completing.content}
          pending={complete.isPending}
          onCompleteOnly={() => finishComplete(completing, false)}
          onRecord={() => finishComplete(completing, true)}
          onClose={() => setCompleting(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          message="이 메모지를 삭제할까요? 삭제하면 되돌릴 수 없어요."
          pending={remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            remove.mutate(deleting.memoId, { onSuccess: () => setDeleting(null) })
          }
        />
      )}
    </div>
  );
}