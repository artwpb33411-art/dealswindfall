/* -------------------------------------------------------
   1. Add display_order column
------------------------------------------------------- */
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS display_order BIGINT;

/* -------------------------------------------------------
   2. Backfill existing published deals
   (freeze current visible order)
------------------------------------------------------- */
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY published_at DESC) AS rank
  FROM deals
  WHERE status = 'Published'
)
UPDATE deals d
SET display_order = ranked.rank
FROM ranked
WHERE d.id = ranked.id
  AND d.display_order IS NULL;

/* -------------------------------------------------------
   3. Backfill drafts (avoid NULLs)
------------------------------------------------------- */
UPDATE deals
SET display_order = 0
WHERE display_order IS NULL;

/* -------------------------------------------------------
   4. Lock the column
------------------------------------------------------- */
ALTER TABLE deals
ALTER COLUMN display_order SET NOT NULL;

/* -------------------------------------------------------
   5. Update auto_publish_runner()
   (assign display_order ONLY at first publish)
------------------------------------------------------- */
CREATE OR REPLACE FUNCTION auto_publish_runner()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  settings RECORD;
  state RECORD;
  picked RECORD;
  last_store TEXT;
BEGIN
  /* Load settings */
  SELECT * INTO settings
  FROM auto_publish_settings
  WHERE id = 1;

  SELECT * INTO state
  FROM auto_publish_state
  WHERE id = 1;

  /* Guardrails */
  IF settings.enabled IS FALSE THEN
    INSERT INTO auto_publish_logs(action, message)
    VALUES ('runner_skip', 'Auto-publish disabled.');
    RETURN;
  END IF;

  IF state.next_run IS NOT NULL AND state.next_run > NOW() THEN
    INSERT INTO auto_publish_logs(action, message)
    VALUES (
      'runner_skip',
      'Too early. Next run: ' || state.next_run || ', now=' || NOW()
    );
    RETURN;
  END IF;

  /* Last published store */
  SELECT store_name
  INTO last_store
  FROM deals
  WHERE status = 'Published'
  ORDER BY display_order DESC
  LIMIT 1;

  /* Pick ONE eligible draft */
  SELECT *
  INTO picked
  FROM deals
  WHERE status = 'Draft'
    AND exclude_from_auto = FALSE
    AND superseded_by_id IS NULL
    AND (
      store_name <> last_store
      OR NOT EXISTS (
        SELECT 1
        FROM deals d2
        WHERE d2.status = 'Draft'
          AND d2.exclude_from_auto = FALSE
          AND d2.superseded_by_id IS NULL
          AND d2.store_name <> last_store
      )
    )
  ORDER BY
    (
      random() *
      (
        100
        + CASE WHEN is_affiliate THEN 20 ELSE 0 END
        + COALESCE(affiliate_priority, 0) * 10
      )
    ) DESC,
    created_at ASC
  LIMIT 1;

  /* No eligible deal */
  IF picked.id IS NULL THEN
    INSERT INTO auto_publish_logs(action, message)
    VALUES ('runner_skip', 'No eligible draft deals found.');
    RETURN;
  END IF;

  /* Publish selected deal (SET display_order ONCE) */
  UPDATE deals
  SET
    status = 'Published',
    published_at = NOW(),
    feed_at = NOW(),
    display_order = EXTRACT(EPOCH FROM NOW()) * 1000
  WHERE id = picked.id
    AND display_order = 0;

  /* Update scheduler state */
  UPDATE auto_publish_state
  SET
    last_run   = NOW(),
    last_count = 1,
    next_run   = NOW() + (settings.interval_minutes || ' minutes')::interval,
    updated_at = NOW()
  WHERE id = 1;

  /* Log success */
  INSERT INTO auto_publish_logs(action, message)
  VALUES (
    'runner',
    'Published deal ID ' || picked.id ||
    ' (store=' || COALESCE(picked.store_name, 'n/a') || ')'
  );
END;
$$;
