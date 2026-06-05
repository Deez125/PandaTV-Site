import { createPortal } from 'react-dom';

/*
 * ConfirmModal — themed confirmation dialog.
 * Rendered through a portal to <body> so its overlay always covers the full
 * viewport (escapes any transformed/animated page container) and centers.
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Never mind',
  confirmTone = 'primary', // 'primary' | 'danger'
  loading = false,
  error = null,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const danger = confirmTone === 'danger';

  return createPortal(
    <div
      onClick={loading ? undefined : onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(2, 4, 8, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-7"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline-strong)',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.7)',
        }}
      >
        <h3 className="text-xl font-semibold mb-2.5" style={{ color: 'var(--fg)' }}>{title}</h3>
        <div className="text-sm leading-relaxed mb-6" style={{ color: 'var(--fg-muted)' }}>{message}</div>

        {error && (
          <p className="text-sm mb-4" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary no-lift"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${danger ? 'btn-danger' : 'btn-primary'} no-lift`}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
