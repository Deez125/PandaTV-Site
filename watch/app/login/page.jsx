'use client';

import { useState } from 'react';
import Wordmark from '@/components/Wordmark';

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://novix.tv';

export default function LoginPage() {
  const [going, setGoing] = useState(false);

  const onContinue = () => {
    setGoing(true);
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.assign(`${MAIN_SITE}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Wordmark />
        </div>

        <div className="rounded-2xl p-7 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
          <h1 className="text-xl font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>Welcome to Novix</h1>
          <p className="text-sm mb-7" style={{ color: 'var(--fg-muted)' }}>
            Sign in with your Novix account to start watching.
          </p>

          <button onClick={onContinue} disabled={going} className="btn-primary w-full" style={{ opacity: going ? 0.7 : 1 }}>
            {going ? 'Redirecting…' : 'Continue with novix.tv'}
          </button>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--fg-dim)' }}>
          You'll sign in on novix.tv and come right back.
        </p>
      </div>
    </div>
  );
}
