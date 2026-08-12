import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import {
  useAiUse,
  useKeywords,
  useCreateKeyword,
  MAX_KEYWORDS,
  useUploadImages,
  useGenerateScrapImage,
  useSaveAiImage,
  useCreateRecord,
  useCollectBookList,
  useCollectBookChapters,
} from '../hooks/useRecord';
import { useBucketBoard } from '../hooks/useBucketBoard';
import './RecordCreate.css';

const MAX_IMAGES = 5;

export default function RecordCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const memoId = params.get('memoId') ? Number(params.get('memoId')) : undefined;

  const { aiUse } = useAiUse();
  const board = useBucketBoard();
  const keywords = useKeywords();
  const addKeyword = useCreateKeyword();
  const upload = useUploadImages();
  const generate = useGenerateScrapImage();
  const saveAi = useSaveAiImage();
  const createRecord = useCreateRecord();
  const bookList = useCollectBookList();

  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [keywordIds, setKeywordIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  /** aiUse=true 흐름에서 먼저 만들어둔 초안 기록의 id */
  const [draftRecordId, setDraftRecordId] = useState<number | null>(null);

  const [collectBookId, setCollectBookId] = useState<number | undefined>();
  const chapters = useCollectBookChapters(collectBookId);
  const [chapterId, setChapterId] = useState<number | undefined>();

  const [tagInputOpen, setTagInputOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const sourceMemo = board.data?.memos.find((m) => m.memoId === memoId);

  /* 메모지 기반은 완료 날짜 기준으로 백엔드가 자동 분류합니다 */
  const autoLocation = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const last = new Date(y, m, 0).getDate();
    const mm = String(m).padStart(2, '0');
    return {
      range: `${y}. ${mm}. 01 — ${mm}. ${last} · Chapter ${m}`,
      label: `${y} › ${m}월 (Chapter ${m})`,
    };
  }, []);

  const errorMessage = (err: unknown) => {
    const e = err as { response?: { status?: number; data?: { message?: string } } };
    if (e?.response?.status === 429) {
      return 'AI 이미지 생성 요청이 몰려 있어요. 잠시 후 다시 시도해 주세요.';
    }
    return e?.response?.data?.message ?? '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
  };

  const toggleKeyword = (id: number) =>
    setKeywordIds((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    );

  const submitTag = () => {
    const name = newTag.trim();
    if (!name || addKeyword.isPending) return;

    addKeyword.mutate(name, {
      onSuccess: (created) => {
        setKeywordIds((prev) => [...prev, created.keywordId]);
        setNewTag('');
        setTagInputOpen(false);
      },
    });
  };

  const keywordFull = (keywords.data?.length ?? 0) >= MAX_KEYWORDS;

  const handlePickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_IMAGES - imageUrls.length;
    if (room <= 0) return;

    upload.mutate([...files].slice(0, room), {
      onSuccess: (urls) => setImageUrls((prev) => [...prev, ...urls].slice(0, MAX_IMAGES)),
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const hasLocation = memoId ? true : !!chapterId;
  const filled = title.trim().length > 0 && content.trim().length > 0;

  const buildBody = () => ({
    chapterId: memoId ? undefined : chapterId,
    bucketBoardMemoId: memoId,
    title: title.trim(),
    content: content.trim(),
    keywordIds,
    imageUrls,
  });

  /* ---------------- aiUse = false : 왼쪽 저장하기 ---------------- */

  const handlePlainSave = () => {
    if (!filled || !hasLocation) return;
    createRecord.mutate(
      { memoId, chapterId, body: buildBody() },
      { onSuccess: () => navigate('/collect') },
    );
  };

  /* ---------------- aiUse = true : 이미지 생성 → 저장 ---------------- */

  const runGenerate = (recordId: number, withFeedback: boolean) => {
    setDraftRecordId(recordId);
    generate.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        imageUrls,
        keywordIds,
        feedback: withFeedback ? feedback.trim() || undefined : undefined,
      },
      { onSuccess: setAiImageUrl },
    );
  };

  /** 처음 생성할 때 기록을 초안으로 먼저 만들고, 그 뒤에는 같은 기록에 재생성합니다. */
  const handleGenerate = (withFeedback = false) => {
    if (!filled || !hasLocation) return;

    if (draftRecordId) {
      runGenerate(draftRecordId, withFeedback);
      return;
    }
    createRecord.mutate(
      { memoId, chapterId, body: buildBody() },
      { onSuccess: (rec) => runGenerate(rec.recordId, withFeedback) },
    );
  };

  const handleAiSave = () => {
    if (!draftRecordId || !aiImageUrl) return;
    saveAi.mutate(
      { recordId: draftRecordId, aiImageUrl },
      { onSuccess: () => navigate('/collect') },
    );
  };

  const selectedKeywords = (keywords.data ?? []).filter((k) =>
    keywordIds.includes(k.keywordId),
  );
  const busy = createRecord.isPending || generate.isPending;

  return (
    <div className="bm-page">
      <Header />

      <main className="bm-main record-main">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          ← 목록
        </button>

        <p className="record-range">{autoLocation.range}</p>

        <div className="record-grid">
          {/* ---------------- 왼쪽: 작성 ---------------- */}
          <section className="record-card">
            {sourceMemo && (
              <div className="source-chip">
                버킷보드에서 완료 · <b>{sourceMemo.content}</b>
              </div>
            )}

            <div className="record-field">
              <label htmlFor="rec-title">제목</label>
              <input
                id="rec-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 혼자 떠난 첫 교토 여행"
                maxLength={40}
              />
            </div>

            <div className="record-field">
              <label htmlFor="rec-content">기록</label>
              <textarea
                id="rec-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="그날의 기분과 장면을 자유롭게 적어보세요."
                rows={6}
              />
            </div>

            <div className="record-field">
              <label>이미지</label>
              <div className="image-row">
                {imageUrls.map((url) => (
                  <div
                    key={url}
                    className="image-tile"
                    style={{ backgroundImage: `url("${url}")` }}
                  >
                    <button
                      type="button"
                      aria-label="이미지 삭제"
                      onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {imageUrls.length < MAX_IMAGES && (
                  <button
                    type="button"
                    className="image-add"
                    onClick={() => fileRef.current?.click()}
                    disabled={upload.isPending}
                  >
                    {upload.isPending ? '…' : '+'}
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handlePickFiles(e.target.files)}
                />
              </div>
              <p className="field-hint">최대 {MAX_IMAGES}장까지 올릴 수 있어요.</p>
            </div>

            <div className="record-field">
              <label>감성 키워드 (선택)</label>
              {keywords.isLoading ? (
                <p className="field-hint">키워드를 불러오는 중이에요.</p>
              ) : (
                <div className="chip-row">
                  {(keywords.data ?? []).map((k) => (
                    <button
                      type="button"
                      key={k.keywordId}
                      className={`chip${keywordIds.includes(k.keywordId) ? ' on' : ''}`}
                      onClick={() => toggleKeyword(k.keywordId)}
                    >
                      # {k.name}
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
                        onBlur={() => !newTag.trim() && setTagInputOpen(false)}
                        placeholder="태그 이름"
                        maxLength={10}
                      />
                      <button
                        type="button"
                        onClick={submitTag}
                        disabled={addKeyword.isPending}
                      >
                        {addKeyword.isPending ? '…' : '추가'}
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="chip chip-ghost"
                      onClick={() => setTagInputOpen(true)}
                      disabled={keywordFull}
                      title={keywordFull ? `태그는 최대 ${MAX_KEYWORDS}개까지예요` : undefined}
                    >
                      + 태그
                    </button>
                  )}
                </div>
              )}

              {keywordFull && (
                <p className="field-hint">태그는 최대 {MAX_KEYWORDS}개까지 만들 수 있어요.</p>
              )}
              {addKeyword.isError && (
                <p className="field-hint is-error">{errorMessage(addKeyword.error)}</p>
              )}
            </div>

            <div className="record-field">
              <label>저장 위치</label>

              {memoId ? (
                <div className="save-location">
                  <b>{autoLocation.label}</b>
                  <span>완료 날짜 기준 자동 분류</span>
                </div>
              ) : (
                <div className="save-selects">
                  <select
                    value={collectBookId ?? ''}
                    onChange={(e) => {
                      setCollectBookId(Number(e.target.value) || undefined);
                      setChapterId(undefined);
                    }}
                  >
                    <option value="">콜랙트북 선택</option>
                    {bookList.data?.map((b) => (
                      <option key={b.collectBookId} value={b.collectBookId}>
                        {b.year} · {b.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={chapterId ?? ''}
                    onChange={(e) => setChapterId(Number(e.target.value) || undefined)}
                    disabled={!collectBookId || chapters.isLoading}
                  >
                    <option value="">챕터 선택</option>
                    {chapters.data?.chapters.map((c) => (
                      <option key={c.chapterId} value={c.chapterId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="record-actions">
              {aiUse ? (
                <button
                  type="button"
                  className="primary"
                  disabled={!filled || !hasLocation || busy}
                  onClick={() => handleGenerate(false)}
                >
                  {busy ? '생성 중…' : 'AI 이미지 생성'}
                </button>
              ) : (
                <button
                  type="button"
                  className="primary"
                  disabled={!filled || !hasLocation || createRecord.isPending}
                  onClick={handlePlainSave}
                >
                  {createRecord.isPending ? '저장 중…' : '저장하기'}
                </button>
              )}
            </div>

            {createRecord.isError && (
              <p className="record-error">저장하지 못했어요. 잠시 후 다시 시도해 주세요.</p>
            )}
          </section>

          {/* ---------------- 오른쪽: AI 결과 ---------------- */}
          <section className={`record-card ai-card${aiUse ? '' : ' is-locked'}`}>
            <div className="ai-head">
              <h2>AI가 추천한 감성 스크랩북</h2>
              {aiUse && (
                <div className="ai-head-actions">
                  <button
                    type="button"
                    disabled={busy || !aiImageUrl}
                    onClick={() => handleGenerate(false)}
                  >
                    ↻ 다시 생성
                  </button>
                  <a
                    className={`ai-export${aiImageUrl ? '' : ' off'}`}
                    href={aiImageUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ↓ 내보내기
                  </a>
                </div>
              )}
            </div>

            {!aiUse ? (
              <div className="ai-lock">
                <div className="ai-lock-mark" aria-hidden>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <rect
                      x="5" y="10.5" width="14" height="9" rx="2"
                      fill="none" stroke="currentColor" strokeWidth="1.8"
                    />
                    <path
                      d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
                      fill="none" stroke="currentColor" strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <p>
                  AI 이미지 생성이 꺼져 있어요.
                  <br />
                  설정에서 켜면 기록에 어울리는 스크랩북을 만들어드려요.
                </p>
                <button type="button" onClick={() => navigate('/settings')}>
                  설정으로 가기
                </button>
              </div>
            ) : (
              <>
                <div className="ai-preview">
                  {generate.isPending ? (
                    <div className="ai-empty">스크랩북을 그리는 중이에요…</div>
                  ) : generate.isError ? (
                    <div className="ai-empty">
                      {errorMessage(generate.error)}
                      <br />
                      기록은 이미 저장돼 있으니, 나중에 이미지만 다시 만들어도 괜찮아요.
                    </div>
                  ) : aiImageUrl ? (
                    <img src={aiImageUrl} alt="AI가 생성한 감성 스크랩북" />
                  ) : (
                    <div className="ai-empty">
                      제목과 기록을 적고 <b>AI 이미지 생성</b>을 눌러보세요.
                    </div>
                  )}
                </div>

                <div className="ai-meta">
                  <p className="ai-title">{title || '제목을 입력해보세요'}</p>
                  <p className="ai-body">
                    {content || '본문을 적으면 이 자리에 자동으로 반영돼요.'}
                  </p>
                  {selectedKeywords.length > 0 && (
                    <div className="chip-row">
                      {selectedKeywords.map((k) => (
                        <span key={k.keywordId} className="chip on"># {k.name}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="record-field">
                  <label htmlFor="rec-feedback">AI에게 피드백 남기기</label>
                  <textarea
                    id="rec-feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="예: 색감을 더 화사하게, 사진을 크게 배치해줘"
                    rows={3}
                  />
                </div>

                <div className="record-actions">
                  <button
                    type="button"
                    className="ghost"
                    disabled={busy || !aiImageUrl || !feedback.trim()}
                    onClick={() => handleGenerate(true)}
                  >
                    피드백 반영해서 재생성
                  </button>
                  <button
                    type="button"
                    className="primary"
                    disabled={!aiImageUrl || saveAi.isPending}
                    onClick={handleAiSave}
                  >
                    {saveAi.isPending ? '저장 중…' : '저장하기'}
                  </button>
                </div>

                {saveAi.isError && (
                  <p className="record-error">
                    저장하지 못했어요. 잠시 후 다시 시도해 주세요.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}