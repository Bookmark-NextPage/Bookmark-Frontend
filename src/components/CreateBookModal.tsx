import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createCollectBook } from '../api/collectBook';
import { bookGradient } from '../utils/bookColor';
import type { BookColor, ChapterType, Visibility } from '../types/collectBook';
import './CreateBookModal.css';

const COLORS: BookColor[] = ['PINK', 'GREEN', 'BLUE', 'YELLOW', 'PURPLE'];

// 연도 선택 목록 (현재연도 기준 과거~미래 몇 개)
const NOW = new Date().getFullYear();
const YEARS = Array.from({ length: 27 }, (_, i) => NOW + 1 - i); // 내년 ~ 25년 전

interface Props {
  onClose: () => void;
}

export default function CreateBookModal({ onClose }: Props) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('새 책');
  const [year, setYear] = useState(NOW);
  const [coverColor, setCoverColor] = useState<BookColor>('PINK');
  const [visibility] = useState<Visibility>('PUBLIC');
  const [chapterType, setChapterType] = useState<ChapterType>('MONTHLY');
  const [customChapters, setCustomChapters] = useState<string[]>(['봄', '여름', '가을', '겨울']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addChapter = () => {
    if (customChapters.length >= 20) return;
    setCustomChapters((prev) => [...prev, '']);
  };
  const removeChapter = (idx: number) => {
    setCustomChapters((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateChapter = (idx: number, val: string) => {
    setCustomChapters((prev) => prev.map((c, i) => (i === idx ? val.slice(0, 10) : c)));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError('책 제목을 입력해주세요.');
      return;
    }
    if (title.length > 10) {
      setError('책 제목은 최대 10자예요.');
      return;
    }

    // 챕터 구성
    let chapters: { name: string }[];
    if (chapterType === 'MONTHLY') {
      chapters = Array.from({ length: 12 }, (_, i) => ({ name: `${i + 1}월` }));
    } else {
      const cleaned = customChapters.map((c) => c.trim()).filter((c) => c.length > 0);
      if (cleaned.length === 0) {
        setError('챕터를 최소 1개 이상 입력해주세요.');
        return;
      }
      if (cleaned.length > 20) {
        setError('챕터는 최대 20개까지예요.');
        return;
      }
      chapters = cleaned.map((name) => ({ name }));
    }

    setSubmitting(true);
    try {
      await createCollectBook({
        title: title.trim(),
        coverColor,
        year,
        visibility,
        chapterType,
        chapters,
      });
      // 책장 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['collectBooks'] });
      onClose();
    } catch (err) {
      console.error('책 생성 실패:', err);
      setError('책 만들기에 실패했어요. 입력값을 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cbm-backdrop" onClick={onClose}>
      <div className="cbm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cbm-close" onClick={onClose}>
          ×
        </button>
        <div className="cbm-title">새 책 만들기</div>
        <div className="cbm-sub">책 제목과 챕터 구성을 자유롭게 정할 수 있어요.</div>

        {/* 책 제목 */}
        <label className="cbm-label">책 제목</label>
        <input
          className="cbm-input"
          value={title}
          maxLength={10}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 책"
        />

        {/* 연도 */}
        <label className="cbm-label">연도 (책 1권 = 1년)</label>
        <select
          className="cbm-input"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* 표지 색 */}
        <label className="cbm-label">표지 색</label>
        <div className="cbm-colors">
          {COLORS.map((c) => (
            <div
              key={c}
              className={`cbm-color ${coverColor === c ? 'on' : ''}`}
              style={{ background: bookGradient(c) }}
              onClick={() => setCoverColor(c)}
            />
          ))}
        </div>

        {/* 챕터 설정 */}
        <label className="cbm-label">챕터 설정</label>
        <div className="cbm-tabs">
          <button
            className={`cbm-tab ${chapterType === 'MONTHLY' ? 'on' : ''}`}
            onClick={() => setChapterType('MONTHLY')}
          >
            월 단위 (자동)
          </button>
          <button
            className={`cbm-tab ${chapterType === 'CUSTOM' ? 'on' : ''}`}
            onClick={() => setChapterType('CUSTOM')}
          >
            직접 설정
          </button>
        </div>

        {chapterType === 'MONTHLY' ? (
          <div className="cbm-monthly-note">1월부터 12월까지 12개 챕터가 자동으로 만들어져요.</div>
        ) : (
          <div className="cbm-chapters">
            {customChapters.map((name, idx) => (
              <div className="cbm-chapter-row" key={idx}>
                <span className="cbm-ch-num">Ch. {String(idx + 1).padStart(2, '0')}</span>
                <input
                  className="cbm-input cbm-ch-input"
                  value={name}
                  maxLength={10}
                  placeholder="챕터 이름"
                  onChange={(e) => updateChapter(idx, e.target.value)}
                />
                <button className="cbm-ch-del" onClick={() => removeChapter(idx)}>
                  ×
                </button>
              </div>
            ))}
            {customChapters.length < 20 && (
              <button className="cbm-add-chapter" onClick={addChapter}>
                + 챕터 추가
              </button>
            )}
          </div>
        )}

        {error && <div className="cbm-error">{error}</div>}

        <div className="cbm-actions">
          <button className="cbm-cancel" onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button className="cbm-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '만드는 중...' : '책 만들기'}
          </button>
        </div>
      </div>
    </div>
  );
}