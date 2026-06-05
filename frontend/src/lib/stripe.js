import { loadStripe } from '@stripe/stripe-js';

// Publishable key is safe to expose to the browser.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY not set — checkout will not load.');
}

// loadStripe returns a promise; create it once at module scope.
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
