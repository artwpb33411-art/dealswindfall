-- ------------------------------------------------------------
-- Extend auto_publish_settings with bumping rules
-- ------------------------------------------------------------

ALTER TABLE public.auto_publish_settings
ADD COLUMN IF NOT EXISTS bump_enabled boolean NOT NULL DEFAULT true,

ADD COLUMN IF NOT EXISTS bump_cooldown_hours integer NOT NULL DEFAULT 12,

ADD COLUMN IF NOT EXISTS max_bumps_per_deal integer NULL,

ADD COLUMN IF NOT EXISTS allow_bump_if_expired boolean NOT NULL DEFAULT false;

-- ------------------------------------------------------------
-- Ensure there is a settings row (id = 1)
-- ------------------------------------------------------------

INSERT INTO public.auto_publish_settings (
  id,
  enabled,
  deals_per_cycle,
  interval_minutes,
  bump_enabled,
  bump_cooldown_hours,
  max_bumps_per_deal,
  allow_bump_if_expired
)
VALUES (
  1,
  false,
  1,
  10,
  true,
  12,
  NULL,
  false
)
ON CONFLICT (id) DO NOTHING;
