/* -------------------------------------------------------
   Fix: Draft deals must always have display_order = 0
------------------------------------------------------- */

-- 1. Reset any bad drafts (caused by legacy rebase)
UPDATE deals
SET display_order = 0
WHERE status = 'Draft'
  AND display_order <> 0;

-- 2. (Optional but recommended) Enforce invariant at DB level
-- Draft -> display_order = 0
-- Published -> display_order >= 0
ALTER TABLE deals
ADD CONSTRAINT IF NOT EXISTS draft_display_order_zero
CHECK (
  (status = 'Draft' AND display_order = 0)
  OR
  (status <> 'Draft' AND display_order >= 0)
);
