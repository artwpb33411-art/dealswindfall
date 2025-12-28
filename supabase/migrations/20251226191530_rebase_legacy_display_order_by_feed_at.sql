/* -------------------------------------------------------
   Rebase legacy deals display_order using feed_at
   (one-time cleanup for better feed freshness)
------------------------------------------------------- */

WITH legacy AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY feed_at ASC, id ASC) AS rn
  FROM deals
  WHERE display_order < 1000000000000
)
UPDATE deals d
SET display_order = legacy.rn
FROM legacy
WHERE d.id = legacy.id;
