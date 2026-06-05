/*
 * ConfirmModal — themed confirmation dialog.
 * Controlled: render when `open` is true.
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

  const confirmStyle =
    confirmTone === 'danger'
      ? { background: 'var(--danger)', color: '#fff' }
      : { background: 'var(--fg)', color: 'var(--bg)' };

  return (
    <div
      onClick={loading ? undefined : onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(3,5,8,0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--hairline-strong)' }}
      >
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--fg)' }}>{title}</h3>
        <div className="text-sm leading-relaxed mb-5" style={{ color: 'var(--fg-muted)' }}>{message}</div>

        {error && (
          <p className="text-sm mb-4" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--fg-muted)', opacity: loading ? 0.5 : 1 }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-transform"
            style={{ ...confirmStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
