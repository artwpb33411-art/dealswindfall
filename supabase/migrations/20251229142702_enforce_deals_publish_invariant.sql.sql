-----Upto this is added in production database.

-- -------------------------------------------------------
-- Enforce invariant:
-- Draft     → published_at IS NULL
-- Published → published_at IS NOT NULL
-- -------------------------------------------------------

-- 1️⃣ Fix existing bad rows
UPDATE deals
SET published_at = NULL
WHERE status = 'Draft'
  AND published_at IS NOT NULL;

-- 2️⃣ Add constraint only if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'deals_publish_state_check'
  ) THEN
    ALTER TABLE deals
    ADD CONSTRAINT deals_publish_state_check
    CHECK (
      (status = 'Draft' AND published_at IS NULL)
      OR
      (status = 'Published' AND published_at IS NOT NULL)
    );
  END IF;
END
$$;
