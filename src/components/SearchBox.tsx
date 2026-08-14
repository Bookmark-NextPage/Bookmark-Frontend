import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { highlight } from '../utils/highlight';
import type { CollectBookDetail } from '../types/collectBook';
import type { BucketBoardResponse } from '../types/bucket';
import './SearchBox.css';

interface Hit {
  id: number;
  title: string; // 크게 보일 줄
  sub?: string; // 작게 보일 줄 (챕터/카테고리 등)
  onOpen: () => void;
}

export default function SearchBox() {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 현재 페이지 판별
  const path = location.pathname;
  const onCollect = path.startsWith('/collect');
  const onBoard = path.startsWith('/board');

  const placeholder = onBoard
    ? '메모 검색'
    : onCollect
      ? '기록 검색 (완료한 순간)'
      : '검색';

  const hits: Hit[] = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];

    // --- 콜랙트북: 현재 보고 있는 책 안의 기록에서 검색 ---
    if (onCollect) {
      // 상세 페이지(/collect/:id)에서 현재 책 캐시를 읽음
      const id = params.id ? Number(params.id) : NaN;
      if (Number.isNaN(id)) return []; // 책장 목록에선 검색 대상 없음
      const book = queryClient.getQueryData<CollectBookDetail>(['collectBook', id]);
      if (!book) return [];

      const results: Hit[] = [];
      for (const ch of book.chapters) {
        for (const r of ch.records) {
          const inTitle = r.title.toLowerCase().includes(kw);
          const inContent = r.content.toLowerCase().includes(kw);
          if (inTitle || inContent) {
            results.push({
              id: r.recordId,
              title: r.title,
              sub: ch.name,
              onOpen: () => navigate(`/record/${r.recordId}`),
            });
          }
        }
      }
      return results.slice(0, 8);
    }

    // --- 버킷보드: 보드 메모 content에서 검색 ---
    if (onBoard) {
      const board = queryClient.getQueryData<BucketBoardResponse>(['bucketBoard']);
      if (!board) return [];
      return board.memos
        .filter((m) => m.content.toLowerCase().includes(kw))
        .slice(0, 8)
        .map((m) => ({
          id: m.memoId,
          title: m.content,
          sub: m.categoryName,
          onOpen: () => navigate('/board'), // 보드로 이동 (메모 포커스는 보드 담당)
        }));
    }

    return [];
  }, [q, onCollect, onBoard, params.id, queryClient, navigate]);

  const showDropdown = focused && q.trim().length > 0;

  return (
    <div className="search-box">
      <input
        className="search-input"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)} // 클릭 여유
      />
      
      {showDropdown && (
        <div className="search-drop">
          {hits.length === 0 ? (
            <div className="search-empty">검색 결과가 없어요.</div>
          ) : (
            hits.map((h) => (
              <div
                key={h.id}
                className="search-hit"
                onMouseDown={(e) => {
                  e.preventDefault();
                  h.onOpen();
                  setQ('');
                }}
              >
                <div className="sh-title">{highlight(h.title, q)}</div>
                {h.sub && <div className="sh-sub">{h.sub}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}