import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

// Only these origins may receive a session handoff.
const ALLOWED_WATCH_ORIGINS = [
  'http://localhost:3000',
  'https://watch.novix.tv',
];

// Read + validate redirect_uri synchronously — the AuthProvider strips the
// query string after processing an OAuth hash, so we must capture it first.
function readRedirectUri() {
  try {
    const raw = new URLSearchParams(window.location.search).get('redirect_uri');
    if (!raw) return null;
    return ALLOWED_WATCH_ORIGINS.includes(new URL(raw).origin) ? raw : null;
  } catch {
    return null;
  }
}

const GoogleG = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
};
const inputStyle = {
  width: '100%',
  padding: '0.7rem 1rem',
  borderRadius: '0.75rem',
  fontSize: '0.9rem',
  background: 'var(--bg-elev)',
  border: '1px solid var(--hairline)',
  color: 'var(--fg)',
  outline: 'none',
};

function Shell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <span className="wordmark" style={{ fontSize: '1.25rem' }}>
            novix<span style={{ color: 'var(--accent)' }}>.</span>tv
          </span>
        </div>
        <div className="rounded-2xl p-7" style={card}>{children}</div>
      </div>
    </div>
  );
}

export default function Authorize() {
  const { user, loading, signIn, signInWithOAuth } = useAuth();
  const [redirectUri] = useState(readRedirectUri);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [handingOff, setHandingOff] = useState(false);

  const authorizeUrl = redirectUri
    ? `${window.location.origin}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`
    : null;

  // Once we have a session, hand it back to the watch app.
  useEffect(() => {
    if (loading || !user || !redirectUri || handingOff) return;
    setHandingOff(true);
    (async () => {
      // Force-refresh so we hand off a freshly-minted token pair. A stored
      // session can have an expired access token, which the receiving app
      // rejects (403 "Auth session missing").
      let session = null;
      const refreshed = await supabase.auth.refreshSession();
      session = refreshed.data?.session || null;
      if (!session) {
        const current = await supabase.auth.getSession();
        session = current.data?.session || null;
      }
      if (!session) {
        setHandingOff(false);
        return;
      }
      const hash = `#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
      window.location.replace(redirectUri + hash);
    })();
  }, [user, loading, redirectUri, handingOff]);

  if (!redirectUri) {
    return (
      <Shell>
        <h1 className="text-lg font-semibold mb-1">Invalid request</h1>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          This authorization link is missing or points to an unrecognized destination.
        </p>
      </Shell>
    );
  }

  if (handingOff || (user && !loading)) {
    return (
      <Shell>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Connecting you to Novix…</p>
      </Shell>
    );
  }

  const handleEmail = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      // success → user updates → effect performs the handoff
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithOAuth('google', authorizeUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Shell>
      <h1 className="text-lg font-semibold mb-1">Sign in to continue</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
        Authorize the Novix player to use your account.
      </p>

      <form onSubmit={handleEmail} className="space-y-3">
        <input type="email" placeholder="you@example.com" value={email}
               onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" required />
        <input type="password" placeholder="Password" value={password}
               onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoComplete="current-password" required />
        {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full" style={{ opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <span className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
        <span className="text-xs" style={{ color: 'var(--fg-dim)' }}>or</span>
        <span className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
      </div>

      <button onClick={handleGoogle} className="btn-secondary w-full">
        <GoogleG /> Continue with Google
      </button>
    </Shell>
  );
}
