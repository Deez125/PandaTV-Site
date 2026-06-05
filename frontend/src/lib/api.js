import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const API_KEY = import.meta.env.VITE_API_KEY || '';

async function fetchApi(endpoint, options = {}) {
  const { method = 'GET', body = null } = options;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// --- Customer self-serve (Supabase JWT auth, not the admin key) ---

// Create a Stripe subscription for the logged-in user and get the
// PaymentIntent client_secret to confirm with the Payment Element.
export async function createSubscription(interval = 'month') {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be signed in to subscribe.');

  const response = await fetch(`${API_BASE}/api/subscription/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ interval }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Could not start checkout');
  }
  return response.json();
}

// Shared: POST to the worker authed with the user's Supabase JWT.
async function authedPost(path, body) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be signed in.');
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body || {}),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Preview the prorated amount due to switch interval (makes no change).
export function previewSwitchPlan(interval) {
  return authedPost('/api/subscription/change', { interval, preview: true });
}

// Switch billing interval — charges the prorated difference immediately.
export function switchPlan(interval) {
  return authedPost('/api/subscription/change', { interval });
}

// Cancel at period end — keeps access until the renewal date.
export function cancelSubscription() {
  return authedPost('/api/subscription/cancel', {});
}

// Undo a pending cancellation.
export function resumeSubscription() {
  return authedPost('/api/subscription/cancel', { resume: true });
}

export async function getUsers() {
  return fetchApi('/api/users');
}

export async function createUser(data) {
  return fetchApi('/api/users', { method: 'POST', body: data });
}

export async function updateUser(id, data) {
  return fetchApi(`/api/users/${id}`, { method: 'PUT', body: data });
}

export async function deleteUser(id) {
  return fetchApi(`/api/users/${id}`, { method: 'DELETE' });
}

export async function createCheckout(id, priceId = null) {
  const body = priceId ? { price_id: priceId } : {};
  return fetchApi(`/api/users/${id}/checkout`, { method: 'POST', body });
}

export async function kickUser(id) {
  return fetchApi(`/api/users/${id}/kick`, { method: 'POST' });
}

export async function getActivity() {
  return fetchApi('/api/activity');
}

export async function getPlexFriends() {
  return fetchApi('/api/plex/friends');
}

export async function getPlexLibraries() {
  return fetchApi('/api/plex/libraries');
}

export async function healthCheck() {
  return fetchApi('/api/health');
}
