import { useState, useEffect } from 'react';
import {
  LuArrowLeft, LuChevronDown, LuLibraryBig, LuLink, LuCreditCard,
  LuTv, LuMail, LuLifeBuoy,
} from 'react-icons/lu';

const SUPPORT_EMAIL = 'support@novix.tv';

const Wordmark = () => (
  <span className="wordmark" style={{ fontSize: '1.25rem' }}>
    novix<span className="wordmark-dot">.</span>tv
  </span>
);

const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// ─────────── Quick-help topic cards ───────────
const TOPICS = [
  {
    icon: LuLibraryBig,
    title: 'Connect your media',
    body: 'Link Plex, Jellyfin, or Emby so your whole library shows up in the app.',
    action: { label: 'Open Connected Services', to: '/settings?tab=services' },
  },
  {
    icon: LuTv,
    title: 'Set up live TV (IPTV)',
    body: 'Add an M3U playlist or Xtream Codes login to watch live channels.',
    action: { label: 'Add IPTV provider', to: '/settings?tab=services' },
  },
  {
    icon: LuLink,
    title: 'Link your TV',
    body: 'Enter the 4-digit code from your TV app to pair it with your account.',
    action: { label: 'Link a device', to: '/link' },
  },
  {
    icon: LuCreditCard,
    title: 'Billing & subscription',
    body: 'View your plan, switch between monthly and yearly, or cancel anytime.',
    action: { label: 'Manage subscription', to: '/settings?tab=subscription' },
  },
];

// ─────────── FAQ ───────────
const FAQ = [
  {
    q: 'What is NovixTV?',
    a: "NovixTV unifies your Plex, Jellyfin, Emby, and IPTV providers into one app, so all your content lives in a single, consistent interface on any device.",
  },
  {
    q: 'What devices are supported?',
    a: 'Smart TVs (Samsung, LG, Sony), iOS and Android phones and tablets, Apple TV, Google TV, Roku, Fire TV, and any modern web browser.',
  },
  {
    q: 'How do I connect my media libraries?',
    a: "Go to Settings → Connected Services and link your Plex, Jellyfin, or Emby account. Your library appears in the app right away. Note: Jellyfin and Emby servers must be publicly reachable (not a local 192.168.x.x address). Use Cloudflare Tunnel, Tailscale Funnel, or a reverse proxy to expose yours.",
  },
  {
    q: 'Can I use my own IPTV provider?',
    a: 'Yes. NovixTV supports M3U playlists and Xtream Codes. Add your provider under Settings → Connected Services and your live channels integrate automatically.',
  },
  {
    q: 'How do I link my TV?',
    a: 'Open the NovixTV app on your TV to get a 4-digit code, then go to Link Device on the website (while signed in) and enter it. Your TV pairs to your account instantly.',
  },
  {
    q: 'How does billing work?',
    a: 'NovixTV is a single subscription billed monthly ($3.99) or yearly ($34.99). Manage everything from Settings → Subscription, where you can switch plans or cancel anytime, and you keep access until the end of the period you paid for.',
  },
  {
    q: 'Is there a free trial?',
    a: "Yes, new subscribers get a 7-day free trial. Cancel anytime during the trial and you won't be charged.",
  },
  {
    q: 'I connected a server but nothing shows up.',
    a: "Most often the server isn't reachable from the internet. Confirm it's publicly accessible, double-check the URL (including the port), and make sure the username/token is correct. If it's still empty, reach out and we'll help dig in.",
  },
];

function FaqRow({ item, open, onToggle }) {
  return (
    <div className="border-b hairline last:border-0">
      <button onClick={onToggle} className="w-full py-4 flex items-center justify-between text-left gap-4">
        <span className="font-medium text-sm" style={{ color: 'var(--fg)' }}>{item.q}</span>
        <LuChevronDown
          className="w-4 h-4 shrink-0 transition-transform"
          style={{ color: 'var(--fg-dim)', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: open ? '320px' : '0' }}>
        <p className="text-sm leading-relaxed pb-4 max-w-2xl" style={{ color: 'var(--fg-muted)' }}>{item.a}</p>
      </div>
    </div>
  );
}

export default function Help() {
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <nav className="sticky top-0 z-40" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--hairline)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="btn-ghost text-sm">← Back</button>
          <button onClick={() => navigate('/')} className="flex items-center"><Wordmark /></button>
        </div>
      </nav>

      {/* Content */}
      <div className={`max-w-5xl mx-auto px-6 py-12 ${mounted ? 'auth-enter' : 'auth-enter-pre'}`}>
        <div className="mb-10">
          <div className="eyebrow mb-3">Support</div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ letterSpacing: '-0.025em' }}>
            Help &amp; Support
          </h1>
          <p className="mt-3 text-sm max-w-xl leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Everything you need to get NovixTV set up and running. Browse the common topics
            below, or reach out and we'll lend a hand.
          </p>
        </div>

        {/* Topic cards */}
        <div className="grid sm:grid-cols-2 gap-3 mb-14">
          {TOPICS.map(({ icon: Icon, title, body, action }) => (
            <div key={title} className="rounded-xl p-5" style={{ background: 'var(--bg-elev)', border: '1px solid var(--hairline)' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: 'rgba(110,168,255,0.12)', color: 'var(--accent-bright)' }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--fg)' }}>{title}</h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--fg-muted)' }}>{body}</p>
                  <button
                    onClick={() => navigate(action.to)}
                    className="text-xs font-medium"
                    style={{ color: 'var(--accent-bright)' }}
                  >
                    {action.label} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-xs uppercase tracking-[0.18em] font-medium mb-2" style={{ color: 'var(--fg-muted)' }}>
            Frequently asked
          </h2>
          <div>
            {FAQ.map((item, i) => (
              <FaqRow key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <div
            className="rounded-2xl p-7"
            style={{ background: 'linear-gradient(160deg, rgba(110,168,255,0.08), var(--bg-elev))', border: '1px solid var(--hairline)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(110,168,255,0.14)', color: 'var(--accent-bright)' }}>
                <LuLifeBuoy className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>Still need help?</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--fg-muted)' }}>
                  Can't find what you're looking for? Send us a message and we'll get back to you,
                  usually within a day.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="btn-primary inline-flex"
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
                >
                  <LuMail className="w-4 h-4" /> Email support
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
