interface Props {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 되돌릴 수 없는 동작 전에 한 번 묻는 다이얼로그 */
export default function ConfirmDialog({
  message,
  confirmLabel = '삭제하기',
  cancelLabel = '취소',
  pending,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <>
      <div className="panel-backdrop" onClick={onCancel} />
      <div className="confirm" role="alertdialog" aria-modal="true" aria-label={message}>
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="danger" disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}