import { useEffect } from 'react';
import { useAuth } from './auth';

// App-wide client navigation (matches the pushState pattern used elsewhere).
export function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Redirect to `to` once auth has resolved if there's no signed-in user.
// Returns { user, loading } so callers can avoid flashing protected content.
export function useRequireAuth(to = '/') {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) navigateTo(to);
  }, [user, loading, to]);
  return { user, loading };
}
