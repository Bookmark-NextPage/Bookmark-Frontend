interface Props {
  content: string;
  pending?: boolean;
  /** 콜랙트북에 기록하지 않고 완료만 */
  onCompleteOnly: () => void;
  /** 완료 후 콜랙트북 기록 작성으로 이동 */
  onRecord: () => void;
  onClose: () => void;
}

/** 버킷을 이뤘을 때 뜨는 축하 다이얼로그 */
export default function CompleteDialog({
  content,
  pending,
  onCompleteOnly,
  onRecord,
  onClose,
}: Props) {
  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <div className="celebrate" role="dialog" aria-modal="true" aria-label="버킷 완료">
        <div className="celebrate-mark" aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2>축하해요, 하나 이뤘어요!</h2>
        <p className="celebrate-quote">&ldquo;{content}&rdquo;</p>
        <p className="celebrate-sub">
          이 순간을 콜랙트북에 기록으로 남길까요?
          <br />
          원치 않으면 그냥 완료할 수 있어요.
        </p>

        <div className="celebrate-actions">
          <button type="button" className="ghost" disabled={pending} onClick={onCompleteOnly}>
            그냥 완료
          </button>
          <button type="button" className="primary" disabled={pending} onClick={onRecord}>
            콜랙트북에 기록하기
          </button>
        </div>
      </div>
    </>
  );
}