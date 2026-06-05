import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useDebug, resolveSubscription } from '../lib/debug';
import { supabase } from '../lib/supabase';

/*
 * DebugPanel — always-on-top dev overlay (bottom-right).
 * Add fields to the `rows` array below as needed.
 */
export default function DebugPanel() {
  const { user, session, loading } = useAuth();
  const { subOverride, setSubOverride } = useDebug();
  const [route, setRoute] = useState(window.location.pathname);
  const [open, setOpen] = useState(true);
  const [userData, setUserData] = useState(null);

  // Pull the signed-in user's real subscription so we can show what's in effect.
  useEffect(() => {
    let cancelled = false;
    if (!user) { setUserData(null); return; }
    supabase
      .from('users')
      .select('subscription_status, subscription_tier, current_period_end, subscription_interval')
      .eq('auth_id', user.id)
      .single()
      .then(({ data }) => { if (!cancelled) setUserData(data); });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    const onNav = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onNav);
    // also catch pushState-based nav used across the app
    const id = window.setInterval(() => setRoute(window.location.pathname), 400);
    return () => {
      window.removeEventListener('popstate', onNav);
      window.clearInterval(id);
    };
  }, []);

  const rows = [
    ['route', route],
    ['auth', user ? 'signed in' : 'guest'],
    ['email', user?.email || '—'],
    ['uid', user?.id ? `${user.id.slice(0, 8)}…` : '—'],
    ['token', session?.access_token ? 'yes' : 'no'],
    ['loading', String(loading)],
    ['env', import.meta.env.DEV ? 'DEV' : 'PROD'],
  ];

  const subOptions = [
    ['live', null, 'Live'],
    ['none', 'none', 'None'],
    ['monthly', 'monthly', 'Monthly'],
    ['yearly', 'yearly', 'Yearly'],
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0.75rem',
        right: '0.75rem',
        zIndex: 2147483647, // max — above everything
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        lineHeight: 1.5,
        color: '#8c9bb5',
        background: 'rgba(3, 5, 8, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        boxShadow: '0 8px 24px -6px rgba(0,0,0,0.6)',
        minWidth: open ? '180px' : 'auto',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          width: '100%',
          padding: '0.4rem 0.65rem',
          color: '#f5f7fa',
          fontWeight: 600,
          letterSpacing: '0.08em',
          cursor: 'pointer',
        }}
      >
        <span>● DEBUG</span>
        <span style={{ color: '#5a6a85' }}>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 0.65rem 0.55rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingTop: '0.3rem' }}>
              <span style={{ color: '#5a6a85' }}>{k}</span>
              <span style={{ color: '#c8d2e0', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
            </div>
          ))}

          {/* Subscription override (local preview only) */}
          <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#5a6a85' }}>subscription</span>
              <span style={{ color: '#5a6a85', fontSize: '9px' }}>{subOverride ? 'override' : 'live'}</span>
            </div>
            {(() => {
              const s = resolveSubscription(userData, subOverride);
              const paid = s.status === 'active' || s.status === 'past_due';
              const text = `${s.status}${s.tier ? ` · ${s.tier}` : ''}${s.interval ? ` · ${s.interval}` : ''}`;
              return (
                <div style={{ color: paid ? '#34d399' : '#c8d2e0', marginBottom: '0.4rem', wordBreak: 'break-all' }}>
                  {text}
                </div>
              );
            })()}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {subOptions.map(([key, val, label]) => {
                const active = subOverride === val;
                return (
                  <button
                    key={key}
                    onClick={() => setSubOverride(val)}
                    style={{
                      padding: '0.3rem 0.4rem',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: active ? '#0a0d13' : '#c8d2e0',
                      background: active ? '#6ea8ff' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${active ? '#6ea8ff' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
