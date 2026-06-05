import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { LuArrowLeft, LuCheck, LuShieldCheck, LuLock } from 'react-icons/lu';
import { stripePromise } from '../lib/stripe';
import { createSubscription } from '../lib/api';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { navigateTo } from '../lib/useRequireAuth';

/*
 * /pay — custom checkout backed by a real Stripe Payment Element.
 * Monthly/yearly plans share one product; the worker maps the chosen
 * interval to the right price and returns a PaymentIntent client_secret.
 */

const PLANS = {
  month: { amount: 3.99, billWord: 'monthly', unit: '/month' },
  year:  { amount: 34.99, billWord: 'yearly', unit: '/year' },
};
const SAVE_PCT = Math.round((1 - PLANS.year.amount / (PLANS.month.amount * 12)) * 100);
const fmt = (n) => `$${n.toFixed(2)}`;

const Wordmark = ({ className = '' }) => (
  <span className={`wordmark ${className}`}>
    novix<span className="wordmark-dot">.</span>tv
  </span>
);

// Appearance API — themes the Payment Element to match Novix.
const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#6ea8ff',
    colorBackground: '#0f131b',
    colorText: '#f5f7fa',
    colorTextSecondary: '#8c9bb5',
    colorTextPlaceholder: '#5a6a85',
    colorDanger: '#ef6a6a',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      backgroundColor: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: 'none',
    },
    '.Input:focus': { border: '1px solid #6ea8ff', boxShadow: 'none' },
    '.Label': { color: '#8c9bb5', fontWeight: '500' },
  },
};

// ── Billing frequency tabs (above the payment method) ───────
function BillingCard({ selected, onClick, title, big, sub, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative text-left rounded-xl p-4 transition-colors cursor-default"
      style={{
        background: selected ? 'var(--surface-hover)' : 'var(--bg-elev)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--hairline)'}`,
      }}
    >
      {selected && <LuCheck className="w-4 h-4 absolute top-3 right-3" style={{ color: 'var(--accent)' }} />}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{big}</span>
        <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{sub}</span>
      </div>
    </button>
  );
}

function BillingTabs({ interval, onChange }) {
  return (
    <div className="mb-7">
      <p className="text-base font-bold mb-3" style={{ color: 'var(--fg)' }}>Billing frequency</p>
      <div className="grid grid-cols-2 gap-3">
        <BillingCard
          selected={interval === 'month'} onClick={() => onChange('month')}
          title="Pay monthly" big={fmt(PLANS.month.amount)} sub="/month"
        />
        <BillingCard
          selected={interval === 'year'} onClick={() => onChange('year')}
          title="Pay yearly" big={fmt(PLANS.year.amount)} sub="/year"
          badge={`Save ${SAVE_PCT}%`}
        />
      </div>
    </div>
  );
}

// ── Promo code (UI only for now — not yet wired to Stripe) ──
function PromoCode() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="text-sm font-medium cursor-default" style={{ color: 'var(--accent)' }}>
        + Add promo code
      </button>
    );
  }
  return (
    <div className="flex gap-2">
      <input
        value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code"
        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--hairline)', color: 'var(--fg)' }}
      />
      <button type="button" className="px-4 rounded-lg text-sm font-medium cursor-default"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--hairline-strong)', color: 'var(--fg)' }}>
        Apply
      </button>
    </div>
  );
}

// ── Left column: order summary ──────────────────────────────
function Summary({ interval }) {
  const plan = PLANS[interval];
  return (
    <div className="rounded-2xl p-7"
      style={{ background: 'linear-gradient(160deg, rgba(110,168,255,0.08), var(--surface))', border: '1px solid var(--hairline)' }}>
      <button onClick={() => window.history.back()}
        className="w-9 h-9 rounded-full flex items-center justify-center mb-7 cursor-default"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--hairline)' }}>
        <LuArrowLeft className="w-4 h-4" />
      </button>

      <p className="text-sm mb-2 cursor-default" style={{ color: 'var(--fg-muted)' }}>Your plan</p>
      <div className="text-4xl font-bold tracking-tight mb-2 cursor-default">{fmt(plan.amount)}</div>
      <p className="text-sm mb-7" style={{ color: 'var(--fg-muted)' }}>
        We'll bill you {fmt(plan.amount)} {plan.billWord}, unless you cancel.
      </p>

      {/* plan line item */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-lg"
          style={{ background: 'rgba(110,168,255,0.14)', color: 'var(--accent)' }}>
          N
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Novix TV</span>
            <span className="text-sm font-medium">{fmt(plan.amount)}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
            Plex, Jellyfin, Emby &amp; Live TV in one app.
          </p>
        </div>
      </div>

      <div className="mb-5">
        <PromoCode />
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span style={{ color: 'var(--fg-muted)' }}>Subtotal</span>
          <span>{fmt(plan.amount)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-3" style={{ borderTop: '1px solid var(--hairline)' }}>
          <span>Total due today</span>
          <span>{fmt(plan.amount)}</span>
        </div>
      </div>
    </div>
  );
}

// ── The payment form (inside <Elements>) ────────────────────
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/success` },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    window.history.pushState({}, '', '/success');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && <p className="text-sm mt-4" style={{ color: 'var(--danger)' }}>{error}</p>}

      <button type="submit" disabled={!stripe || submitting}
        className="btn-primary w-full mt-7"
        style={{ padding: '0.85rem', opacity: !stripe || submitting ? 0.6 : 1 }}>
        <LuLock className="w-4 h-4" /> {submitting ? 'Processing…' : 'Subscribe'}
      </button>

      <p className="text-center text-xs mt-4 flex items-center justify-center gap-1.5" style={{ color: 'var(--fg-dim)' }}>
        <LuShieldCheck className="w-3.5 h-3.5" /> Payments secured by Stripe
      </p>
    </form>
  );
}

// Skeleton that mirrors the Payment Element's shape so the swap-in is seamless.
function PaymentSkeleton() {
  const bar = (cls) => (
    <div className={`rounded-lg ${cls}`} style={{ background: 'var(--bg-elev)' }} />
  );
  return (
    <div className="animate-pulse">
      <div className="flex gap-2 mb-4">
        {bar('h-10 flex-1')}
        {bar('h-10 flex-1')}
        {bar('h-10 flex-1')}
      </div>
      <div className="space-y-3">
        {bar('h-11 w-full')}
        <div className="flex gap-3">
          {bar('h-11 flex-1')}
          {bar('h-11 flex-1')}
        </div>
      </div>
      {bar('h-12 w-full mt-7')}
    </div>
  );
}

function Notice({ children, tone }) {
  return (
    <div className="rounded-xl p-5 text-sm"
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--hairline)',
        color: tone === 'danger' ? 'var(--danger)' : 'var(--fg-muted)',
      }}>
      {children}
    </div>
  );
}

// ── Page shell: auth + (re)loading the client secret ────────
export default function Pay() {
  const { user, loading: authLoading } = useAuth();
  const [interval, setInterval] = useState('month');
  const [clientSecret, setClientSecret] = useState(null);
  const [initError, setInitError] = useState(null);
  const [allowed, setAllowed] = useState(null); // null = checking access

  // Access guard: must be signed in AND not already subscribed; else redirect home.
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigateTo('/'); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('auth_id', user.id)
        .single();
      if (cancelled) return;
      const s = data?.subscription_status;
      if (s === 'active' || s === 'past_due') {
        navigateTo('/'); // already subscribed
        return;
      }
      setAllowed(true);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // Create (or recreate, on plan switch) the subscription once access is granted.
  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setClientSecret(null);
    setInitError(null);
    createSubscription(interval)
      .then((data) => { if (!cancelled) setClientSecret(data.clientSecret); })
      .catch((err) => { if (!cancelled) setInitError(err.message); });
    return () => { cancelled = true; };
  }, [allowed, interval]);

  // Don't render checkout until access is confirmed (no flash for signed-out
  // or already-subscribed users while the redirect happens).
  if (allowed !== true) return null;

  let paymentArea;
  if (!stripePromise) {
    paymentArea = <Notice>Checkout isn't configured yet (missing publishable key).</Notice>;
  } else if (initError) {
    paymentArea = <Notice tone="danger">{initError}</Notice>;
  } else if (!clientSecret) {
    paymentArea = <PaymentSkeleton />;
  } else {
    paymentArea = (
      <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm />
      </Elements>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: summary */}
        <Summary interval={interval} />

        {/* Right: plan selection + payment */}
        <div>
          <Wordmark className="block mb-7" />
          <h1 className="text-3xl font-bold tracking-tight mb-1.5 cursor-default">Checkout</h1>
          <p className="text-sm mb-7" style={{ color: 'var(--fg-muted)' }}>
            Choose your plan and enter your details to subscribe.
          </p>

          <BillingTabs interval={interval} onChange={setInterval} />

          <p className="text-base font-bold mb-3" style={{ color: 'var(--fg)' }}>Payment method</p>
          {paymentArea}
        </div>
      </div>
    </div>
  );
}
