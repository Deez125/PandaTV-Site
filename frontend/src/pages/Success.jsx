import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const Wordmark = () => (
  <span className="wordmark" style={{ fontSize: '1.5rem' }}>
    novix<span className="wordmark-dot">.</span>tv
  </span>
);

const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

function Spinner() {
  return (
    <div
      className="w-10 h-10 rounded-full animate-spin mx-auto"
      style={{ border: '2px solid rgba(255,255,255,0.12)', borderTopColor: 'var(--accent-bright)' }}
    />
  );
}

export default function Success() {
  const [status, setStatus] = useState('processing'); // processing | success | error
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const processSuccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setStatus('success'); // Direct visit (no session) — just show success.
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/checkout/success?session_id=${sessionId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to process checkout');
        setStatus('success');
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    };

    processSuccess();
  }, []);

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className={`w-full max-w-md text-center ${mounted ? 'auth-enter' : 'auth-enter-pre'}`}>
        {/* Wordmark */}
        <button onClick={() => navigate('/')} className="inline-block mb-8">
          <Wordmark />
        </button>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
        >
          {status === 'processing' && (
            <>
              <div className="mb-6"><Spinner /></div>
              <h2 className="text-xl font-semibold tracking-tight mb-2">Setting up your access…</h2>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>This will only take a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(110,168,255,0.12)' }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5}
                     viewBox="0 0 24 24" style={{ color: 'var(--accent-bright)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
                Welcome to NovixTV
              </h2>
              <p className="text-sm leading-relaxed mb-7" style={{ color: 'var(--fg-muted)' }}>
                Your subscription is now active. Connect your Plex, Jellyfin, or Emby library
                and start streaming.
              </p>
              <div className="space-y-3">
                <button onClick={() => navigate('/settings?tab=services')} className="btn-primary w-full">
                  Connect your library
                </button>
                <button onClick={() => navigate('/')} className="btn-secondary w-full">
                  Back to home
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(239,106,106,0.12)' }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5}
                     viewBox="0 0 24 24" style={{ color: 'var(--danger)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold tracking-tight mb-2">Something went wrong</h2>
              {error && <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>{error}</p>}
              <p className="text-xs leading-relaxed mb-7" style={{ color: 'var(--fg-dim)' }}>
                If your payment went through, your subscription is still active. Contact support
                if you don't receive access within a few minutes.
              </p>
              <button onClick={() => navigate('/')} className="btn-secondary w-full">
                Back to home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
