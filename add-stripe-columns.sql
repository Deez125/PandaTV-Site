-- ============================================
-- Stripe subscription columns for Novix TV
-- Single paid plan (customer self-serve).
-- Additive migration — safe to run on the live DB (no drops).
-- ============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status     TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS current_period_end      TIMESTAMP WITH TIME ZONE;

-- Allowed subscription_status values (Stripe-driven):
--   none      — never subscribed
--   active    — paying (or trialing)
--   past_due  — payment failed, still has access pending retry
--   cancelled — subscription ended
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_subscription_status_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_subscription_status_check
  CHECK (subscription_status IN ('none', 'active', 'past_due', 'cancelled'));

-- Look up users by Stripe customer fast (webhook path).
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON public.users (stripe_customer_id);
