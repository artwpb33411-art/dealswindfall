/* -------------------------------------------------------
   Fix: Draft deals must always have display_order = 0
------------------------------------------------------- */

-- 1. Reset any bad drafts (legacy cleanup)
UPDATE deals
SET display_order = 0
WHERE status = 'Draft'
  AND display_order <> 0;

-- 2. Enforce invariant at DB level (safe + idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'draft_display_order_zero'
  ) THEN
    ALTER TABLE deals
    ADD CONSTRAINT draft_display_order_zero
    CHECK (
      (status = 'Draft' AND display_order = 0)
      OR
      (status <> 'Draft' AND display_order >= 0)
    );
  END IF;
END $$;
