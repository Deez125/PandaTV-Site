import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LuCheck, LuX } from 'react-icons/lu';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((message, type = 'info') => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const value = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext) || { show: () => {}, success: () => {}, error: () => {} };
}

function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '0.5rem',
        alignItems: 'center',
        pointerEvents: 'none',
        maxWidth: '92vw',
      }}
    >
      {toasts.map((t) => <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />)}
    </div>,
    document.body
  );
}

function ToastCard({ toast, onDismiss }) {
  const success = toast.type === 'success';
  const error = toast.type === 'error';
  const accent = success ? '#34d399' : error ? 'var(--danger)' : 'var(--accent)';
  return (
    <div
      onClick={onDismiss}
      className="toast-in"
      style={{
        pointerEvents: 'auto',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        background: 'var(--surface)',
        border: '1px solid var(--hairline-strong)',
        borderRadius: '10px',
        padding: '0.7rem 1rem',
        boxShadow: '0 12px 30px -8px rgba(0,0,0,0.6)',
      }}
    >
      <span
        className="flex items-center justify-center shrink-0"
        style={{ width: '1.1rem', height: '1.1rem', borderRadius: '999px', background: accent, color: '#0a0d13' }}
      >
        {error ? <LuX className="w-3 h-3" strokeWidth={3} /> : <LuCheck className="w-3 h-3" strokeWidth={3} />}
      </span>
      <span style={{ fontSize: '0.85rem', color: 'var(--fg)' }}>{toast.message}</span>
    </div>
  );
}
