-- ============================================
-- Track whether an active subscription is set to cancel at period end,
-- so the UI can show "Cancels on <date>" and offer a Resume action.
-- Additive — safe to run on the live DB.
-- ============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;
