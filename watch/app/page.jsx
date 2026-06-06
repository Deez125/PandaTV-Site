import { createClient } from '@/lib/supabase/server';
import Wordmark from '@/components/Wordmark';
import SignOutButton from '@/components/SignOutButton';

// Gated by middleware (signed in + active subscription). This is the
// milestone-1 proof screen; the library/player replaces it next.
export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: row } = await supabase
    .from('users')
    .select('subscription_status, subscription_tier, subscription_interval')
    .eq('auth_id', user?.id)
    .single();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <nav className="border-b" style={{ borderColor: 'var(--hairline)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Wordmark />
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="eyebrow text-xs uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent)' }}>
          Watch
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">You're in.</h1>
        <p className="text-base mb-10" style={{ color: 'var(--fg-muted)' }}>
          Signed in as <span style={{ color: 'var(--fg)' }}>{user?.email}</span>. The player is coming next —
          libraries and playback land here.
        </p>

        <div className="rounded-2xl p-6 max-w-sm" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--fg-muted)' }}>
            Subscription
          </div>
          <Row label="Status" value={row?.subscription_status || '—'} />
          <Row label="Tier" value={row?.subscription_tier || '—'} />
          <Row label="Interval" value={row?.subscription_interval || '—'} />
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span style={{ color: 'var(--fg-muted)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--fg)' }}>{value}</span>
    </div>
  );
}
