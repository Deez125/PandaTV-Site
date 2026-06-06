'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Wordmark from '@/components/Wordmark';

// Receives the session handed back from novix.tv/authorize (tokens in the URL
// hash), establishes the session on this origin, then drops into the app.
export default function AuthCallback() {
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token || !refresh_token) {
        setError('Sign-in didn’t complete. Please try again.');
        return;
      }

      const supabase = createClient();
      const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
      if (setErr) {
        setError(setErr.message);
        return;
      }
      // Hard nav so middleware re-runs with the new session cookie.
      window.location.replace('/');
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="text-center">
        <div className="flex justify-center mb-5"><Wordmark /></div>
        {error ? (
          <>
            <p className="text-sm mb-4" style={{ color: 'var(--danger)' }}>{error}</p>
            <a href="/login" className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              Back to sign in
            </a>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Signing you in…</p>
        )}
      </div>
    </div>
  );
}
