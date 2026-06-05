-- ============================================
-- Subscription model tweaks for Novix TV
--   1. tier values: 'free' | 'basic'  ->  'free' | 'access'
--   2. add subscription_interval ('month' | 'year')
-- Additive / in-place — safe to run on the live DB.
-- ============================================

-- 1. Rename the paid tier from 'basic' to 'access'.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
UPDATE public.users SET subscription_tier = 'access' WHERE subscription_tier = 'basic';
ALTER TABLE public.users
  ADD CONSTRAINT users_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'access'));

-- 2. Store the billing interval so the UI can show monthly vs yearly.
--    Price is NOT stored — it's derived from the interval ($3.99 / $34.99).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_interval TEXT;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_subscription_interval_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_subscription_interval_check
  CHECK (subscription_interval IS NULL OR subscription_interval IN ('month', 'year'));
