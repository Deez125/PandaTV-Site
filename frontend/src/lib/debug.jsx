import { createContext, useContext, useState } from 'react';

/*
 * Lightweight client-only debug state, set from the DebugPanel.
 * Does NOT touch the database — purely for previewing UI states.
 */
const DebugContext = createContext(null);

export function DebugProvider({ children }) {
  // null = live (use real data). Otherwise: 'none' | 'monthly' | 'yearly'
  const [subOverride, setSubOverride] = useState(null);
  return (
    <DebugContext.Provider value={{ subOverride, setSubOverride }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  return useContext(DebugContext) || { subOverride: null, setSubOverride: () => {} };
}

// Resolve the subscription a page should display, honoring a debug override.
// Returns { status, tier, interval, periodEnd } or live values from userData.
export function resolveSubscription(userData, subOverride) {
  if (subOverride === 'none') {
    return { status: 'none', tier: 'free', interval: null, periodEnd: null };
  }
  if (subOverride === 'monthly' || subOverride === 'yearly') {
    const interval = subOverride === 'yearly' ? 'year' : 'month';
    const end = new Date();
    if (interval === 'year') end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);
    return { status: 'active', tier: 'access', interval, periodEnd: end.toISOString() };
  }
  // live
  return {
    status: userData?.subscription_status || 'none',
    tier: userData?.subscription_tier || 'free',
    interval: userData?.subscription_interval || null,
    periodEnd: userData?.current_period_end || null,
  };
}
